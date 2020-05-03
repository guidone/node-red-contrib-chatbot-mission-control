import React from 'react';
import { HelpBlock as RawHelpBlock } from 'rsuite';

const HelpBlock = ({ jsonSchema = {} }) => {
  const { help } = jsonSchema.options || {};
  if (!_.isEmpty(help)) {
    return <RawHelpBlock>{help}</RawHelpBlock>
  } else if (_.isArray(jsonSchema.examples) && !_.isEmpty(jsonSchema.examples)) {
    return <RawHelpBlock>Example: {jsonSchema.examples.join(', ')}</RawHelpBlock>
  }
  return null;
};

export default HelpBlock;