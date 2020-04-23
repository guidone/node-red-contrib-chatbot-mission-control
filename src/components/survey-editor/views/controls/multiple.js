import React, { useContext } from 'react';
import { Input, Icon, IconButton, Form, FormControl, FormGroup, SelectPicker, HelpBlock, ControlLabel } from 'rsuite';
import classNames from 'classnames';
import _ from 'lodash';

import CollectionEditor from '../../../collection-editor';
import prompt from '../../../prompt';

import SurveyEditorContext from '../../context';
import './style.scss';

import GoToForm from './views/go-to';
import QuestionDetailContext from '../../context-question-detail';

const ALPHABET = 'ABCDEFGHILMNOPQRTSUVZ';




const AnswerValue = ({ formValue, onChange = () => {} }) => {
  return (
    <div>
      <Form
        formDefaultValue={formValue}
        onChange={formValue => {
          if (_.isEmpty(formValue.value)) {
            formValue.value = null;
          }
          onChange(formValue);
        }}
        fluid
      >
      <FormGroup>
        <ControlLabel>Store value for the answer</ControlLabel>
        <FormControl
          name="value"
          accepter={Input}
        />
        <HelpBlock>
          Select the value for the answer <em>"{formValue.answer}"</em> (which is what the user will see), select tha real
          value that will be stored (generally a more concise string)
        </HelpBlock>
      </FormGroup>
      </Form>
    </div>
  );
};





const AnswerForm = ({ value, onChange, order }) => {
  const { questions } = useContext(SurveyEditorContext);
  const { question } = useContext(QuestionDetailContext)

  return (
    <div className="ui-survey-editor-multiple-answer">
      <div className="placeholder">{ALPHABET[order]}</div>
      <div className="answer">
        <Input value={value.answer} onChange={answer => onChange({ ...value, answer })}/>
      </div>
      <div className="controls">
        <IconButton
          className={classNames({ 'not-used': value.value == null })}
          icon={<Icon icon="align-justify" size="lg"/>}
          onClick={async () => {
            const what = await prompt(AnswerValue, value);
            if (what != null) {
              onChange({ ...value, value: what.value });
            }
          }}
        />
        &nbsp;
        <IconButton
          className={classNames({ 'not-used': value.jump == null })}
          icon={<Icon icon="arrow-circle-right" size="lg"/>}
          onClick={async () => {
            const what = await prompt(props => <GoToForm {...props} exclude={question.id} questions={questions} />, value);
            if (what != null) {
              onChange({ ...value, jump: what.jump });
            }
          }}
        />
      </div>
    </div>
  )
};


const Multiple = ({ data, onChange = () => {} }) => {
  return (
    <div className="control control-multiple">
      <CollectionEditor
        value={data}
        form={AnswerForm}
        onChange={onChange}
        labelAdd="Add answer"
        labelEmpty="No answers"
      />
    </div>
  );
};

export default Multiple;