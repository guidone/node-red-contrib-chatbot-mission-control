import React, { useState } from 'react';

import { Button, Form, FormControl, ButtonToolbar, FormGroup, ControlLabel, FlexboxGrid } from 'rsuite';
import { Link } from 'react-router-dom';

import PageContainer from '../../../src/components/page-container';
import Breadcrumbs from '../../../src/components/breadcrumbs';
import InfoPanel from '../../../src/components/info-panel';

const ConfigurationPage = () => {

  const [formValue, setFormValue] = useState({ message: '' });

  return (
    <PageContainer className="page-configuration">

      <Breadcrumbs />

      <FlexboxGrid justify="space-between">
        <FlexboxGrid.Item colspan={17}>
          <Form fluid formValue={formValue} onChange={formValue => setFormValue(formValue)}>
          
            <FormGroup>
              <ControlLabel>Message to send</ControlLabel>
              <FormControl name="message" componentClass="textarea" style={{ height: '100%' }}/>
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
        
        </FlexboxGrid.Item>
        <InfoPanel colspan={7}>

        You can provide multiple callback functions that behave just like middleware, except that these callbacks can invoke next('route') to bypass the remaining route callback(s). You can use this mechanism to impose pre-conditions on a route, then pass control to subsequent routes if there is no reason to proceed with the current route.

        </InfoPanel>
      
      </FlexboxGrid>


      
    </PageContainer>
  );

};

export default ConfigurationPage;