import React, { useState } from 'react';

import { Button, Form, FormControl, ButtonToolbar, FormGroup, ControlLabel, FlexboxGrid, HelpBlock, Notification } from 'rsuite';

export default ({ value, onSubmit = () => { }, disabled = false }) => {
  
  const [formValue, setFormValue] = useState(value);

  return (
    <Form formValue={formValue} onChange={formValue => setFormValue(formValue)}>
      <FormGroup>
        <ControlLabel>Username</ControlLabel>
        <FormControl name="param_1" />
        <HelpBlock>Required</HelpBlock>
      </FormGroup>
      <FormGroup>
        <ControlLabel>Email</ControlLabel>
        <FormControl name="param_2" type="email" />
        <HelpBlock tooltip>I am a tooltip</HelpBlock>
      </FormGroup>

      <FormGroup>
        <ButtonToolbar>
          <Button disabled={disabled} appearance="primary" onClick={() => {
            onSubmit(formValue);
          }}>
            Send Message
            </Button>
          <Button disabled={disabled} appearance="default" onClick={() => setFormValue({ })}>
            Cancel
            </Button>
        </ButtonToolbar>
      </FormGroup>

    </Form>
  );
};