import React, { useState } from 'react';

import { Button, Form, FormControl, ButtonToolbar, FormGroup, ControlLabel, FlexboxGrid, HelpBlock, Notification } from 'rsuite';
import { Link } from 'react-router-dom';
import { Query, useQuery, useMutation } from 'react-apollo';

import PageContainer from '../../../src/components/page-container';
import Breadcrumbs from '../../../src/components/breadcrumbs';
import InfoPanel from '../../../src/components/info-panel';
import withSocket from '../../../src/wrappers/with-socket';

import gql from 'graphql-tag';

const GET_CONFIGURATION = gql`
query($namespace: String) {
  configurations(namespace: $namespace) {
    id
    namespace
    payload
  }
}
`;

const UPDATE_CONFIGURATION = gql`
mutation($configuration: NewConfiguration!) {
  createConfiguration(configuration: $configuration) {
    id,
    namespace,
    payload
  }
}
`;

import ConfigurationForm from '../views/form';

const ConfigurationPage = ({ sendMessage }) => {

  const { loading, error, data } = useQuery(GET_CONFIGURATION, {
    variables: { namespace: 'postcardbot' },
  });

  const [
    updateConfiguration,
    { loading: mutationLoading, error: mutationError },
  ] = useMutation(UPDATE_CONFIGURATION, {
    onCompleted: () => Notification.success({ title: 'Configuration', description: 'Configuration saved successful' })
  });

  //const [formValue, setFormValue] = useState({ param_1: '', param_2: '' });


  let formValue = {};
  if (data != null && data.configurations != null && data.configurations.length !== 0) {
    formValue = JSON.parse(data.configurations[0].payload);
    console.log('cosa??', formValue)
  } 

  return (
    <PageContainer className="page-configuration">

      <Breadcrumbs />

      <FlexboxGrid justify="space-between">
        <FlexboxGrid.Item colspan={17}>

          {loading && <div>loading</div>}
          {error && <div>error</div>}
          {!loading && !error && (
            <ConfigurationForm 
              disabled={loading || mutationLoading}
              value={formValue}
              onSubmit={formValue => {
                console.log('savlo', formValue)
                //console.log('sending', formValue);
                sendMessage('mc.configuration', formValue);
                
                updateConfiguration({ 
                  variables: { 
                    configuration: {
                      namespace: 'postcardbot',
                      payload: JSON.stringify(formValue)
                    } 
                  }
                });


              }}
            />
          )}
        
              
            
        </FlexboxGrid.Item>
        <InfoPanel colspan={7}>

        You can provide multiple callback functions that behave just like middleware, except that these callbacks can invoke next('route') to bypass the remaining route callback(s). You can use this mechanism to impose pre-conditions on a route, then pass control to subsequent routes if there is no reason to proceed with the current route.

        </InfoPanel>
      
      </FlexboxGrid>


      
    </PageContainer>
  );

};

export default withSocket(ConfigurationPage);