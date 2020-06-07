import React, { useState, useRef } from 'react';
import { Input, Form, ControlLabel, FormControl, HelpBlock, Button, ButtonToolbar, FormGroup } from 'rsuite';

export default ({
  value,
  onSubmit = () => { },
  disabled = false
}) => {
  const [formValue, setFormValue] = useState(value);
  const [formError, setFormError] = useState(null);
  const form = useRef(null);

  return (
    <div>
      <Form
        formValue={formValue}
        formError={formError}
        ref={form}
        checkTrigger="none"
        layout="vertical"
        fluid
        onChange={formValue => {
          setFormValue(formValue);
          setFormError(null);
        }}
        onCheck={errors => {
          setFormError(errors);
        }}
      >
        <FormGroup>
          <ControlLabel>JSONbin.io id</ControlLabel>
          <FormControl
            name="jsonbin_id"
            accepter={Input}
            disabled={disabled}
          />
          <HelpBlock>
            The <em>id</em> of the <strong>jsonbin.io</strong> snippet of the plugins meta info
          </HelpBlock>
        </FormGroup>
        <FormGroup>
          <ControlLabel>JSONbin.io key</ControlLabel>
          <FormControl
            name="jsonbin_key"
            accepter={Input}
            disabled={disabled}
          />
          <HelpBlock>
            The <em>secret key</em> to write on <strong>jsonbin.io</strong>
          </HelpBlock>
        </FormGroup>
        <FormGroup style={{ marginTop: '40px' }}>
          <ButtonToolbar>
            <Button
              disabled={disabled}
              appearance="primary"
              onClick={() => {
                if (!form.current.check()) {
                  return;
                }
                onSubmit(formValue);
              }}>
              Save configuration
              </Button>
            <Button
              disabled={disabled}
              appearance="default"
              onClick={() => {
                if (confirm('Reset configuration?')) {
                  setFormValue(value);
                }
              }}
            >
              Reset
            </Button>
          </ButtonToolbar>
        </FormGroup>
      </Form>
    </div>
  );
};