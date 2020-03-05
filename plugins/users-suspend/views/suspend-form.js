import React from 'react';
import { Form, FormGroup, ControlLabel, Tag, HelpBlock, Toggle } from 'rsuite';

const SuspendForm = ({ formValue = {}, formError = null, onChange }) => {
  formValue = formValue || {};

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
        <Toggle
          onChange={checked => onChange({ ...formValue, suspended: checked })}
          checked={formValue.suspended}
        />
        <HelpBlock>
          Suspend the user, use the node <Tag color="violet">User suspended</Tag> in <b>Node-RED</b> flow
        </HelpBlock>            
      </FormGroup>
    </Form>
  );


};

export default SuspendForm;