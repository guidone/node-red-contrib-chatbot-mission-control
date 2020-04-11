import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { IconButton, Icon } from 'rsuite';

import { Message, Content, Metadata, MessageDate, MessageUser, UserStatus, Button, Buttons } from './generic';

const MessageButtons = ({ message, onClick = () => {}, ...props }) => {

  return (
    <Message {...props}>
      <Metadata>
        <MessageDate date={moment()}/> &nbsp; &nbsp;
        <MessageUser>{message.username}</MessageUser> <UserStatus />
      </Metadata>
      <Content position="first">
        {message.content}
      </Content>
      {message.buttons != null && message.buttons.length !== 0 && (
        <Buttons layout="card">
          {message.buttons.map(button => (
            <Button
              {...button}
              onClick={() => onClick(button)}
              key={`${button.value}-${button.label}`}
            >{button.label}</Button>
          ))}
        </Buttons>
      )}
    </Message>
  );
};
MessageButtons.propTypes = {
  onClick: PropTypes.func,
  layout: PropTypes.oneOf(['quick-replies', 'inline',  'card']),
  message: PropTypes.shape({
    username: PropTypes.string,
    content: PropTypes.string,
    buttons: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string
    }))
  })
};

export default MessageButtons;