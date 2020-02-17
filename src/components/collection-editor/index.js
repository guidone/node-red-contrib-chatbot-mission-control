import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Button } from 'rsuite';

import Item from './views/item';
import './style.scss';

const CollectionEditor = ({ 
  value = [], 
  onChange = () => {}, 
  readOnly = false, 
  form,
  labelAdd = 'Add item',
  labelEmpty = 'No elements',
  style 
}) => {

  const addButton = (
    <Button
      size="sm"
      disabled={readOnly} 
      onClick={() => {
        console.log(_.uniqueId())
        onChange([...value, { id: _.uniqueId() }]);
      }}>
        {labelAdd}
    </Button>
  );

  return (
    <div className="ui-collection-editor" style={style}>
      {_.isEmpty(value) && (
        <div className="empty">
          {labelEmpty}
          <br/>
          {addButton}
        </div>
      )}
      <div>
        {(value || []).map((item, idx) => (
          <Item 
            key={item.id}
            value={item}
            form={form}
            disabled={readOnly} 
            onRemove={() => {
              console.log('idx', idx)
              const cloned = [...value];
              cloned[idx] = null;
              onChange(_.compact(cloned));
            }}
            onChange={item => {
              const cloned = [...value];
              cloned[idx] = item;
              onChange(cloned);
            }}
            onMoveUp={idx > 0 ? () => {
              if (idx > 0) {
                const cloned = [...value];
                const temp = cloned[idx - 1];
                cloned[idx - 1] = cloned[idx];
                cloned[idx] = temp;
                onChange(cloned);
              }
            } : null}
            onMoveDown={idx < (value.length - 1) ? () => {
              if (idx < (value.length - 1)) {
                const cloned = [...value];
                const temp = cloned[idx + 1];
                cloned[idx + 1] = cloned[idx];
                cloned[idx] = temp;
                onChange(cloned);
              }
            } : null}
          />
        ))}
      </div>
      {!_.isEmpty(value) && (<div className="buttons">{addButton}</div>)}
    </div>
  );
};
CollectionEditor.propTypes = {
  value: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
  readOnly: PropTypes.bool
};

export default CollectionEditor;