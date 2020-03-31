import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'rsuite';


import './small-tag.scss';

const SmallTag = ({ color, children }) => {
  return (
    <Tag style={{backgroundColor: color }} className="ui-small-tag">{children}</Tag>
  );
}
SmallTag.propTypes = {
  color: PropTypes.string,
};

export default SmallTag;