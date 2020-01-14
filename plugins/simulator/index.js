import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Placeholder, SelectPicker, Toggle } from 'rsuite';


import { plug } from '../../lib/code-plug';
import Panel from '../../src/components/grid-panel';
import withSocket from '../../src/wrappers/with-socket';
import withActiveChatbots from '../../src/wrappers/with-active-chatbots';
import withState from '../../src/wrappers/with-state';
import useSocket from '../../src/hooks/socket';
import Transport from '../../src/components/transport';

import { Message, Messages, Content, Metadata, ChatWindow, MessageComposer, MessageDate, MessageUser, UserStatus, 
  MessageText,
  MessageButtons,
  MessagePhoto,
  GenericMessage 
} from '../../src/components/chat';

import './simulator.scss';


const TransportValue = (value, item) => <Transport transport={item.transport}/>;

const MenuItem = (label, item) => (
  <div className="picker-item-transport">
    <b>{item.name}</b><br/>
    <Transport transport={item.transport}/>
    &nbsp;<em>(id: {item.nodeId})</em>
  </div>
); 

const PanelMenu = ({ nodeId, onChange, data }) => (
  <div className="simulator-transport-menu">
    <SelectPicker 
      renderValue={TransportValue}
      renderMenuItem={MenuItem}
      searchable={false}
      size="sm"
      cleanable={false}
      appearance="subtle"
      value={nodeId}
      onChange={nodeId => onChange(data.find(item => item.nodeId === nodeId))}
      data={data}
    />      
  </div>
);


const handleMessages = (state, action) => {
  switch(action.type) {    
    case 'socket.message':
      // add message to the right queue
      const { payload, topic } = action;
      // exit if not from simulator
      if (topic !== 'simulator') {
        return state;
      }
      const current = _.isArray(state.messages[payload.transport]) ? state.messages[payload.transport] : [];
      const messages = { 
        ...state.messages, 
        [payload.transport]: [...current, payload]
      }
      return { ...state, messages };
    
    case 'globals':
      // set globals
      return { ...state, globals: action.globals };
      
    case 'chatBot':
      // switch transport
      return { ...state, transport: action.chatBot.transport, nodeId: action.chatBot.nodeId };

    default:
      return state; 
  }
};



const SimulatorWidget = ({ sendMessage, activeChatbots, user }) => {
  const { state, dispatch } = useSocket(handleMessages, { 
    messages: {},
    transport: !_.isEmpty(activeChatbots) ? activeChatbots[0].transport : null,
    nodeId: !_.isEmpty(activeChatbots) ? activeChatbots[0].nodeId : null,
    globals: null 
  });

  const { messages, transport, nodeId } = state; 
  const loading = activeChatbots == null;

  return (
    <Panel 
      title="Chat Simulator" 
      className="chat-simulator"
      menu={!loading && <PanelMenu 
        nodeId={nodeId}
        transport={transport} 
        data={activeChatbots.map(chatbot => ({ value: chatbot.nodeId, label: chatbot.transport, ...chatbot }))}
        onChange={chatBot => dispatch({ type: 'chatBot', chatBot })}
      />}
    >      
      {!loading && (
        <ChatWindow>
          <Messages>
            {messages[transport] != null && messages[transport].map(message => (
              <GenericMessage 
                key={message.messageId} 
                message={!message.inbound ? { ...message, username: 'chatbot'} : message } 
              />
            ))}
          </Messages>
          <MessageComposer
            onSend={message => {
              sendMessage('simulator', { 
                transport, 
                nodeId,
                userId: user.id,
                username: user.username,
                payload: {
                  content: message, 
                  type: 'message'
                }
              });
            }}
          /> 
        </ChatWindow>
      )}
    </Panel>
  );
};

plug(
  'widgets', 
  withState(withActiveChatbots(withSocket(SimulatorWidget)), 'user'), 
  { x: 0, y: 0, w: 2, h: 8, isResizable: true, id: 'simulator-widget' }
);