import React, { useState } from 'react';
import { Modal, Button, Form, FormGroup, ControlLabel, FormControl, FlexboxGrid, HelpBlock, SelectPicker } from 'rsuite';

import JSONEditor from '../../../src/components/json-editor';
import Transport from '../../../src/components/transport';
import LanguagePicker from '../../../src/components/language-picker';

const ModalUser = ({ user, onCancel = () => {}, onSubmit = () => {}, disabled = false }) => {
  const [formValue, setFormValue] = useState({ 
    ...user, 
    payload: !_.isEmpty(user.payload) ? JSON.stringify(user.payload) : '' 
  });
  const [formError, setFormError] = useState(null);

  return (
    <Modal backdrop show onHide={onCancel} className="modal-user">
      <Modal.Header>
        <Modal.Title>Edit User <em>(id: {user.id})</em></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form 
          formValue={formValue} 
          formError={formError} 
          onChange={formValue => {
            setFormValue(formValue);
            setFormError(null);
          }} 
          fluid autoComplete="off"
        >
          <FormGroup className="chat-id">
            <ControlLabel>UserId</ControlLabel>
            <FormControl readOnly name="userId" className="user-id"/>
            <HelpBlock tooltip>userId cannot be modified for referencial integrity</HelpBlock>            
          </FormGroup>
          <FlexboxGrid justify="space-between" style={{ marginBottom: '20px' }}>      
            <FlexboxGrid.Item colspan={11}>
              <FormGroup>
                <ControlLabel>First Name</ControlLabel>
                <FormControl autoComplete="off" readOnly={disabled} name="first_name" />
              </FormGroup>
            </FlexboxGrid.Item>            
            <FlexboxGrid.Item colspan={11}>
              <FormGroup>
                <ControlLabel>Last Name</ControlLabel>
                <FormControl readOnly={disabled} name="last_name" />
              </FormGroup>
            </FlexboxGrid.Item>
          </FlexboxGrid>
          <FormGroup>
            <ControlLabel>Username</ControlLabel>
            <FormControl readOnly={disabled} name="username" />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Language</ControlLabel>
            <FormControl 
              readOnly={disabled} 
              name="language" 
              cleanable={false}
              block
              accepter={LanguagePicker}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Email</ControlLabel>
            <FormControl readOnly={disabled} name="email" />
          </FormGroup>
          <FormGroup>
            <ControlLabel>ChatIds</ControlLabel>
            <div className="chat-ids">
              {user.chatIds.map(item => (
                <div key={item.chatId} className="chat-id-item">
                  <div  className="transport">
                    <Transport transport={item.transport}/>
                  </div>
                  <div className="chat-id">
                    {item.chatId}
                  </div>
                </div>
              ))}
            </div>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Payload</ControlLabel>
            <FormControl readOnly={disabled} name="payload" accepter={JSONEditor} />
          </FormGroup>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          appearance="primary"
          disabled={disabled} 
          appearance="primary" 
          onClick={() => {
            let payload = null;
            if (!_.isEmpty(formValue.payload)) {
              try {
                payload = JSON.parse(formValue.payload);
              } catch(e) {
                setFormError({ payload: 'Invalid JSON '});
                return;
              }
            }
            onSubmit({ ...formValue, payload });
          }}
        >
          Save user
        </Button>
        <Button onClick={onCancel} appearance="subtle">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>

  );
};

export default ModalUser;

