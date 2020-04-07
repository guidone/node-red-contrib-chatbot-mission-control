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
    namespace: 'welcome',
    onCompleted: () => Notification.success({ title: 'Configuration', description: 'Configuration saved successful' })
  });
  // TODO fix loading
  // TODO error component
  // TODO move to basic configuration layout the flexigird

  return (
    <PageContainer className="page-configuration">
      <Breadcrumbs pages={['Configuration', 'Welcome message']}/>
      <FlexboxGrid justify="space-between">
        <FlexboxGrid.Item colspan={17} style={{ paddingTop: '20px', paddingLeft: '20px' }}>
          {loading && <div>loading</div>}
          {error && <div>{error.message}</div>}
          {!loading && !error && (
            <ConfigurationForm
              disabled={saving}
              value={data}
              onSubmit={formValue => {
                sendMessage('mc.configuration', { namespace: 'welcome', ...formValue });
                update(formValue);
              }}
            />
          )}
        </FlexboxGrid.Item>
        <InfoPanel colspan={7}>
          Configure the behaviour of the <Tag color="violet">New User</Tag> node.<br/>
          Select a content to show to the user when he joins the chatbot or a group. Use the <em>slug</em> field
          to group different articles that represents the same content (for example the different translations).<br/>
          To test the show content type <code>/start</code>
        </InfoPanel>
      </FlexboxGrid>
    </PageContainer>
  );
};

export default withSocket(ConfigurationPage);