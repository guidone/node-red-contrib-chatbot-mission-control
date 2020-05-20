import React from 'react';
import _ from 'lodash';

import { plug } from '../../lib/code-plug';
import Panel from '../../src/components/grid-panel';
import withSocket from '../../src/wrappers/with-socket';
import withActiveChatbots from '../../src/wrappers/with-active-chatbots';
import withState from '../../src/wrappers/with-state';
import useSocket from '../../src/hooks/socket';
import useReducer from '../../src/hooks/use-reducer';

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

  const { state, dispatch } = useReducer({
    simulator: {
      messages: {},
      transport: !_.isEmpty(activeChatbots) ? activeChatbots[0].transport : null,
      nodeId: !_.isEmpty(activeChatbots) ? activeChatbots[0].nodeId : null,
      globals: null,
      language: 'en',
      user: null
    }
  });

  const { sendMessage } = useSocket(
    () => {},
    {},
    (topic, payload) => {
      console.log('arrivo2', topic, payload)
      if (topic === 'simulator') {
        dispatch({ type: 'message', payload, topic });
      }
    }
  );

  return {
    state,
    dispatch,
    sendMessage: (text, { echo = true } = {}) => {
      const { transport, nodeId, language, user: impersonatedUser } = state.simulator;
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
  const { state: { simulator }, dispatch, sendMessage } = useSimulator({ activeChatbots });
  const { messages, transport, nodeId, language, user: impersonatedUser } = simulator;
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
        <SimulatorContext.Provider value={simulator}>
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
  { x: 0, y: 0, w: 2, h: 8, isResizable: true, id: 'simulator-widget', permission: 'simulator' }
);


// TODO move from here
plug('reducers', (state, action) => {
  if (action.type === 'default') {
    return { ...state, [action.key]: action.value };
  }
  return state;
});


plug('reducers', handleMessages);



plug(
  'permissions',
  null,
  {
    permission: 'simulator',
    name: 'Chat Simulator',
    description: 'Access to chat simulator',
    group: 'General'
  }
);
