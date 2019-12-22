import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'rsuite';

import colorType from './helpers/color-type';
import './transport.scss';

const Transport = ({ transport }) => (
  <Tag color={colorType(transport)} className="ui-transport">{transport}</Tag>
);
Transport.propTypes = {
  transport: PropTypes.string
};

export default Transport;