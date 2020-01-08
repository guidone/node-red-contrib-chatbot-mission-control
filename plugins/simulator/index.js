import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Placeholder, SelectPicker, Toggle } from 'rsuite';


import { plug } from '../../lib/code-plug';
import Panel from '../../src/components/grid-panel';
import withSocket from '../../src/wrappers/with-socket';
import withActiveChatbots from '../../src/wrappers/with-active-chatbots';
import useSocket from '../../src/hooks/socket';
import Transport from '../../src/components/transport';

import { Message, Messages, Content, Metadata, ChatWindow, MessageComposer, MessageDate, MessageUser, UserStatus, 
  MessageText,
  MessageButtons,
  MessagePhoto,
  GenericMessage 
} from '../../src/components/chat';

import './simulator.scss';

const Transports = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'slack', label: 'Slack' },


]

const TransportValue = (value, item) => {

  console.log('valie', value, item)
  return (
    <Transport transport={value}/>
  )

} 

const MenuItem = (label, item) => {

  return (
    <div className="picker-item-transport">
      <Transport transport={item.value}/>
      &nbsp;<em>(id: {item.nodeId})</em>
    </div>

  );

} 


const PanelMenu = ({ transport, onChange, data }) => {

  return (
    <div className="simulator-transport-menu">
      <SelectPicker 
        renderValue={TransportValue}
        renderMenuItem={MenuItem}
        searchable={false}
        size="sm"
        cleanable={false}
        appearance="subtle"
        value={transport}
        onChange={onChange}
        data={data}
      />
      
      
    </div>
  );

};

const handleMessages = (state, action) => {
  switch(action.type) {
    
    case 'socket.message':
      // add message to the right queue
      const { payload } = action;
      const current = _.isArray(state.messages[payload.transport]) ? state.messages[payload.transport] : [];
      const messages = { 
        ...state.messages, 
        [payload.transport]: [...current, payload]
      }
      return { ...state, messages };
    
    case 'globals':
      // set globals
      return { ...state, globals: action.globals };
      
    case 'transport':
      // switch transport
      return { ...state, transport: action.transport };

    default:
      return state; 
  }
};



const SimulatorWidget = ({ sendMessage, activeChatbots }) => {
  const { state, dispatch } = useSocket(handleMessages, { 
    messages: {},
    transport: !_.isEmpty(activeChatbots) ? activeChatbots[0].transport : null,
    nodeId: !_.isEmpty(activeChatbots) ? activeChatbots[0].nodeId : null,
    globals: null 
  });

  const { messages, transport, nodeId } = state; 
  const loading = activeChatbots == null;

  console.log('-->', messages[transport])
  console.log('availableTransports', activeChatbots)

  return (
    <Panel 
      title="Chat Simulator" 
      className="chat-simulator"
      menu={!loading && <PanelMenu 
        transport={transport} 
        data={activeChatbots.map(chatbot => ({ value: chatbot.transport, label: chatbot.transport, nodeId: chatbot.nodeId }))}
        onChange={value => dispatch({ type: 'transport', transport: value })}
      />}
    >
      {loading && (
        <div>loading</div>
      )}
      
      {!loading && (
        <ChatWindow>
          <Messages>
            {messages[transport] != null && messages[transport].map(message => (
              <GenericMessage key={message.messageId} message={message} />
            ))}
          </Messages>
          <MessageComposer
            onSend={message => {
              sendMessage('simulator', { 
                transport, 
                nodeId,
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

plug('widgets', withActiveChatbots(withSocket(SimulatorWidget)), { x: 0, y: 0, w: 2, h: 8, isResizable: true, id: 'simulator-widget' });