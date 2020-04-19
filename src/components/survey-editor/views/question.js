import React, { useRef, Fragment } from 'react';

import classNames from 'classnames';
import { Icon, Whisper, Tooltip } from 'rsuite';

import { sortableHandle, sortableElement } from 'react-sortable-hoc';
//const SortableItem = sortableElement(Question);

const DragHandle = sortableHandle(() => <div className="grippy"></div>);


import Tag from './tag';


const INDENT_SIZE = 8;



const IconTooltip = ({ icon, text, tooltip }) => {

  const dom = (
    <div className="ui-icon-tooltip">
      <Icon icon={icon} />
      {text != null && <span class="text">{text}</span>}
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
}




const Question = ({
  question,
  onSelect = () => {},
  active = false,
  level = null
}) => {




  return (
    <div className={classNames('question', { active })}>
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
