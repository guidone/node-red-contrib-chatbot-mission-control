import React, { useState, useEffect, useRef } from 'react';
import momentPropTypes from 'react-moment-proptypes';
import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { IconButton, Icon } from 'rsuite';

import './chat.scss';

import { Message, Content, Metadata, MessageDate, MessageUser, UserStatus } from './views/generic';
import MessageComposer from './views/message-composer';

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




const ChatWindow = ({ children, width = '100%', style }) => {

  return (
    <div className="ui-chat-window chat" style={{ width: _.isNumber(width) ? `${width}px` : width, ...style }}>{children}</div>
  );

}







import Showdown from 'showdown';

const MessageText = ({ message, markdown = false, ...props }) => {

  let html = message.content;
  if (markdown) {
    const converter = new Showdown.Converter({ openLinksInNewWindow: true });
    html = converter.makeHtml(message.content);
  }

  return (
    <Message {...props}>
      <Metadata>
        <MessageDate date={message.ts}/> &nbsp; &nbsp;
        <MessageUser>{message.username}</MessageUser> <UserStatus />
      </Metadata>
      <Content text={html}/>
    </Message>
  );
};
MessageText.propTypes = {
  message: PropTypes.shape({
    content: PropTypes.string,
    userId: PropTypes.string,
    username: PropTypes.string,
    ts: PropTypes.momentPropTypes
  })
};

const MessageGroup = ({ messages, ...props }) => {
  if (_.isEmpty(messages)) {
    return;
  }
  const message = messages[0];
  return (
    <Message {...props} inbound={false}>
      <Metadata>
        <MessageDate date={message.ts}/> &nbsp; &nbsp;
        <MessageUser>{message.username}</MessageUser> <UserStatus />
      </Metadata>
      {messages.map((message, idx) => {
        let position = 'middle';
        if (idx === 0) {
          position = 'first';
        } else if (idx === (messages.length - 1)) {
          position = 'last';
        }
        switch (message.type) {
          case 'message':
            return (
              <Content position={position} text={message.content} />
            );
          /*case 'photo':
            return <MessagePhoto message={message} inbound={message.inbound} />;
          case 'inline-buttons':
            return <MessageButtons message={message} inbound={message.inbound} />; */
          default:
            return <div>Unsupported message type</div>;
        }

      })}
    </Message>
  );
};
MessageGroup.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      content: PropTypes.string,
      userId: PropTypes.string,
      username: PropTypes.string,
      ts: PropTypes.momentPropTypes
    })
  )
};








class MessagePhoto extends React.Component {
  // TODO username
  // use func and state
  // inbound msg too
  render() {
    const { message } = this.props;

    const arrayBufferView = new Uint8Array( message.content.data );
    const blob = new Blob( [ arrayBufferView ], { type: 'image/jpeg' } );
    const urlCreator = window.URL || window.webkitURL;
    const imageUrl = urlCreator.createObjectURL(blob);

    return (
      <Message {...this.props} className="ui-chat-message-photo">
        <Metadata>
          <MessageDate date={moment()}/> &nbsp; &nbsp;
          <MessageUser>{message.username}</MessageUser> <UserStatus />
        </Metadata>
        <Content>
          <img src={imageUrl}/>
        </Content>
      </Message>
    );
  }
};



import MessageButtons from './views/message-buttons';



export {
  Message,
  Messages,
  Content,
  Metadata,
  ChatWindow,
  MessageComposer,
  MessageDate,
  MessageUser,
  MessageGroup,
  UserStatus,

  MessageText,
  MessageButtons,
  MessagePhoto
};
