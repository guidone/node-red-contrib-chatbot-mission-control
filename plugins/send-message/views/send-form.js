import React, { useState } from 'react';
import { Button, FormControl, ButtonToolbar, Form, FormGroup, ControlLabel, FlexboxGrid, SelectPicker, HelpBlock } from 'rsuite';

//import SendMessageButton from './views/send-message-button';

//import { plug } from '../../lib/code-plug';
//import withSocket from '../../src/wrappers/with-socket';
import useGlobals from '../../../src/hooks/globals';
//import Panel from '../../src/components/grid-panel';
//import { WidgetForm, Content, Footer } from '../../src/components/widget-form';
import UserAutocomplete from '../../../src/components/user-autocomplete';
import SelectTransport from '../../../src/components/select-transport';



const hasChatbot = (activeChatbots, transport) => activeChatbots.some(chatbot => chatbot.transport === transport);


const SendMessageForm = ({
  value: formValue,
  validation,
  onChange = () => {},
  onSubmit = () => {}
}) => {
  const { activeChatbots } = useGlobals();

  return (
    <div>
      <Form fluid formValue={formValue} onChange={onChange} formError={validation}>
        <FlexboxGrid justify="space-between">
          <FlexboxGrid.Item colspan={15}>
            <FormGroup>
              <ControlLabel>Recipient</ControlLabel>
              <FormControl
                name="recipient"
                accepter={UserAutocomplete}
                cleanable={true}
                onChange={user => {
                  if (user != null && _.isArray(user.chatIds) && !_.isEmpty(user.chatIds)) {
                    // select the first chatId with an available active chatbot
                    const item = user.chatIds.find(chat => {
                      return hasChatbot(activeChatbots, chat.transport);
                    });
                    if (item != null) {
                      onChange({
                        ...formValue,
                        chatId: item.chatId,
                        recipient: user,
                        botNode: activeChatbots.find(chatbot => chatbot.transport === item.transport).nodeId
                      });
                    }
                  }
                }}
              />
            </FormGroup>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={8}>
          <FormGroup>
              <ControlLabel>
                Transport
                <HelpBlock tooltip>Shows only platforms for which the selected users has a valid <em>chatId</em></HelpBlock>
              </ControlLabel>
              <FormControl
                name="botNode"
                accepter={SelectTransport}
                transports={formValue.recipient != null ?
                  formValue.recipient.chatIds.map(item => item.transport)
                  : null
                }
                disabled={formValue.recipient == null}
                onChange={nodeId => {
                  // find the right
                  const activeChatBot = activeChatbots.find(item => item.nodeId === nodeId);
                  if (activeChatBot != null && formValue.recipient != null) {
                    const row = formValue.recipient.chatIds.find(item => item.transport === activeChatBot.transport);
                    if (row != null) {
                      onChange({ ...formValue, chatId: row.chatId, botNode: nodeId });
                    }
                  }
                }}
                block
              />
            </FormGroup>
          </FlexboxGrid.Item>
        </FlexboxGrid>
        <FormGroup>
          <ControlLabel>Message to send</ControlLabel>
          <FormControl
            name="message"
            componentClass="textarea"
            style={{ height: '100%' }}
            onKeyUp={event => {
              if (event.shiftKey && event.keyCode === 13) {
                onSubmit();
                onChange({ ...formValue, message: '' });
              }
            }}
          />
        </FormGroup>
      </Form>
    </div>
  );
};

export default SendMessageForm;
