import React from 'react';
import { Form, FlexboxGrid, DatePicker, FormControl, ControlLabel, Tag, HelpBlock, Toggle } from 'rsuite';
import PropTypes from 'prop-types';

import CollectionEditor from '../../../src/components/collection-editor';

const EditDataForm = ({ value, onChange, disabled = false }) => (
  <Form 
    formValue={value} 
    onChange={onChange}     
    fluid
  >
    <FlexboxGrid justify="space-between">
      <FlexboxGrid.Item colspan={7}>
        <FormControl 
          name="ts"
          readOnly={disabled}
          accepter={DatePicker}           
          style={{ width: '100%' }}
        />
      </FlexboxGrid.Item>      
      <FlexboxGrid.Item colspan={16}>
        <FormControl 
          name="text"          
          readOnly={disabled}
          componentClass="textarea"
          style={{ width: '100%' }}
        />
      </FlexboxGrid.Item>
    </FlexboxGrid>
  </Form>
);
EditDataForm.propTypes = {
  value: PropTypes.shape({
    text: PropTypes.string,
    ts: PropTypes.string
  }),
  disabled: PropTypes.bool,
  onChange: PropTypes.func
};

const AnswersForm = ({ formValue = {}, onChange, disabled = false }) => {
  formValue = formValue || {};
  return (
    <div>
      <CollectionEditor 
        value={formValue.data || []}
        disabled={disabled}
        form={EditDataForm}
        onChange={data => {
          onChange({ ...formValue, data });
        }}
      />
    </div>
  );
};
AnswersForm.propTypes = {
  formValue: PropTypes.shape({
    data: PropTypes.shape({
      text: PropTypes.string,
      ts: PropTypes.string
    })
  }),
  disabled: PropTypes.bool,
  onChange: PropTypes.func
};

export default AnswersForm;