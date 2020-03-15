import React from 'react';
import { FlexboxGrid, Notification, Tag } from 'rsuite';

import PageContainer from '../../../src/components/page-container';
import Breadcrumbs from '../../../src/components/breadcrumbs';
import InfoPanel from '../../../src/components/info-panel';
import withSocket from '../../../src/wrappers/with-socket';
import ConfigurationForm from '../views/form';
import useConfiguration from '../../../src/hooks/configuration';

const ConfigurationPage = ({ sendMessage }) => {
  const { loading, saving, error, data, update } = useConfiguration({ 
    namespace: 'faq',
    onCompleted: () => Notification.success({ title: 'Configuration', description: 'Configuration saved successful' }) 
  });
  // TODO fix loading
  // TODO error component
  // TODO move to basic configuration layout the flexigird

  return (
    <PageContainer className="page-configuration">
      <Breadcrumbs pages={['Knowledge Base', 'Configuration']}/>
      <FlexboxGrid justify="space-between">
        <FlexboxGrid.Item colspan={17} style={{ paddingTop: '20px', paddingLeft: '20px' }}>
          {loading && <div>loading</div>}
          {error && <div>{error.message}</div>}
          {!loading && !error && (
            <ConfigurationForm 
              disabled={saving}
              value={data}
              onSubmit={formValue => {
                sendMessage('mc.configuration', formValue);
                update(formValue);
              }}
            />
          )}
        </FlexboxGrid.Item>
        <InfoPanel colspan={7}>
          what to configure

        </InfoPanel>
      </FlexboxGrid>
    </PageContainer>
  );
};

export default withSocket(ConfigurationPage);