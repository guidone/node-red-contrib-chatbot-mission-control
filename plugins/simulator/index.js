import React from 'react';
import _ from 'lodash';

import { plug } from '../../lib/code-plug';
import Panel from '../../src/components/grid-panel';
import withSocket from '../../src/wrappers/with-socket';
import withActiveChatbots from '../../src/wrappers/with-active-chatbots';
import withState from '../../src/wrappers/with-state';
import useSocket from '../../src/hooks/socket';

import {
  Messages,
  ChatWindow,
  MessageComposer
} from '../../src/components/chat';



import Message from '../../src/components/generic-chat-message';

import './simulator.scss';
import PanelMenu from './views/panel-menu';
import handleMessages from './reducer';

import SimulatorContext from './context';

const useSimulator = ({ activeChatbots }) => {

  const { state, dispatch, sendMessage } = useSocket(handleMessages, {
    messages: {},
    transport: !_.isEmpty(activeChatbots) ? activeChatbots[0].transport : null,
    nodeId: !_.isEmpty(activeChatbots) ? activeChatbots[0].nodeId : null,
    globals: null,
    language: 'en',
    user: null
  });

  return {
    state,
    dispatch,
    sendMessage: (text, { echo = true} = {}) => {
      const { transport, nodeId, language, user: impersonatedUser } = state;
      sendMessage('simulator', {
        transport,
        nodeId,
        language,
        userId: impersonatedUser != null ? impersonatedUser.userId : 42,
        username: impersonatedUser != null ? impersonatedUser.username : 'testUser',
        firstName: impersonatedUser != null ? impersonatedUser.first_name : null,
        lastName: impersonatedUser != null ? impersonatedUser.last_name : null,
        payload: {
          content: text,
          type: 'message'
        },
        simulatorOptions: {
          echo
        }
      });
    }
  };

}



const SimulatorWidget = ({ activeChatbots, user }) => {
  const { state, dispatch, sendMessage } = useSimulator({ activeChatbots });
  const { messages, transport, nodeId, language, user: impersonatedUser } = state;
  const loading = activeChatbots == null;

  const clickHandler = (obj) => {
    if (_.isObject(obj) && (obj.type === 'postback' || obj.type === 'quick-reply')) {
      // don't show on simulator the value sent by the button
      sendMessage(obj.value, { echo: false });
    }
  }

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
        <SimulatorContext.Provider value={state}>
        <ChatWindow>
          <Messages>
            {messages[transport] != null && messages[transport].map(message => {
              if (_.isArray(message)) {
                // multiple messages are always inbound
                return (
                  <Message
                    onClick={clickHandler}
                    key={message.map(message => message.messageId).join()}
                    message={message.map(message => ({ ...message, username: 'chatbot' }))}
                  />
                );
              } else {
                return (
                  <Message
                    onClick={clickHandler}
                    key={message.messageId}
                    message={!message.inbound ? { ...message, username: 'chatbot' } : message }
                  />
                );
              }
            })}
          </Messages>
          <MessageComposer
            onSend={message => sendMessage(message)}
            onClear={() => dispatch({ type: 'clear', transport })}
          />
        </ChatWindow>
        </SimulatorContext.Provider>
      )}
    </Panel>
  );
};

plug(
  'widgets',
  withState(withActiveChatbots(SimulatorWidget), 'user'),
  { x: 0, y: 0, w: 2, h: 8, isResizable: true, id: 'simulator-widget' }
);
