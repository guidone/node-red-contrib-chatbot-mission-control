import React, { useState, useRef, Fragment } from 'react';
import { Button, Form, FormControl, ButtonToolbar, FormGroup, ControlLabel, HelpBlock, Nav } from 'rsuite';


import Dictionary from '../../../src/components/dictionary';

import SurveyEditor from '../../../src/components/survey-editor';

//import { opening as openingModel } from '../models';


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
  // const [formValue, setFormValue] = useState(value);

  const [formValue, setFormValue] = useState({
    questions: [
      {
        id: "q1",
        tag: 'Q1',
        title: 'Quanti mondiali ha vinto l Italia?',
        type: 'multiple',
        data: [
          { answer: 'Uno' },
          { answer: 'Quattro' },
          { answer: 'Sedici' }
        ]
      },
      {
        id: "q2",
        tag: 'Q2',
        title: 'Sei normale?',
        type: 'multiple',
        data: [
          { answer: 'Si' },
          { answer: 'No' }
        ]
      },
      {
        id: "q4",
        parent: 'q2',
        tag: 'Q2.1',
        title: 'Che problema hai?',
        type: 'multiple',
        data: [
          { answer: 'Mangio troppo' },
          { answer: 'Mangio poco' },
          { answer: 'Mangio cosi cosi' }
        ]
      },
      {
        id: "q343",
        parent: 'q2',
        tag: 'Q2.2',
        title: 'Ma sei a posto?',
        type: 'multiple',
        data: [
          { answer: 'Si' },
          { answer: 'No' },
          { answer: 'Forse' }
        ]
      },
      {
        id: "q343231232",
        parent: 'q343',
        tag: 'Q2.2.1',
        title: 'Si ma quando?',
        type: 'multiple',
        data: [
          { answer: 'Ora' },
          { answer: 'Dopo' },
          { answer: 'Mai' }
        ]
      },
      {
        id: "q3",
        tag: 'Q3',
        title: 'Che sport fai?',
        type: 'multiple',
        data: [
          { answer: 'Nessuno' },
          { answer: 'Salto in basso' },
          { answer: 'Cerco funghi' }
        ]
      },
      {
        id: "q545",
        tag: 'Q4',
        title: 'Fa una foto alle tue scarpe',
        type: 'image'
      }
    ]
  });

  const [formError, setFormError] = useState(null);
  const [tab, setTab] = useState('surveys');
  const form = useRef(null);

  return (
    <div>
      <Nav appearance="tabs" activeKey={tab} onSelect={setTab} style={{ marginBottom: '25px' }}>
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