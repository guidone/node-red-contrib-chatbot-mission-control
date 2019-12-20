import React from 'react';
import { Icon } from 'rsuite';
import classNames from 'classnames';
import moment from 'moment';

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

export { Message, Messages, Content, Metadata, ChatWindow, MessageComposer, MessageDate, MessageUser, UserStatus };