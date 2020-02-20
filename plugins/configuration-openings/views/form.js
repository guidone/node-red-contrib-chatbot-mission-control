import React, { useState, useRef } from 'react';
import { Button, Form, FormControl, ButtonToolbar, FormGroup, ControlLabel, HelpBlock } from 'rsuite';

import ContentAutocomplete from '../../../src/components/content-autocomplete';
import CollectionEditor from '../../../src/components/collection-editor';
import InputLanguage from '../../../src/components/input-language';

import { opening as openingModel } from '../models';
import FormOpening from './form-opening';
import UserAutocomplete from '../../../src/components/user-autocomplete';

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
        <ControlLabel>Openings hours</ControlLabel>
        <FormControl 
          name="openings" 
          accepter={CollectionEditor}           
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
          name="content"                    
          accepter={ContentAutocomplete}           
        />
        <HelpBlock>
          Select a <em>slug</em> for a multi-language content to show additional information when a user requests
          information about opening hours
        </HelpBlock>        
      </FormGroup>
      <FormGroup>
        <ControlLabel>Opening hours label</ControlLabel>
        <FormControl 
          disabled={disabled}
          name="labelOpenings" 
          accepter={InputLanguage}
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
  );
};