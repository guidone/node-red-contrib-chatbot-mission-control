import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, FlexboxGrid, Icon } from 'rsuite';
import classNames from 'classnames';

const Item = ({
  value,
  onChange = () => {},
  onRemove = () => {},
  onMoveUp = () => {},
  onMoveDown = () =>{},
  form,
  disabled = false,
  hideArrows = false,
  ...rest
}) => {

  const Form = form;

  return (
    <div className="item">
      <FlexboxGrid>
        <FlexboxGrid.Item colspan={21}>
          <Form
            value={value}
            onChange={onChange}
            disabled={disabled}
            {...rest}
          />
        </FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={3} style={{ textAlign: 'right' }} className="button">
          <IconButton
            disabled={disabled}
            icon={<Icon icon="close" />}
            size="sm"
            style={!hideArrows ? { marginTop: '-23px' } : null}
            onClick={onRemove}
          />
          {!hideArrows && (
            <div className="ui-spin-button">
              <div className="top">
                <IconButton
                  disabled={onMoveUp == null || disabled}
                  size="xs"
                  icon={<Icon icon="caret-up" />}
                  onClick={onMoveUp}
                />
              </div>
              <div className="bottom">
                <IconButton
                  disabled={onMoveDown == null || disabled}
                  size="xs"
                  icon={<Icon icon="caret-down" />}
                  onClick={onMoveDown}
                />
              </div>
            </div>
          )}
        </FlexboxGrid.Item>
      </FlexboxGrid>
    </div>
  );
};
Item.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
  onRemove: PropTypes.func,
  onMoveUp: PropTypes.func,
  onMoveDown: PropTypes.func,
  disabled: PropTypes.bool,
  hideArrows: PropTypes.bool
};

export default Item;