import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { Placeholder, SelectPicker, Toggle, Icon, IconButton, Modal, Button, FormGroup, ControlLabel, Form, FormControl, Portal } from 'rsuite';


import { plug } from '../../lib/code-plug';
import Panel from '../../src/components/grid-panel';
import withSocket from '../../src/wrappers/with-socket';
import withActiveChatbots from '../../src/wrappers/with-active-chatbots';
import withState from '../../src/wrappers/with-state';
import useSocket from '../../src/hooks/socket';
import Transport from '../../src/components/transport';
import LanguagePicker from '../../src/components/language-picker';
import UserAutocomplete from '../../src/components/user-autocomplete';


import Language from '../../src/components/language';

import SimulatorParamsModal from './views/simulator-modal';

import { Message, Messages, Content, Metadata, ChatWindow, MessageComposer, MessageDate, MessageUser, UserStatus, 
  MessageText,
  MessageButtons,
  MessagePhoto,
  GenericMessage 
} from '../../src/components/chat';

import './simulator.scss';





// TODO move panelmenu to different file

const PanelMenu = ({ user, language, nodeId, activeChatbots, onChange, data, dispatch }) => {
  console.log('refresh panel menu')
  
  const [params, setParams] = useState(null);


  return (
    <div className="simulator-transport-menu cancel-drag">
      {params != null && (
        
        <SimulatorParamsModal 
          activeChatbots={activeChatbots}
          params={params}
          onCancel={() => setParams(null)}
          onSubmit={params => {
            dispatch({ type: 'params', params });
            setParams(null);
          }}
        />
              
      )}
      <div className="meta">
        {user != null && (
          <div className="user">{user.username} <em>({user.userId})</em></div>
        )}
        {user == null && <div className="user">Test User</div>}
        <Language>{language}</Language>
      </div>
      
      <IconButton 
        appearance="subtle" 
        icon={<Icon icon="cog" />}
        onClick={() => setParams({ user: user, language, nodeId })} 
        style={{ marginTop: '-3px', marginRight: '1px' }}
      />
    </div>
  );
  
}


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
    
  
    case 'params':
      const { params } = action;
      return { 
        ...state, 
        transport: params.chatBot.transport, 
        nodeId: params.chatBot.nodeId,
        language: params.language,
        user: params.user
      };

    default:
      return state; 
  }
};



const SimulatorWidget = ({ sendMessage, activeChatbots, user }) => {
  const { state, dispatch } = useSocket(handleMessages, { 
    messages: {},
    transport: !_.isEmpty(activeChatbots) ? activeChatbots[0].transport : null,
    nodeId: !_.isEmpty(activeChatbots) ? activeChatbots[0].nodeId : null,
    globals: null,
    language: 'en',
    user: null 
  });
  console.log('STATOP', state)
  const { messages, transport, nodeId, language, user: impersonatedUser } = state; 
  const loading = activeChatbots == null;

  return (
    <Panel 
      title="Chat Simulator" 
      className="chat-simulator"
      menu={!loading && <PanelMenu
        user={impersonatedUser}
        language={language} 
        nodeId={nodeId}
        transport={transport}
        dispatch={dispatch} 
        activeChatbots={activeChatbots}        
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
                language,
                userId: impersonatedUser != null ? impersonatedUser.id : 42,
                username: impersonatedUser != null ? impersonatedUser.username : 'testUser',
                firstName: impersonatedUser != null ? impersonatedUser.first_name : null,
                lastName: impersonatedUser != null ? impersonatedUser.last_name : null,
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