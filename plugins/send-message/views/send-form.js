import React from 'react';
import { FormControl, Form, FormGroup, ControlLabel, FlexboxGrid, HelpBlock } from 'rsuite';

import useGlobals from '../../../src/hooks/globals';
import { UserAutocomplete, SelectTransport } from '../../../src/components';

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
        <FormGroup style={{ marginTop: '15px' }}>
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
