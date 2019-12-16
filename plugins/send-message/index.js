import React, { useState } from 'react';
import { Button, Form, FormControl, ButtonToolbar, FormGroup, ControlLabel } from 'rsuite';

import { plug } from '../../lib/code-plug';
import withState from '../../src/wrappers/with-state';
import withSocket from '../../src/wrappers/with-socket';
import Panel from '../../src/components/grid-panel';

const SendMessageWidget = ({ sendMessage, stats }) => {
   const [formValue, setFormValue] = useState({ message: '' });

  return (
    <Panel title="Send Message">
      <Form fluid formValue={formValue} onChange={formValue => setFormValue(formValue) }>
        <FormGroup>
          <ControlLabel>Message to send</ControlLabel>
          <FormControl rows={5} name="message" componentClass="textarea" />
        </FormGroup>
        <FormGroup>
          <ButtonToolbar>
            <Button appearance="primary" onClick={() => {
              sendMessage('send', formValue.message);
              setFormValue({ message: '' });
            }}>
              Send Message
            </Button>
            <Button appearance="default" onClick={() => setFormValue({ message: '' }) }>
              Cancel
            </Button> 

          </ButtonToolbar>
        </FormGroup>
      </Form>
    </Panel>
  );
}

plug('widgets', withState(withSocket(SendMessageWidget), ['stats']), { x: 1, y: 0, w: 2, h: 5, isResizable: false, id: 1 })

class SendPage extends React.Component {

  render() {

    return (
      <div>
        page send
      </div>
    );


  }


}

plug('sidebar', null, { id: 'send-message', label: 'Send Message', url: '/mc/send-message', icon: 'shield' })
plug('pages', SendPage, { url: '/mc/send-message' });


