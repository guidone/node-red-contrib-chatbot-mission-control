import React, { useState, useEffect } from 'react';
import { Form, FormGroup, FormControl, Dropdown, ButtonToolbar, Button, ButtonGroup, IconButton, Icon } from 'rsuite';

import confirm from '../../confirm';

import Tag from './tag';
import Multiple from './controls/multiple';


import '../styles/question-detail.scss';

const CONTROLS = [
  { type: 'multiple', label: 'Multiple Choice', default: [] },
  { type: 'text', label: 'Free Text', default: null },
  { type: 'number', label: 'Number', default: null },
  { type: 'image', label: 'Upload image', default: null }
];




const QuestionDetail = ({
  question,
  onChange = () => {},
  onRemove = () => {},
  onAdd = () => {}
}) => {

  let configuration;
  switch (question.type) {
    case 'multiple':
      configuration = (
        <Multiple
          data={question.data}
          onChange={data => onChange({ ...question, data })}
        />
      );
      break;
    default:
      configuration = (
        <div className="control control-empty">
          No configuration available for this type of question
        </div>
      );
  }


  return (
    <div className="question-detail">
      <div className="header">
        <Tag size="large">{question.tag}</Tag>
        <div className="buttons">
          <ButtonToolbar>
            <Dropdown
              renderTitle={()=>{
                return <IconButton appearance="primary" icon={<Icon icon="plus" />} />
              }}
            >
              <Dropdown.Item onSelect={() => onAdd({ after: question })}>Add question after</Dropdown.Item>
              <Dropdown.Item onSelect={() => onAdd({ before: question })}>Add question before</Dropdown.Item>
              <Dropdown.Item onSelect={() => onAdd({ nested: question })}>Add nested question</Dropdown.Item>
            </Dropdown>
            <IconButton
              onClick={async () => {
                if (await confirm(
                  <div>
                    Remove the question <Tag>{question.tag}</Tag> <em>"{question.title}"</em> ?
                  </div>,
                  { okLabel: 'Yes, remove' }
                )) {
                  onRemove(question);
                }
              }}
              icon={<Icon icon="trash2" />}
            />
          </ButtonToolbar>
        </div>

      </div>
      <div className="title">
        <textarea
          className="rs-input"
          rows={3}
          value={question.title}
          onChange={e => onChange({ ...question, title: e.target.value })}
        />
      </div>
      <ButtonToolbar>
        <ButtonGroup>
          {CONTROLS.map(control => (
            <Button
              key={control.type}
              appearance={question.type === control.type ? 'primary' : 'ghost'}
              onClick={() => onChange({ ...question, type: control.type, data: control.default })}
            >
              {control.label}
            </Button>
          ))}
        </ButtonGroup>
      </ButtonToolbar>
      <div className="configuration">
        {configuration}
      </div>
    </div>
  );

}

export default QuestionDetail;
