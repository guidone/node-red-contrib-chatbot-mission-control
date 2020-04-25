import React, { useRef, Fragment, useContext } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { Icon, Whisper, Tooltip } from 'rsuite';

import { sortableHandle, sortableElement } from 'react-sortable-hoc';
//const SortableItem = sortableElement(Question);

const DragHandle = sortableHandle(() => <div className="grippy"></div>);

import { isFirstOfNested } from '../helpers';
import SurveyEditorContext from '../context';
import Tag from './tag';


const INDENT_SIZE = 8;



const IconTooltip = ({ icon, text, tooltip, color }) => {

  const dom = (
    <div className={classNames('ui-icon-tooltip', { [color]: true })}>
      <Icon icon={icon} />
      {text != null && <span className="text">{text}</span>}
    </div>
  );

  if (tooltip != null) {
    return (
      <Whisper trigger="hover" placement="top" speaker={<Tooltip>{tooltip}</Tooltip>}>
        {dom}
      </Whisper>
    );
  } else {
    return dom;
  }
};
IconTooltip.propTypes = {
  color: PropTypes.oneOf(['red', 'orange'])
};




const Question = ({
  question,
  onSelect = () => {},
  active = false,
  level = null
}) => {

  const { questions } = useContext(SurveyEditorContext);

  const forks = (_.isArray(question.data) ? question.data : [])
    .filter(answer => answer.jump != null)
    .map(answer => {
      const jumpTo = questions.find(question => question.id === answer.jump);
      if (jumpTo != null) {
        return (
          <IconTooltip
            key={jumpTo.tag}
            icon="code-fork"
            text={jumpTo.tag}
            color="orange"
            tooltip={`Jump to ${jumpTo.tag} if user selects "${answer.answer}"`}
          />
        );
      }
    });

  let warnings;
  if (question.parent != null && isFirstOfNested(questions, question)) {
    // find at least a question which jumps to this question, since it's nested
    // it will never be reached in the survey, only check for the first of the group
    // of nested questions
    const hasJump = _(questions).chain()
      .filter(question => question.type === 'multiple')
      .map(question => _.isArray(question.data) ? question.data : [])
      .flatten()
      .some(answer => answer.jump === question.id)
      .value();

    if (!hasJump) {
    warnings = (
      <IconTooltip
        icon="exclamation-triangle"
        key="jump-warning"
        color="red"
        tooltip={`No conditional jump to this question.
        This is a nested question and can only be reached in the survey with a conditional answer in a multiple choice question`}
      />
    );
    }
  }




  return (
    <div className={classNames('ui-survey-question', { active })}>
      {level != null && (
        <div className="indent" style={{ flex: `0 0 ${INDENT_SIZE * level}px`}}/>
      )}
      <DragHandle />
      <div className="content" onClick={e => {
        e.preventDefault();
        onSelect(question)
      }}>
        <div className="meta">
          <Tag>{question.tag}</Tag>

          <div className="icons">
            {forks}
            {warnings}
            {question.type === 'multiple' && (
              <IconTooltip
                icon="list"
                text={question.data.length}
                tooltip="Multiple choice question"
              />
            )}
            {question.type === 'text' && (
              <IconTooltip
                icon="font"
                tooltip="Free text question"
              />
            )}
            {question.type === 'number' && (
              <IconTooltip
                icon="percent"
                tooltip="Numeric question"
              />
            )}
            {question.type === 'image' && (
              <IconTooltip
                icon="image"
                tooltip="Image   question"
              />
            )}
          </div>

        </div>

        <div className="title">
          {question.title}
        </div>


      </div>

      <div className="selection-bar">

      </div>

    </div>
  );

}

export default sortableElement(Question);
