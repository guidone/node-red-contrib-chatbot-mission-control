import React, { useState } from 'react';

import { Button, Form, FormControl, ButtonToolbar, FormGroup, ControlLabel, FlexboxGrid, HelpBlock, Notification } from 'rsuite';

import ContentAutocomplete from '../../../src/components/content-autocomplete';

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
        <ControlLabel>Content</ControlLabel>
        <FormControl useSlug={true} readOnly={disabled} name="content" style={{ width: '350px' }} accepter={ContentAutocomplete} />
        
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