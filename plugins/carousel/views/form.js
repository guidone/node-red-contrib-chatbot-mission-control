import React, { useState, useRef, Fragment } from 'react';
import { Button, Form, FormControl, ButtonToolbar, FormGroup, ControlLabel, HelpBlock, Nav } from 'rsuite';

import CollectionEditor from '../../../src/components/collection-editor';
import Dictionary from '../../../src/components/dictionary';

import { carousel as carouseModel } from '../models';
import FormCard from './form-card';

const dictionarySchema = [
  {
    name: 'carousel.intro',
    description: 'Introduction text of the carousel'
  }
];

export default ({
  value,
  onSubmit = () => { },
  disabled = false
}) => {
  const [formValue, setFormValue] = useState(value);
  const [formError, setFormError] = useState(null);
  const [tab, setTab] = useState('carousel');
  const form = useRef(null);

  return (
    <div>
      <Nav appearance="tabs" activeKey={tab} onSelect={setTab} style={{ marginBottom: '25px' }}>
        <Nav.Item eventKey="carousel">Carousel</Nav.Item>
        <Nav.Item eventKey="translations">Translations</Nav.Item>
      </Nav>
      <Form
        model={carouseModel}
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
        {tab === 'carousel' && (
          <Fragment>
            <FormGroup>
              <ControlLabel>Carousel Cards
                <HelpBlock tooltip>Select one or more content</HelpBlock>
              </ControlLabel>
              <FormControl
                name="cards"
                accepter={CollectionEditor}
                form={FormCard}
                labelAdd="Add card"
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