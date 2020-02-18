import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import classNames from 'classnames';
import { Button } from 'rsuite';
import uniqueId from '../../helpers/unique-id';

import Item from './views/item';
import './style.scss';

const CollectionEditor = ({ 
  value = [], 
  onChange = () => {},    
  form,
  labelAdd = 'Add item',
  labelEmpty = 'No elements',
  hideArrows = false,
  style,
  disabled = false 
}) => {

  const addButton = (
    <Button
      size="sm"
      readOnly={disabled} 
      onClick={() => {
        console.log(_.uniqueId())
        onChange([...value, { id: uniqueId('c') }]);
      }}>
        {labelAdd}
    </Button>
  );

  return (
    <div className={classNames('ui-collection-editor', { disabled })} style={style}>
      {_.isEmpty(value) && (
        <div className="empty">
          <div>{labelEmpty}</div>          
          {addButton}
        </div>
      )}
      <div>
        {(value || []).map((item, idx) => (
          <Item 
            key={item.id}
            value={item}
            form={form}
            disabled={disabled}
            hideArrows={hideArrows} 
            onRemove={() => {
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
  readOnly: PropTypes.bool,
  hideArrows: PropTypes.bool,
  labelAdd: PropTypes.string,
  labelEmpty: PropTypes.string
};

export default CollectionEditor;