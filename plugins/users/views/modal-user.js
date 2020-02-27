import React, { useState } from 'react';
import { Modal, Button, Form, FormGroup, ControlLabel, FormControl, FlexboxGrid, HelpBlock, Nav } from 'rsuite';

import { Views } from '../../../lib/code-plug';
import JSONEditor from '../../../src/components/json-editor';
import Transport from '../../../src/components/transport';
import LanguagePicker from '../../../src/components/language-picker';


const ModalUser = ({ user, onCancel = () => {}, onSubmit = () => {}, disabled = false }) => {
  const [formValue, setFormValue] = useState({ ...user });
  const [jsonValue, setJsonValue] = useState({
    json: !_.isEmpty(user.payload) ? JSON.stringify(user.payload) : ''
  });
  const [formError, setFormError] = useState(null);
  const [tab, setTab] = useState('user-details');

  return (
    <Modal backdrop show onHide={onCancel} className="modal-user">
      <Modal.Header>
        <Modal.Title>Edit User <em>(id: {user.id})</em></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Nav 
          appearance="tabs" 
          active={tab} 
          onSelect={tab => {
            // tab is switched to manual edit of payload, make sure the current payload field is serialized
            // in serialized payload in order to show the updated one
            if (tab === 'user-payload') {
              setJsonValue({                  
                json: !_.isEmpty(formValue.payload) ? JSON.stringify(formValue.payload) : ''
              });
            }
            setTab(tab);
          }} 
          activeKey={tab} 
          style={{ marginBottom: '15px' }}
        >
          <Nav.Item eventKey="user-details">User details</Nav.Item>
          <Views region="user-tabs">
            {(View, { label, id}) => <Nav.Item active={id === tab} eventKey={id} onSelect={() => setTab(id)}>{label}</Nav.Item>}
          </Views>
          <Nav.Item eventKey="user-payload">User payload</Nav.Item>          
        </Nav>
        {tab === 'user-details' && (
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
            <FlexboxGrid justify="space-between" style={{ marginBottom: '20px' }}>      
              <FlexboxGrid.Item colspan={11}>
                <FormGroup>
                  <ControlLabel>Username</ControlLabel>
                  <FormControl readOnly={disabled} name="username" />
                </FormGroup>
              </FlexboxGrid.Item>
              <FlexboxGrid.Item colspan={11}>
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
              </FlexboxGrid.Item>
            </FlexboxGrid>          
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
          </Form>
        )}
        {tab === 'user-payload' && (
          <Form 
            formValue={jsonValue} 
            formError={formError}              
            fluid autoComplete="off"
          >
            <FormGroup>
              <ControlLabel>Payload</ControlLabel>
              <FormControl 
                readOnly={disabled} 
                name="json" 
                accepter={JSONEditor}
                onChange={json => {
                  if (!_.isEmpty(json)) {
                    let payload;
                    setJsonValue({ json });
                    try {
                      payload = JSON.parse(json);
                    } catch(e) {    
                      // error do nothing                
                      return;
                    }                    
                    setFormValue({ ...formValue, payload });
                  }
                }}
              />
            </FormGroup>
          </Form>
        )}
        <Views region="user-tabs">
          {(View, { id }) => {        
            if (id === tab) {
              return (
                <View 
                  key={id} 
                  formValue={formValue.payload}
                  onChange={payload => setFormValue({ ...formValue, payload })}
                />
              );
            }
            return <div/>;
          }}
        </Views>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          appearance="primary"
          disabled={disabled} 
          appearance="primary" 
          onClick={() => onSubmit(formValue)}
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

