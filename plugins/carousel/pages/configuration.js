import React from 'react';
import { FlexboxGrid, Notification, Icon } from 'rsuite';

import PageContainer from '../../../src/components/page-container';
import Breadcrumbs from '../../../src/components/breadcrumbs';
import InfoPanel from '../../../src/components/info-panel';
import ConfigurationForm from '../views/form';
import useConfiguration from '../../../src/hooks/configuration';

const ConfigurationPage = () => {
  const { loading, saving, error, data, update } = useConfiguration({
    namespace: 'carousel',
    onCompleted: () => Notification.success({ title: 'Configuration', description: 'Configuration saved successful' })
  });
  // TODO fix loading
  // TODO error component
  // TODO move to basic configuration layout the flexigird

  return (
    <PageContainer className="page-configuration">
      <Breadcrumbs pages={['Configuration', 'Carousel']}/>
      <FlexboxGrid justify="space-between">
        <FlexboxGrid.Item colspan={17} style={{ paddingTop: '20px', paddingLeft: '20px' }}>
          {loading && <div>loading</div>}
          {error && <div>{error.message}</div>}
          {!loading && !error && (
            <ConfigurationForm
              disabled={saving}
              value={data}
              onSubmit={formValue => update(formValue)}
            />
          )}
        </FlexboxGrid.Item>
        <InfoPanel colspan={7}>
          Select a list of contents <em>by slug</em>, each of them will appear as a separate card in the chatbot. A slug is used
          to group different articles that represent the same content in different languages. Click on the language label to edit
          the content for a specific language or click on <Icon icon="plus-square"/> to create one.
        </InfoPanel>
      </FlexboxGrid>
    </PageContainer>
  );
};

export default ConfigurationPage;