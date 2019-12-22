import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'rsuite';

import colorType from './helpers/color-type';
import './message-type.scss';

const MessageType = ({ type }) => (
  <Tag color={colorType(type)} className="ui-message-type">{type}</Tag>
);
MessageType.propTypes = {
  type: PropTypes.string
};

export default MessageType;