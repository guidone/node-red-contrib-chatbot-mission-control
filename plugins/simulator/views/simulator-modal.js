import React, { useState } from 'react'
import _ from 'lodash';
import PropTypes from 'prop-types';
import { FlexboxGrid, Modal, Button, FormGroup, ControlLabel, Form, FormControl } from 'rsuite';

import LanguagePicker from '../../../src/components/language-picker';
import UserAutocomplete from '../../../src/components/user-autocomplete';
import SelectTransport from '../../../src/components/select-transport';



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
            placeholder="Test User"
            style={{ width: '100%' }}
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
                accepter={SelectTransport}
                name="nodeId"
                block
                size="sm"
                cleanable={false}
              />
            </FormGroup>
          </FlexboxGrid.Item>
        </FlexboxGrid>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onCancel} appearance="subtle">
          Cancel
        </Button>
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
      </Modal.Footer>
    </Modal>
  );
};
SimulatorParamsModal.propTypes = {
  params: PropTypes.shape({
    language: PropTypes.string,
    user: PropTypes.shape({
      id: PropTypes.number,
      userId: PropTypes.string,
      username: PropTypes.string,
      language: PropTypes.string
    }),
    nodeId: PropTypes.string
  }),
  disabled: PropTypes.bool,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  activeChatbots: PropTypes.arrayOf(PropTypes.shape({
    transport: PropTypes.string,
    nodeId: PropTypes.string,
    name: PropTypes.string
  }))
};

export default SimulatorParamsModal;