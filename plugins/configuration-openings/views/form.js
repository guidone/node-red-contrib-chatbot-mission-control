import React, { useState, useRef } from 'react';
import { Button, Form, FormControl, ButtonToolbar, FormGroup, ControlLabel, HelpBlock } from 'rsuite';

import ContentAutocomplete from '../../../src/components/content-autocomplete';
import CollectionEditor from '../../../src/components/collection-editor';
import InputLanguage from '../../../src/components/input-language';

import { opening as openingModel } from '../models';
import FormOpening from './form-opening';

// TODO check models and schema, start < end, no repetitions in range

export default ({ 
  value, 
  onSubmit = () => { }, 
  disabled = false 
}) => {  
  const [formValue, setFormValue] = useState(value);
  const [formError, setFormError] = useState(null);
  const form = useRef(null);

  return (
    <Form 
      model={openingModel}
      disabled={true} 
      formValue={formValue}
      formError={formError}
      ref={form}
      checkTrigger="none" 
      onChange={formValue => {
        setFormValue(formValue);
        setFormError(null);
      }} 
      onCheck={errors => {
        setFormError(errors);        
      }}
    >
      <FormGroup>
        <ControlLabel>Username</ControlLabel>
        <FormControl readOnly={disabled} name="username" />
        <HelpBlock>Required</HelpBlock>
      </FormGroup>

      <FormGroup>
        <ControlLabel>Opening hours label</ControlLabel>
        <FormControl 
          disabled={disabled}
          name="labelOpenings" 
          accepter={InputLanguage}
          style={{ width: '550px' }}           
        />        
      </FormGroup>

      <FormGroup>
        <ControlLabel>Openings hours</ControlLabel>
        <FormControl 
          name="openings" 
          accepter={CollectionEditor}
          style={{ width: '550px' }} 
          form={FormOpening}
          labelAdd="Add opening hour"
          disabled={disabled}
        />        
      </FormGroup>

      <FormGroup>
        <ControlLabel>Content</ControlLabel>
        <FormControl 
          useSlug={true} 
          readOnly={disabled} 
          disabled="fottit stronzo"
          name="content" 
          style={{ width: '350px' }}         
          accepter={ContentAutocomplete}           
        />        
      </FormGroup>

      <FormGroup>
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
            Save
            </Button>
          <Button 
            disabled={disabled} 
            appearance="default" 
            onClick={() => setFormValue({ })}
          >
            Cancel
          </Button>
        </ButtonToolbar>
      </FormGroup>
    </Form>
  );
};