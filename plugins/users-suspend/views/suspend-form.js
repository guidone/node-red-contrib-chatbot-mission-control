import React from 'react';
import { Form, FormGroup, ControlLabel, FormControl, HelpBlock } from 'rsuite';

const SuspendForm = ({ formValue, formError = null, onChange }) => {

  // TODO implement suspended
  return (
    <Form 
      formValue={formValue} 
      formError={formError} 
      onChange={onChange} 
      fluid 
      autoComplete="off"
    >
      <FormGroup>
        <ControlLabel>Suspend</ControlLabel>
        <FormControl name="middle_name"/>
        <HelpBlock >tbd</HelpBlock>            
      </FormGroup>
    </Form>
  );


};

export default SuspendForm;