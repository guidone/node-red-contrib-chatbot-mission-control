import React from 'react';
import PropTypes from 'prop-types';

import CollectionEditor from '../collection-editor';

import FormLabel from './views/form-label';

// TODO check if language is not defined
// TODO disable used languages in form label

const InputLanguage = ({
  value = {},
  disabled = false,
  onChange = () => {},
  style
}) => {
  const current = Object.keys(value).map(key => ({ language: key, text: value[key], id: key }))
  return (
    <div className="ui-input-language" style={style}>
      <CollectionEditor 
        value={current} 
        disabled={disabled}
        form={FormLabel}
        hideArrows={true}
        labelAdd="Add label"
        onChange={value => {
          const newValue = {};
          value.forEach(item => newValue[item.language] = item.text);          
          onChange(newValue);
        }}
      />
    </div>
  );
};
InputLanguage.propTypes = {
  value: PropTypes.object,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  onChange: PropTypes.func
};

export default InputLanguage;