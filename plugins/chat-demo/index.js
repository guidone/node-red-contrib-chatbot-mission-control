import React from 'react';
import { Icon } from 'rsuite';

import { plug } from '../../lib/code-plug';

import './style.scss';


import classNames from 'classnames';

const Message = ({ children, inbound = true }) => {

  return (
    <li className={classNames('ui-chat-message', { clearfix: inbound, inbound, outbound: !inbound })}>
      {children}
    </li>
  );

};

const Messages = ({ children }) => {

  return (
    <div className="ui-chat-messages chat-history">
      <ul>
        {children}
      </ul>
    </div>
  );
};


const Content = ({ children }) => {

  return (
    <div className="ui-chat-content message">{children}</div>
  );
}

const Metadata = ({ children }) => {
  return (
    <div className="ui-chat-metadata">
      {children}
    </div>
  );
}

const ChatWindow = ({ children }) => {

  return (
    <div className="ui-chat-window chat">{children}</div>
  );

}


const MessageComposer = () => {
  return (
    <div className="ui-chat-message-composer">
        <textarea name="message-to-send" id="message-to-send" placeholder ="Type your message" rows="3"></textarea>
                
        <i className="fa fa-file-o"></i> &nbsp;&nbsp;&nbsp;
        <i className="fa fa-file-image-o"></i>
        
        <button>Send</button>

      </div>
  );

}

const MessageDate = ({ children }) => {

  return (
    <span className="ui-chat-message-date">{children}</span>
  );
}

const MessageUser = ({ children }) => {
  return (
    <div className="ui-chat-message-user">{children}</div>
  );
}

const UserStatus = ({ online = true }) => {
  return (
    <Icon icon="circle" className={classNames('ui-chat-status', { online, offline: !online })} />
  )
}

// <div className="message other-message float-right">

// <div className="message my-message">

// <div className="message-data align-right">
class ChatPage extends React.Component {
  render() {
    return (
      <div className="chat-demo">
          
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
    );


  }


}

plug('sidebar', null, { id: 'chat-demo', label: 'Chat Demo', url: '/mc/chat', icon: 'shield' })
plug('pages', ChatPage, { url: '/mc/chat', id: 'chat', title: 'Chat Demo' });

