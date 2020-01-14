import React, { useState, useEffect, useRef } from 'react';
import momentPropTypes from 'react-moment-proptypes';
import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { IconButton, Icon } from 'rsuite';

import './chat.scss';

const Message = ({ children, inbound = true, className }) => {

  return (
    <li className={classNames('ui-chat-message', className, { clearfix: inbound, inbound, outbound: !inbound })}>
      {children}
    </li>
  );

};

const Messages = ({ children }) => {
  const messagesEndRef = useRef(null);
  useEffect(() => {
    const el = messagesEndRef.current;
    el.scrollTo(0, el.scrollHeight);
  }, [children]);

  return (
    <div className="ui-chat-messages chat-history" ref={messagesEndRef}>
      <ul>
        {children}
      </ul>
    </div>
  );
};


const Content = ({ children, firstOfGroup = false, text = null }) => {
  if (!_.isEmpty(text)) {
    return (
      <div 
        className={classNames("ui-chat-content message", { 'first-of-group': firstOfGroup })}
        dangerouslySetInnerHTML={{
          __html: text.replace(/\n/g, '<br/>')
        }}
      />
    );
  }
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


const MessageComposer = ({ onSend = () => {} }) => {
  const [message, setMessage] = useState('');
  const sendMessage = () => {
    if (_.isEmpty(message)) {
      return;
    }
    onSend(message);
    setMessage('');
  };

  return (
    <div className="ui-chat-message-composer">
      <div className="editor">
        <textarea 
          name="message-to-send"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyUp={event => {
            if (event.shiftKey && event.keyCode === 13) {
              sendMessage();
            }
          }} 
          id="message-to-send" placeholder ="Type your message" rows="3"></textarea>
      </div>
      <div className="buttons">
        <IconButton 
          icon={<Icon icon="send" />}  
          appearance="primary"
          size="sm"
          onClick={sendMessage} 
        />
      </div>
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
        <MessageUser>{message.username}</MessageUser> <UserStatus />                
      </Metadata>
      <Content text={message.content}/>
    </Message>
  );
};
MessageText.propTypes = {
  message: PropTypes.shape({
    content: PropTypes.string,
    userId: PropTypes.string,
    username: PropTypes.string,
    date: PropTypes.momentPropTypes
  })
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

class MessagePhoto extends React.Component {

  // use func and state
  // inbound msg too
  render() {

    const { message } = this.props;

    var arrayBufferView = new Uint8Array( message.content.data );
    var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL( blob );

    return (
      <Message {...this.props} className="ui-chat-message-photo">
        <Metadata>
          <MessageDate date={moment()}/> &nbsp; &nbsp;
          <MessageUser>Olia</MessageUser> <UserStatus />                
        </Metadata>
        <Content>
          <img src={imageUrl}/>
        </Content>
      </Message>

    )

  }

}

const GenericMessage = ({ message = {} }) => {
  switch (message.type) {
    case 'message':
      return <MessageText message={message} inbound={message.inbound} />;
    case 'photo':
      return <MessagePhoto message={message} inbound={message.inbound} />;
    case 'inline-buttons':
      return <MessageButtons message={message} inbound={message.inbound} />; 
    default:
      return <div>Unsupported message type</div>;
  }
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
  MessageButtons,
  MessagePhoto,
  
  GenericMessage
};


