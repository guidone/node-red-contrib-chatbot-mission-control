import React from 'react';
import PropTypes from 'prop-types';
import { FlexboxGrid, Notification, Tag, Button } from 'rsuite';

import PageContainer from '../../../src/components/page-container';
import Breadcrumbs from '../../../src/components/breadcrumbs';
import InfoPanel from '../../../src/components/info-panel';
import ChatbotStatus from '../../../src/components/chatbot-status';
import withSocket from '../../../src/wrappers/with-socket';
import ConfigurationForm from '../views/form';
import useConfiguration from '../../../src/hooks/configuration';

const BREADCRUMBS = [
  { title: 'Knowledge Base', url: '/knowledge-base' }, 
  'Configuration'
];

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
      <Breadcrumbs pages={BREADCRUMBS}/>
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
          Configure the <b>Knowledge Base</b> block, use the <b>Articles</b> section to enter the knowledge base of your product or
          service.<br/>
          For articles that represent the same content but in different languages, use the same <em>slug</em>, the block will take care of 
          the rest.<br/>
          Adjust the sensitivity of the search engine, raise it when the results are not relevant to the user's question, lower it when the
          search is not returning anything, keep an eye on the system console to see the score of the searches.<br/>
          With <b>Answer by Default</b> Tthe block can answer automatically to any input text message or can start answering only when the
          chatbot in <ChatbotStatus>faq.answer</ChatbotStatus> status, which is entered when the user types senteces like <em>"I need help"</em>. 
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <Button
              appearance="primary"
              onClick={() => {
                sendMessage('faq.refresh');
                Notification.success({ title: 'Knowledge Base', description: 'Re-index of articles started' })
              }}
              >Refresh index</Button>
          </div>
        </InfoPanel>
      </FlexboxGrid>
    </PageContainer>
  );
};


export default withSocket(ConfigurationPage);