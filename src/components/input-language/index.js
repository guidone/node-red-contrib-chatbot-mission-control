import React, { useState }  from 'react';

import CollectionEditor from '../collection-editor';
import { Form, FlexboxGrid, FormControl } from 'rsuite';


import LanguagePicker from '../language-picker';

const FormOpening = ({ value, onChange, disabled = false }) => (
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




const InputLanguage = ({
  value = {},
  disabled = false,
  onChange = () => {},
  style
}) => {

  const initialState = Object.keys(value)
    .map(key => ({ language: key, text: value[key] }));

  const [current, setCurrent] = useState(initialState);
  

  return (
    <div className="ui-input-language" style={style}>
      <CollectionEditor 
        value={current} 
        disabled={disabled}
        form={FormOpening}
        hideArrows={true}
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

export default InputLanguage;