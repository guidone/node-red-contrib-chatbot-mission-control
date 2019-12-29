import React, { useState } from 'react';
import { Button, FormControl, ButtonToolbar, FormGroup, ControlLabel } from 'rsuite';

import { plug } from '../../lib/code-plug';
import withSocket from '../../src/wrappers/with-socket';
import Panel from '../../src/components/grid-panel';
import { WidgetForm, Content, Footer } from '../../src/components/widget-form';

import './widget-send.scss';

const SendMessageWidget = ({ sendMessage, stats }) => {
   const [formValue, setFormValue] = useState({ message: '' });

  return (
    <Panel title="Send Message" className="widget-send-message">
      <WidgetForm fluid formValue={formValue} onChange={formValue => setFormValue(formValue)}>
        <Content>
          <FormGroup>
            <ControlLabel>Message to send</ControlLabel>
            <FormControl 
              name="message" 
              componentClass="textarea" 
              style={{ height: '100%' }}
              onKeyUp={event => {
                if (event.keyCode === 91) {
                  sendMessage('message.send', formValue.message);
                  setFormValue({ message: '' });
                }
              }}
            />
          </FormGroup>
        </Content>
        <Footer>
          <FormGroup>
            <ButtonToolbar>
              <Button appearance="primary" onClick={() => {
                sendMessage('message.send', formValue.message);
                setFormValue({ message: '' });
              }}>
                Send Message
              </Button>
              <div className="key-hint">
                ⌘ + Enter to Send
              </div>
              <Button style={{ float: 'right' }} appearance="default" onClick={() => setFormValue({ message: '' }) }>
                Cancel
              </Button> 
            </ButtonToolbar>
          </FormGroup>
        </Footer>
      </WidgetForm>
    </Panel>
  );
}

plug('widgets', withSocket(SendMessageWidget), { x: 0, y: 0, w: 2, h: 4, isResizable: true, id: 1 })


