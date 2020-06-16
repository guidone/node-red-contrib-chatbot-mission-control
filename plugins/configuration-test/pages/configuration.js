import React from 'react';
import { FlexboxGrid, Notification } from 'rsuite';

import PageContainer from '../../../src/components/page-container';
import Breadcrumbs from '../../../src/components/breadcrumbs';
import InfoPanel from '../../../src/components/info-panel';


const ConfigurationPage = () => {

  return (
    <PageContainer className="page-configuration">
      <Breadcrumbs pages={['Configuration', 'Opening Hours']}/>
      <FlexboxGrid justify="space-between">
        <FlexboxGrid.Item colspan={17} style={{ paddingTop: '20px' }}>
          test page
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

export default ConfigurationPage;