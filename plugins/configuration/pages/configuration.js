import React, { useState } from 'react';

import { Button, Form, FormControl, ButtonToolbar, FormGroup, ControlLabel, FlexboxGrid, HelpBlock, Notification } from 'rsuite';
import { Link } from 'react-router-dom';

import PageContainer from '../../../src/components/page-container';
import Breadcrumbs from '../../../src/components/breadcrumbs';
import InfoPanel from '../../../src/components/info-panel';
import withSocket from '../../../src/wrappers/with-socket';

const ConfigurationPage = ({ sendMessage }) => {

  const [formValue, setFormValue] = useState({ param_1: '', param_2: '' });

  return (
    <PageContainer className="page-configuration">

      <Breadcrumbs />

      <FlexboxGrid justify="space-between">
        <FlexboxGrid.Item colspan={17}>
          <Form formValue={formValue} onChange={formValue => setFormValue(formValue)}>
          
            <FormGroup>
              <ControlLabel>Username</ControlLabel>
              <FormControl name="param_1" />
              <HelpBlock>Required</HelpBlock>
            </FormGroup>
            <FormGroup>
              <ControlLabel>Email</ControlLabel>
              <FormControl name="param_2" type="email" />
              <HelpBlock tooltip>I am a tooltip</HelpBlock>
            </FormGroup>
          
            <FormGroup>
              <ButtonToolbar>
                <Button appearance="primary" onClick={() => {
                  console.log('sending', formValue);
                  sendMessage('mc.configuration', formValue);
                  Notification.success({ title: 'Configuration', description: 'Configuration saved successful' });
                }}>
                  Send Message
                </Button>
                <Button appearance="default" onClick={() => setFormValue({ message: '' }) }>
                  Cancel
                </Button> 
              </ButtonToolbar>
            </FormGroup>
      
          </Form>
        
        </FlexboxGrid.Item>
        <InfoPanel colspan={7}>

        You can provide multiple callback functions that behave just like middleware, except that these callbacks can invoke next('route') to bypass the remaining route callback(s). You can use this mechanism to impose pre-conditions on a route, then pass control to subsequent routes if there is no reason to proceed with the current route.

        </InfoPanel>
      
      </FlexboxGrid>


      
    </PageContainer>
  );

};

export default withSocket(ConfigurationPage);