import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import classNames from 'classnames';
import { Button } from 'rsuite';
import { sortableContainer } from 'react-sortable-hoc';


import uniqueId from '../../helpers/unique-id';

import Item from './views/item';
import './style.scss';
import { max } from 'moment';

const SortableContainer = sortableContainer(({ children }) => {
  return <div>{children}</div>;
});


const CollectionEditor = ({
  value = [],
  onChange = () => {},
  form,
  labelAdd = 'Add item',
  labelEmpty = 'No elements',
  sortable = true,
  style,
  disabled = false,
  disableAdd = false,
  minItems,
  maxItems,
  ...rest
}) => {
  const onSortEnd = ({ oldIndex, newIndex }) => {
    // do not move into itself
    if (oldIndex === newIndex) {
      return;
    }
    const newValue = [...value];
    const startIndex = newIndex < 0 ? newValue.length + newIndex : newIndex;
	  const item = newValue.splice(oldIndex, 1)[0];
    newValue.splice(startIndex, 0, item);
    onChange(newValue);
  };

  const items = value || [];
  const canAdd = !disabled && !disableAdd && (maxItems == null || maxItems > items.length);



  const addButton = (
    <Button
      size="sm"
      disabled={!canAdd}
      onClick={() => onChange([...value, { id: uniqueId('c') }])}
    >
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
      <SortableContainer onSortEnd={onSortEnd} helperClass="sorting" useDragHandle>
        {items.map((item, idx) => (
          <Item
            key={item.id}
            value={item}
            form={form}
            disabledIHHOC={disabled} /* Disabled is intercepted by HOC */
            index={idx}
            sortable={sortable}
            order={idx}
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
            canRemove={minItems == null || items.length > minItems}
            {...rest}
          />
        ))}
      </SortableContainer>
      {!_.isEmpty(value) && (<div className="buttons">{addButton}</div>)}
    </div>
  );
};
CollectionEditor.propTypes = {
  value: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  disableAdd: PropTypes.bool,
  sortable: PropTypes.bool,
  labelAdd: PropTypes.string,
  labelEmpty: PropTypes.string,
  minItems: PropTypes.number,
  maxItems: PropTypes.number
};




export { CollectionEditor as default }