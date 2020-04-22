import React, { useState, useRef, Fragment } from 'react';
import { Button, Form, FormControl, ButtonToolbar, FormGroup, ControlLabel, HelpBlock, Nav } from 'rsuite';

import ContentAutocomplete from '../../../src/components/content-autocomplete';

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
        disabled={true}
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
        <Fragment>
          <FormGroup>
            <ControlLabel>Welcome message
              <HelpBlock tooltip>Select the content to show when the user joins the chatbot</HelpBlock>
            </ControlLabel>
            <FormControl
              name="page"
              accepter={ContentAutocomplete}
              useSlug={true}
              disabled={disabled}
            />
          </FormGroup>
        </Fragment>
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