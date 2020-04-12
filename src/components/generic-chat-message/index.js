import React from 'react';

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
  MessageGroup,
  MessageQuickReplies
} from '../chat';



const GenericMessage = ({ message = {}, onClick = () => {} }) => {
  // if array messages must be grouped
  if (_.isArray(message)) {
    return (
      <MessageGroup messages={message} onClick={onClick} />
    );
  }

  switch (message.type) {
    case 'message':
      return (
        <MessageText
          message={message}
          inbound={message.inbound}
          markdown={message.params != null && message.params.parseMode === 'Markdown'}
        />
      );
    case 'photo':
      return <MessagePhoto message={message} inbound={message.inbound} />;
    case 'inline-buttons':
      return (
        <MessageButtons
          message={message}
          inbound={message.inbound}
          onClick={onClick}
        />
      );
    case 'quick-replies':
      return (
        <MessageQuickReplies
          message={message}
          inbound={message.inbound}
          onClick={onClick}
        />
      );
    default:
      return <div>Unsupported message type</div>;
  }
};

export default GenericMessage;