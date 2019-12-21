import React from 'react';
import { Icon } from 'rsuite';
import classNames from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';

import './chat.scss';

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


const Content = ({ children, firstOfGroup = false }) => {

  return (
    <div className={classNames("ui-chat-content message", { 'first-of-group': firstOfGroup })}>{children}</div>
  );
}

const Metadata = ({ children }) => {
  return (
    <div className="ui-chat-metadata">
      {children}
    </div>
  );
}

const ChatWindow = ({ children, width = '100%', style }) => {

  return (
    <div className="ui-chat-window chat" style={{ width: _.isNumber(width) ? `${width}px` : width, ...style }}>{children}</div>
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

const MessageDate = ({ children, date }) => {

  return (
    <span className="ui-chat-message-date">
      {date != null && date.format('HH:mm')}
      {children}
    </span>
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


const MessageText = ({ message, ...props }) => {
  return (
    <Message {...props}>
      <Metadata>
        <MessageDate date={moment()}/> &nbsp; &nbsp;
        <MessageUser>Olia</MessageUser> <UserStatus />                
      </Metadata>
      <Content>
        {message.content}
      </Content>
    </Message>
  );
};

const Buttons = ({ children, layout = 'quick-replies' }) => {

  return (
    <div className={classNames(
      'ui-chat-buttons', 
      { 
        'quick-replies': layout === 'quick-replies',
        'inline': layout === 'inline',
        'card': layout === 'card' 
      }
    )}
    >
      {children}
    </div>
  );
};

const Button = ({ value, children }) => {

  return (
    <div className="ui-chat-button">{children}</div>
  );

};


const MessageButtons = ({ message, ...props }) => {
  return (
    <Message {...props}>
      <Metadata>
        <MessageDate date={moment()}/> &nbsp; &nbsp;
        <MessageUser>Olia</MessageUser> <UserStatus />                
      </Metadata>
      <Content firstOfGroup>
        {message.content}
      </Content>
      {message.buttons != null && message.buttons.length !== 0 && (
        <Buttons layout="card">
          {message.buttons.map(button => (
            <Button {...button} key={`${button.value}-${button.label}`}>{button.label}</Button>
          ))}
        </Buttons>
      )}
    </Message>
  );
};
MessageButtons.propTypes = {
  layout: PropTypes.oneOf(['quick-replies', 'inline',  'card'])
};





export { 
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
  MessageButtons 
};


