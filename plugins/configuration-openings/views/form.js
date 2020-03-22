import React, { useState, useRef, Fragment } from 'react';
import { Button, Form, FormControl, ButtonToolbar, FormGroup, ControlLabel, HelpBlock, Nav } from 'rsuite';

import ContentAutocomplete from '../../../src/components/content-autocomplete';
import CollectionEditor from '../../../src/components/collection-editor';
import InputLanguage from '../../../src/components/input-language';
import Dictionary from '../../../src/components/dictionary';
import Confidence from '../../../src/components/confidence';

import { opening as openingModel } from '../models';
import FormOpening from './form-opening';
import UserAutocomplete from '../../../src/components/user-autocomplete';

// TODO check models and schema, start < end, no repetitions in range


const dictionarySchema = [
  {
    name: 'openings.openWhen',
    description: 'Text shown before the list of opening hours'
  },
  {
    name: 'openings.monday'
  },
  {
    name: 'openings.tuesday'
  },
  {
    name: 'openings.wednesday'
  },
  {
    name: 'openings.friday'
  },
  {
    name: 'openings.saturday'
  },
  {
    name: 'openings.sunday'
  },
  {
    name: 'openings.monfri'
  },
  {
    name: 'openings.monsat'
  },
  {
    name: 'openings.monsun'
  },
  {
    name: 'openings.satsun'
  },
  {
    name: 'openings.yes'
  },
  {
    name: 'openings.no'
  }
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
        <Nav.Item eventKey="openings">Openings</Nav.Item>
        <Nav.Item eventKey="translations">Translations</Nav.Item>
      </Nav>
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
              <ControlLabel>Sensitivity</ControlLabel>
              <FormControl
                disabled={disabled}
                name="threshold"
                accepter={Confidence}
              />
              <HelpBlock>
                The minimum score of an intent to be considered relevant. Lower this value if the NLP doesn't catch any intent of the user input,
                raise this value if the NLP of this block is interfering with the NLP of other blocks.
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