import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'rsuite';

import './language.scss';

const Language = ({ children }) => (
  <Tag color="cyan" className="ui-language-label">{children}</Tag>
);


export default Language;