import React from 'react';
import _ from 'lodash';

import { plug } from '../../lib/code-plug';
import Panel from '../../src/components/grid-panel';
import withSocket from '../../src/wrappers/with-socket';
import withActiveChatbots from '../../src/wrappers/with-active-chatbots';
import withState from '../../src/wrappers/with-state';
import useSocket from '../../src/hooks/socket';


import { 
  Message, 
  Messages, 
  Content, 
  Metadata, 
  ChatWindow, 
  MessageComposer, 
  MessageDate, 
  MessageUser, 
  UserStatus, 
  MessageText,
  MessageButtons,
  MessagePhoto,
  GenericMessage 
} from '../../src/components/chat';

import './simulator.scss';
import PanelMenu from './views/panel-menu';
import handleMessages from './reducer';

const SimulatorWidget = ({ sendMessage, activeChatbots, user }) => {
  const { state, dispatch } = useSocket(handleMessages, { 
    messages: {},
    transport: !_.isEmpty(activeChatbots) ? activeChatbots[0].transport : null,
    nodeId: !_.isEmpty(activeChatbots) ? activeChatbots[0].nodeId : null,
    globals: null,
    language: 'en',
    user: null 
  });
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