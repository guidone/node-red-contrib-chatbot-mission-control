import React, { useState, useRef, Fragment } from 'react';
import { Button, Form, FormControl, ButtonToolbar, FormGroup, ControlLabel, HelpBlock, Nav } from 'rsuite';


import Dictionary from '../../../src/components/dictionary';
import ContentAutocomplete from '../../../src/components/content-autocomplete';
import SurveyEditor from '../../../src/components/survey-editor';




// TODO check models and schema, start < end, no repetitions in range


const dictionarySchema = [
  {
    name: 'survey.intro',
    description: 'Text shown at the beginning of the survey if no content is provided'
  },
  {
    name: 'survey.end1',
    description: 'End of the survey (version 1)'
  },
  {
    name: 'survey.end2',
    description: 'End of the survey (version 2)'
  },
  {
    name: 'survey.end3',
    description: 'End of the survey (version 3)'
  }
];



export default ({
  value,
  onSubmit = () => { },
  disabled = false
}) => {
  const [formValue, setFormValue] = useState(value);
  const [formError, setFormError] = useState(null);
  const [tab, setTab] = useState('questions');
  const form = useRef(null);

  return (
    <div>
      <Nav appearance="tabs" activeKey={tab} onSelect={setTab} style={{ marginBottom: '25px' }}>
      <Nav.Item eventKey="questions">Questions</Nav.Item>
        <Nav.Item eventKey="surveys">Survey</Nav.Item>
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
        {tab === 'surveys' && (
          <Fragment>
            <FormGroup>
              <ControlLabel>Introduction Message
                <HelpBlock tooltip>Select the content to show when the user starts the survey</HelpBlock>
              </ControlLabel>
              <FormControl
                name="introduction"
                accepter={ContentAutocomplete}
                useSlug={true}
                disabled={disabled}
              />
            </FormGroup>
          </Fragment>
        )}
        {tab === 'questions' && (
          <Fragment>
            <FormGroup>
              <FormControl
                name="questions"
                accepter={SurveyEditor}
                disabled={disabled}
              />
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