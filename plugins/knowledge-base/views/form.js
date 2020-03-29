import React, { useState, useRef, Fragment } from 'react';
import { Button, Form, FormControl, ButtonToolbar, FormGroup, ControlLabel, HelpBlock, Nav, Slider, Toggle } from 'rsuite';


import Dictionary from '../../../src/components/dictionary';
import Confidence from '../../../src/components/confidence';




const dictionarySchema = [
  {
    name: 'faq.bestMatch',
    description: 'Text shown before the list of opening hours'
  },
  {
    name: 'faq.sorryNotFound1',
    description: 'Answer when no support articles were found (first version)'
  },
  {
    name: 'faq.sorryNotFound2',
    description: 'Answer when no support articles were found (second version)'
  },
  {
    name: 'faq.sorryNotFound3',
    description: 'Answer when no support articles were found (third version)'
  },
  {
    name: 'faq.askSomething1',
    description: 'What the chatbot answer when the user requests help (first version)'
  },
  {
    name: 'faq.askSomething2',
    description: 'What the chatbot answer when the user requests help (second version)'
  },
  {
    name: 'faq.askSomething3',
    description: 'What the chatbot answer when the user requests help (third version)'
  },
  {
    name: 'faq.no'
  },
  {
    name: 'faq.yes'
  },
  {
    name: 'faq.ok'
  },
  {
    name: 'faq.wasUseful',
    description: 'Asked if an article is useful after a search'
  },
  {
    name: 'faq.thanksBye1',
    description: 'Answer when the user is satisfied with the found article (first version)'
  },
  {
    name: 'faq.thanksBye2',
    description: 'Answer when the user is satisfied with the found article (second version)'
  },
  {
    name: 'faq.thanksBye3',
    description: 'Answer when the user is satisfied with the found article (third version)'
  },
  {
    name: 'faq.selectOneOfThese',
    description: 'Shown when the user is asked to select on of the related articles of a search'
  },
  {
    name: 'faq.somethingWentWrong',
    description: 'Shown when an unrecoverable error occurs'
  },
  {
    name: 'faq.noMoreArticles',
    description: `Shown when user ask to more results but there aren't`
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
              <HelpBlock>
                With this option <em>enabled</em>, the block execute a search for every input of the user, if <em>disabled</em>
                the user has to enter in the <em>ask question state</em> entering some sentences like <em>"I need help"</em>
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
                The minimum score of an article to be considered relevant. Lower this value if the search doesn't return any value.
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