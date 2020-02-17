import React, { useState } from 'react';

import { Button, Form, FormControl, ButtonToolbar, FormGroup, ControlLabel, DatePicker, FlexboxGrid, HelpBlock, SelectPicker } from 'rsuite';

import ContentAutocomplete from '../../../src/components/content-autocomplete';
import CollectionEditor from '../../../src/components/collection-editor';

const SELECT_DAYS = [
  { value: 'mo', label: 'Monday' },
  { value: 'tu', label: 'Tuesday' },
  { value: 'we', label: 'Wednesday' },
  { value: 'th', label: 'Thursday' },
  { value: 'fr', label: 'Friday' },
  { value: 'sa', label: 'Saturday' },
  { value: 'su', label: 'Sunday' },
  { value: 'mo-fr', label: 'Monday - Friday' },
  { value: 'mo-sa', label: 'Monday - Saturday' },
  { value: 'mo-su', label: 'Monday - Sunday' },
  { value: 'sa-su', label: 'Saturday - Sunday' }
];

const FormOpening = ({ value, onChange }) => (
  <Form formValue={value} onChange={onChange} fluid>
    <FlexboxGrid justify="space-between">
      <FlexboxGrid.Item colspan={7}>
        <FormControl 
          name="start"
          accepter={DatePicker}
          format="HH:mm" 
          style={{ width: '100%' }}
        />
      </FlexboxGrid.Item>
      <FlexboxGrid.Item colspan={7}>
        <FormControl 
          name="end"
          accepter={DatePicker}
          format="HH:mm" 
          style={{ width: '100%' }}
        />
      </FlexboxGrid.Item>
      <FlexboxGrid.Item colspan={8}>
        <FormControl 
          name="range"
          accepter={SelectPicker}
          format="HH:mm" 
          block
          data={SELECT_DAYS}
          style={{ width: '100%' }}
        />
      </FlexboxGrid.Item>
    </FlexboxGrid>

        

  </Form>
);

const withForm = (Component, form) => {
  return ({ children, ...props }) => <Component {...props} form={form}>{children}</Component>
};


export default ({ value, onSubmit = () => { }, disabled = false }) => {
  
  const [formValue, setFormValue] = useState(value);

  return (
    <Form formValue={formValue} onChange={formValue => {
      console.log('form onchange', formValue)
      setFormValue(formValue);
    }}>
      <FormGroup>
        <ControlLabel>Username</ControlLabel>
        <FormControl readOnly={disabled} name="param_1" />
        <HelpBlock>Required</HelpBlock>
      </FormGroup>
      <FormGroup>
        <ControlLabel>Email</ControlLabel>
        <FormControl readOnly={disabled} name="param_2" type="email" />
        <HelpBlock tooltip>I am a tooltip</HelpBlock>
      </FormGroup>

      <FormGroup>
        <ControlLabel>Openings</ControlLabel>
        <FormControl 
          readOnly={disabled} 
          name="openings" 
          accepter={CollectionEditor}
          style={{ width: '550px' }} 
          form={FormOpening}
        />        
      </FormGroup>

      <FormGroup>
        <ControlLabel>Content</ControlLabel>
        <FormControl 
          useSlug={true} 
          readOnly={disabled} 
          name="content" 
          style={{ width: '350px' }}         
          accepter={ContentAutocomplete}           
        />        
      </FormGroup>

      <FormGroup>
        <ButtonToolbar>
          <Button disabled={disabled} appearance="primary" onClick={() => {
            onSubmit(formValue);
          }}>
            Save
            </Button>
          <Button disabled={disabled} appearance="default" onClick={() => setFormValue({ })}>
            Cancel
            </Button>
        </ButtonToolbar>
      </FormGroup>

    </Form>
  );
};