import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Icon } from 'rsuite';
import { sortableHandle, sortableElement } from 'react-sortable-hoc';
import Grippy from '../../grippy';

const DragHandle = sortableHandle(() => <Grippy height={36}/>);

const Item = ({
  value,
  onChange = () => {},
  onRemove = () => {},
  onMoveUp = () => {},
  onMoveDown = () =>{},
  form,
  disabled = false,
  ...rest
}) => {
  const Form = form;

  return (
    <div className="ui-collection-item">
      <div className="handle">
        <DragHandle />
      </div>
      <div className="form">
        <Form
          value={value}
          onChange={onChange}
          disabled={disabled}
          {...rest}
        />
      </div>
      <div className="control-buttons">
        <IconButton
            disabled={disabled}
            icon={<Icon icon="close" />}
            size="sm"
            onClick={onRemove}
          />
      </div>
    </div>
  );
};
Item.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
  onRemove: PropTypes.func,
  onMoveUp: PropTypes.func,
  onMoveDown: PropTypes.func,
  disabled: PropTypes.bool
};

export default sortableElement(Item);