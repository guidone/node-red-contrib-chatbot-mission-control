import React, { useState, useRef } from 'react';
import { Button, Form, FormControl, ButtonToolbar, FormGroup, ControlLabel, HelpBlock } from 'rsuite';

import CollectionEditor from '../../../src/components/collection-editor';

import { commands as commandsModel } from '../models';
import FormCommand from './form-command';



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
        model={commandsModel}
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
        <FormGroup>
          <ControlLabel>Content Commands
            <HelpBlock tooltip>Select one or more content to be shown after a command-line message (like <em>/privacy</em>, etc)</HelpBlock>
          </ControlLabel>
          <FormControl
            name="commands"
            accepter={CollectionEditor}
            form={FormCommand}
            labelAdd="Add command"
            disabled={disabled}
            sortable={false}
          />
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