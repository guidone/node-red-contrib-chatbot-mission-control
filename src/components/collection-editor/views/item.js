import React from 'react';
import { IconButton, FlexboxGrid, Icon } from 'rsuite';

const Item = ({ value, onChange = () => {}, onRemove = () => {}, onMoveUp = () => {}, onMoveDown = () =>{}, form, readOnly = false }) => {

  const Form = form;

  return (
    <div className="item">
      <FlexboxGrid>
        <FlexboxGrid.Item colspan={21}>
          <Form value={value} onChange={onChange}/>
        </FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={3} style={{ textAlign: 'right' }}>
          <IconButton 
            icon={<Icon icon="trash2" />} 
            size="sm"
            style={{ marginTop: '-23px' }}
            onClick={onRemove} 
          />

          <div className="ui-spin-button">
            <div className="top">
              <IconButton 
                disabled={onMoveUp == null}
                size="xs" 
                icon={<Icon icon="caret-up" />} 
                onClick={onMoveUp}
              />
            </div>
            <div className="bottom">
              <IconButton 
                disabled={onMoveDown == null}
                size="xs" 
                icon={<Icon icon="caret-down" />}
                onClick={onMoveDown}
              />
            </div>          
          </div>


        </FlexboxGrid.Item>
      </FlexboxGrid>
    </div>
  );


}

export default Item;