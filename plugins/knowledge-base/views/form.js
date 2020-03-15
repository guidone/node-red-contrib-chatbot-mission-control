import React, { useState, useRef, Fragment } from 'react';
import { Button, Form, FormControl, ButtonToolbar, FormGroup, ControlLabel, HelpBlock, Nav, Slider, Toggle } from 'rsuite';


import Dictionary from '../../../src/components/dictionary';




const dictionarySchema = [
  { 
    name: 'faq.bestMatch',
    description: 'Text shown before the list of opening hours'
  },
  
];



export default ({ 
  value, 
  onSubmit = () => { }, 
  disabled = false 
}) => {  
  const [formValue, setFormValue] = useState(value);
  const [formError, setFormError] = useState(null);
  const [tab, setTab] = useState('openings');
  const form = useRef(null);

  return (
    <div>
      <Nav appearance="tabs" activeKey={tab} onSelect={setTab} style={{ marginBottom: '25px' }}>
        <Nav.Item eventKey="openings">Knowledge Base</Nav.Item>
        <Nav.Item eventKey="translations">Translations</Nav.Item>
      </Nav>
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
        {tab === 'translations' && (
          <Fragment>
            <FormGroup>
              <FormControl 
                name="translations" 
                accepter={Dictionary}           
                schema={dictionarySchema}          
                disabled={disabled}
              />        
            </FormGroup>
          </Fragment>
        )}
        {tab === 'openings' && (
          <Fragment>
            <FormGroup>
              <ControlLabel>Answer by Default</ControlLabel>
              <FormControl 
                name="answerByDefault" 
                accepter={Toggle}                           
                disabled={disabled}
              />        
            </FormGroup>
            <FormGroup>
              <ControlLabel>Content</ControlLabel>
              <FormControl 
                readOnly={disabled} 
                name="threshold"         
                defaultValue={50} 
                min={1} 
                step={1} 
                max={100}                            
                accepter={Slider}           
              />
              <HelpBlock>
                Select a <em>slug</em> for a multi-language content to show additional information when a user requests
                information about opening hours
              </HelpBlock>        
            </FormGroup>
          </Fragment>
        )}
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