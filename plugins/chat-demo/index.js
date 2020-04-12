import React from 'react';
import { Icon } from 'rsuite';
import moment from 'moment';

import { plug } from '../../lib/code-plug';

import './style.scss';

import Panel from '../../src/components/grid-panel';
import GenericMessage from '../../src/components/generic-chat-message';

import useSocket from '../../src/hooks/socket';


import classNames from 'classnames';



// <div className="message other-message float-right">

// <div className="message my-message">

// <div className="message-data align-right">
class ChatPage extends React.Component {
  render() {
    return (
      <div className="chat-demo" style={{ padding: 50}}>

         <div style={{width: '400px'}}>
      <ChatWindow>
        <Messages>
          <Message inbound>
            <Metadata>
              <MessageDate>10:10 AM, Today</MessageDate> &nbsp; &nbsp;
              <MessageUser>Olia</MessageUser> <UserStatus />

            </Metadata>
            <Content>
              Hi Vincent, how are you? How is the project coming along?
            </Content>
          </Message>

          <Message inbound={false}>
            <Metadata>
              <MessageUser><UserStatus /> Vincent</MessageUser>
              <MessageDate>10:12 AM, Today</MessageDate>
            </Metadata>
            <Content>
              Are we meeting today? Project has been already finished and I have results to show you.
            </Content>
          </Message>

          <Message inbound>
            <Metadata>
              <MessageDate>10:14 AM, Today</MessageDate> &nbsp; &nbsp;
              <MessageUser>Olia</MessageUser> <UserStatus/>

            </Metadata>
            <Content>
              Well I am not sure. The rest of the team is not here yet. Maybe in an hour or so? Have you faced any problems at the last phase of the project?
            </Content>
          </Message>

          <Message inbound={false}>
            <Metadata>
              <MessageUser><UserStatus/> Vincent</MessageUser>
              <MessageDate>10:20 AM, Today</MessageDate>
            </Metadata>
            <Content>
              Actually everything was fine. I'm very excited to show this to our team.
            </Content>
          </Message>

          <Message inbound>
            <Metadata>
              <MessageUser><UserStatus online={false} /> Vincent</MessageUser>
              <MessageDate>10:31 AM, Today</MessageDate>
            </Metadata>
          </Message>

      </Messages>

      <MessageComposer/>

    </ChatWindow>
    </div>



      </div>
    );


  }


}


const handleMessages = (state, action) => {
  switch(action.type) {
    case 'socket.message':
      if (action.topic === 'message.out') {
        const payload = _.isArray(action.payload) ? action.payload : [action.payload];
        return {
          ...state,
          lastMessage: payload[payload.length - 1]
        };
      }
      return state;
    default:
      return state;
  }
};


import { Message, Messages, Content, Metadata, ChatWindow, MessageComposer, MessageDate, MessageUser, UserStatus,
  MessageText,
  MessageButtons,
  MessagePhoto
} from '../../src/components/chat';


const LastMessageWidget = () => {

  const { state, dispatch } = useSocket(handleMessages, { lastMessage: null });
  const { lastMessage } = state;
  console.log('lastMes', lastMessage)
  return (
    <Panel
      title="Last Message"
      className="widget-last-message"
      nopadding
    >
      <ChatWindow style={{ height: '100%' }}>
        <Messages>
          {lastMessage != null && <GenericMessage key={lastMessage.messageId} message={lastMessage} />}
        </Messages>
      </ChatWindow>
    </Panel>
  );
}

plug('widgets', LastMessageWidget, { x: 0, y: 0, w: 2, h: 8,  isResizable: false, id: 'last-message' })

plug('sidebar', null, { id: 'chat-demo', label: 'Chat Demo', url: '/mc/chat', icon: 'shield' })
plug('pages', ChatPage, { url: '/mc/chat', id: 'chat', title: 'Chat Demo' });
