import React from 'react';
import { FlexboxGrid, Notification } from 'rsuite';

import PageContainer from '../../../src/components/page-container';
import Breadcrumbs from '../../../src/components/breadcrumbs';
import InfoPanel from '../../../src/components/info-panel';
import withSocket from '../../../src/wrappers/with-socket';
import ConfigurationForm from '../views/form';
import useConfiguration from '../../../src/hooks/configuration';



const ConfigurationPage = ({ sendMessage }) => {

  const { loading, error, data, update } = useConfiguration({ 
    namespace: 'postcardbot',
    onCompleted: () => Notification.success({ title: 'Configuration', description: 'Configuration saved successful' }) 
  });

  return (
    <PageContainer className="page-configuration">
      <Breadcrumbs />
      <FlexboxGrid justify="space-between">
        <FlexboxGrid.Item colspan={17}>
          {loading && <div>loading</div>}
          {error && <div>error</div>}
          {!loading && !error && (
            <ConfigurationForm 
              disabled={loading}
              value={data}
              onSubmit={formValue => {
                sendMessage('mc.configuration', formValue);
                update(formValue);
              }}
            />
          )}
        </FlexboxGrid.Item>
        <InfoPanel colspan={7}>
          You can provide multiple callback functions that behave just like middleware, 
          except that these callbacks can invoke next('route') to bypass the remaining route callback(s). 
          You can use this mechanism to impose pre-conditions on a route, 
          then pass control to subsequent routes if there is no reason to proceed with the current route.
        </InfoPanel>
      </FlexboxGrid>
    </PageContainer>
  );

};

export default withSocket(ConfigurationPage);