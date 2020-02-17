import React, { useState }  from 'react';
import { Form, FlexboxGrid, FormControl } from 'rsuite';
import PropTypes from 'prop-types';

import CollectionEditor from '../collection-editor';
import LanguagePicker from '../language-picker';

const FormLabel = ({ value, onChange, disabled = false }) => (
  <Form 
    formValue={value} 
    onChange={onChange} 
    autoComplete="off"
    fluid
  >
    <FlexboxGrid justify="space-between">
      <FlexboxGrid.Item colspan={19}>
        <FormControl 
          name="text"
          readOnly={disabled}           
          style={{ width: '100%' }}
        />
      </FlexboxGrid.Item>      
      <FlexboxGrid.Item colspan={4}>
        <FormControl 
          readOnly={disabled} 
          name="language" 
          hideLanguageLabel={true}
          cleanable={false}
          block
          accepter={LanguagePicker}
        />
      </FlexboxGrid.Item>
    </FlexboxGrid>    
  </Form>
);
FormLabel.propTypes = {
  value: PropTypes.shape({
    text: PropTypes.string,
    language: PropTypes.string
  }),
  onChange: PropTypes.func,
  disabled: PropTypes.bool
};


const InputLanguage = ({
  value = {},
  disabled = false,
  onChange = () => {},
  style
}) => {
  const initialState = Object.keys(value)
    .map(key => ({ language: key, text: value[key] }))
  const [current, setCurrent] = useState(initialState);
  
  return (
    <div className="ui-input-language" style={style}>
      <CollectionEditor 
        value={current} 
        disabled={disabled}
        form={FormLabel}
        hideArrows={true}
        labelAdd="Add label"
        onChange={value => {
          setCurrent(value);
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