import React, { useState } from 'react';
import { Button, FormControl, ButtonToolbar, FormGroup, ControlLabel, FlexboxGrid, SelectPicker, HelpBlock } from 'rsuite';

import SendMessageButton from './views/send-message-button';

import { plug } from '../../lib/code-plug';
import withSocket from '../../src/wrappers/with-socket';
import useGlobals from '../../src/hooks/globals';
import Panel from '../../src/components/grid-panel';
import { WidgetForm, Content, Footer } from '../../src/components/widget-form';
import UserAutocomplete from '../../src/components/user-autocomplete';
import SelectTransport from '../../src/components/select-transport';

import './widget-send.scss';

const hasChatbot = (activeChatbots, transport) => activeChatbots.some(chatbot => chatbot.transport === transport);


const SendMessageWidget = ({ sendMessage, stats }) => {
  const { activeChatbots } = useGlobals();
  const [formValue, setFormValue] = useState({ message: '' });
  const [chatId, setChatId] = useState(null);

  console.log('---activeChatbots', activeChatbots)

  const canSend = !_.isEmpty(chatId) && !_.isEmpty(formValue.botNode);
  return (
    <Panel title="Send Message" className="widget-send-message">
      <WidgetForm fluid formValue={formValue} onChange={formValue => setFormValue(formValue)}>
        <Content>
          <FlexboxGrid justify="space-between">
            <FlexboxGrid.Item colspan={15}>
              <FormGroup>
                <ControlLabel>Recipient</ControlLabel>
                <FormControl
                  name="recipient"
                  accepter={UserAutocomplete}
                  cleanable={true}
                  onChange={user => {
                    console.log('user', user)
                    if (user != null && _.isArray(user.chatIds) && !_.isEmpty(user.chatIds)) {
                      // select the first chatId with an available active chatbot
                      const item = user.chatIds.find(chat => {
                        return hasChatbot(activeChatbots, chat.transport);
                      })
                      console.log('teova', item);
                      if (item != null) {
                        setChatId(item.chatId);
                        setFormValue({
                          ...formValue,
                          recipient: user,
                          botNode: activeChatbots.find(chatbot => chatbot.transport === item.transport).nodeId
                        })
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
                    console.log('seelcted', nodeId)
                    // find the right
                    const activeChatBot = activeChatbots.find(item => item.nodeId === nodeId);
                    console.log('activeChatBot', activeChatBot)
                    if (activeChatBot != null && formValue.recipient != null) {
                      const row = formValue.recipient.chatIds.find(item => item.transport === activeChatBot.transport);
                      if (row != null) {
                        setChatId(row.chatId);
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
                  sendMessage('message.send', { ...formValue, chatId });
                  setFormValue({ ...formValue, message: '' });
                }
              }}
            />
          </FormGroup>
        </Content>
        <Footer>
          <FormGroup>
            <ButtonToolbar>
              <Button appearance="primary" disabled={!canSend} onClick={() => {
                console.log('send---', { ...formValue, chatId })
                // TODO put back
                sendMessage('message.send', { ...formValue, chatId });
                setFormValue({ ...formValue, message: '' });
              }}>
                Send Message
              </Button>
              <div className="key-hint">
                Shift + Enter to Send
              </div>
              <Button style={{ float: 'right' }} appearance="default" onClick={() => {
                setFormValue({ botNode: null, message: '' });
                setChatId(null);
              }}>
                Cancel
              </Button>
            </ButtonToolbar>
          </FormGroup>
        </Footer>
      </WidgetForm>
    </Panel>
  );
}

plug('widgets', withSocket(SendMessageWidget), { x: 0, y: 0, w: 2, h: 6, isResizable: true, id: 1 });

// register button in the user modal to redirect to survey lists
plug(
  'user-button',
  SendMessageButton
);
plug(
  'user-record-buttons',
  ({ record }) => <SendMessageButton transport={record.transport} appearance="primary" user={record.user}/>,
  {
    type: 'survey'
  }
);
