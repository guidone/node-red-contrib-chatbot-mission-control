import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { FlexboxGrid, SelectPicker, Toggle, Icon, IconButton, Modal, Button, FormGroup, ControlLabel, Form, FormControl, Portal } from 'rsuite';

import Transport from '../../../src/components/transport';

import LanguagePicker from '../../../src/components/language-picker';
import UserAutocomplete from '../../../src/components/user-autocomplete';

const TransportValue = (value, item) => (
  <div className="picker-item-transport">    
    <Transport transport={item.transport}/>
    &nbsp;<b>{item.name}</b>    
  </div>
);

const MenuItem = (label, item) => (
  <div className="picker-item-transport">
    <b>{item.name}</b><br/>
    <Transport transport={item.transport}/>
    &nbsp;<em>(id: {item.nodeId})</em>
  </div>
); 

// TODO default user in user autocomplete

const SimulatorParamsModal = ({ 
  params,
  onCancel = () => {},
  onSubmit = () => {},
  disabled = false,
  activeChatbots 
}) => {
  const [formValue, setFormValue] = useState(params);

  return (
    <Modal 
      backdrop 
      show 
      onHide={onCancel} 
      keyboard={false}
      className="modal-simulator">
      <Modal.Header>
        <Modal.Title>Simulator Configuration</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          formValue={formValue}
          onChange={newFormValue => {
            const values = {...newFormValue};
            // if user changed and has a predefined language, then set the language
            if (newFormValue.user != null && (formValue.user == null || formValue.user.id !== newFormValue.user.id) 
              && newFormValue.user.language) {
              values.language = newFormValue.user.language;
            }
            setFormValue(values);
          }}
          fluid
        >
        <FormGroup>
          <ControlLabel>Impersonated User</ControlLabel>
          <FormControl 
            accepter={UserAutocomplete}
            name="user"
            style={{ width: '100%' }}
            onChange2={user => {              
              if (user != null && user.language != null) {
                setFormValue({ ...formValue, language: user.language })
              }
            }}
          />              
        </FormGroup>

        <FlexboxGrid justify="space-between" style={{ marginBottom: '20px' }}>      
          <FlexboxGrid.Item colspan={11}>
            <FormGroup>
              <ControlLabel>Language</ControlLabel>
              <FormControl 
                accepter={LanguagePicker}
                name="language"
                block
              />            
          </FormGroup>  
          </FlexboxGrid.Item>            
          <FlexboxGrid.Item colspan={11}>
            <FormGroup>
              <ControlLabel>Transport</ControlLabel>
              <FormControl 
                accepter={SelectPicker}
                name="nodeId"
                renderValue={TransportValue}
                renderMenuItem={MenuItem}
                searchable={false}
                block
                size="sm"
                cleanable={false}            
                data={activeChatbots.map(chatbot => ({ value: chatbot.nodeId, label: chatbot.transport, ...chatbot }))}
              />            
            </FormGroup>  
          </FlexboxGrid.Item>
        </FlexboxGrid>                
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          appearance="primary"
          disabled={disabled} 
          appearance="primary" 
          onClick={() => onSubmit({ 
            ...formValue,
            chatBot: activeChatbots.find(chatbot => chatbot.nodeId === formValue.nodeId)
          })}
        >
          Save configuration
        </Button>
        <Button onClick={onCancel} appearance="subtle">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SimulatorParamsModal;