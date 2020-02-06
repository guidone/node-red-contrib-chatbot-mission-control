import React from 'react';
import { SelectPicker } from 'rsuite';

import Language from '../language';

import Languages from './languages';

const LanguagePicker = ({ onChange = () => {}, ...props }) => {
  return (
    <SelectPicker 
      name="language" 
      cleanable={false}
      data={Languages.map(item => ({ value: item.code, label: item.name }))}
      onChange={language => onChange(language)}
      renderMenuItem={(label, item) => {
        return (
        <div>
          <Language>{item.value}</Language>
          <span style={{ display: 'inline-block', marginLeft: '5px' }}>{label}</span>
        </div>
        );
      }}
      renderValue={(value, item) => {
        return (
        <div>
          <Language>{value}</Language>
          <span style={{ display: 'inline-block', marginLeft: '5px' }}>{item.label}</span>
        </div>
        );
      }}
      {...props} 
    />
  );
};

export default LanguagePicker;