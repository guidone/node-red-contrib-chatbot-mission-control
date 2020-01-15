import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import classNames from 'classnames';
import _ from 'lodash';
import { Table, Icon, SelectPicker, Placeholder, Input, ButtonGroup, Button } from 'rsuite';

import { useHistory } from 'react-router-dom';

const { Column, HeaderCell, Cell, Pagination } = Table;
const { Grid } = Placeholder

import withMessageTypes from '../../../src/wrappers/with-message-types';
import withPlatforms from '../../../src/wrappers/with-platforms';
import PageContainer from '../../../src/components/page-container';
import MessageType from '../../../src/components/message-type';
import Transport from '../../../src/components/transport';
import Breadcrumbs from '../../../src/components/breadcrumbs';
import SmartDate from '../../../src/components/smart-date';
import useRouterQuery from '../../../src/hooks/router-query';

// import '../styles/message-logs.scss';

const CONTENTS = gql`
query($offset: Int, $limit: Int) {
  counters {
    contents {
     count
    }
  }
  contents(offset: $offset, limit: $limit) {
    id,
    slug,
    title,
    body 
  }
}
`;

import useContents from '../hooks/content';
import ModalContent from '../views/modal-content';


const Contents = ({ messageTypes, platforms }) => {
  const { query: { chatId: urlChatId, messageId: urlMessageId, userId: urlUserId }, setQuery } = useRouterQuery();
  const [ cursor, setCursor ] = useState({ page: 1, limit: 10 });
  const [ filters, setFilters ] = useState({ chatId: urlChatId, userId: urlUserId, messageId: urlMessageId });
  //const { messageType, transport, inbound, chatId, userId, messageId } = filters;
  const { limit, page } = cursor;
  
  const [ content, setContent ] = useState(null);

  const { loading, saving, error, data, deleteContent, editContent, createContent, refetch } = useContents({ limit, page });
  
  return (
    <PageContainer className="page-contents">
      <Breadcrumbs pages={['Contents']}/>
      {content != null && (
        <ModalContent 
          content={content}
          disabled={saving}
          onCancel={() => setContent(null)}
          onSubmit={async content => {
            console.log('saving', content.id, content)
            await editContent({ variables: { id: content.id, content: _.omit(content, ['id', 'createdAt', '__typename']) }})              
            setContent(null);
            refetch();        
          }}
        />)}

      <div className="filters" style={{ marginBottom: '10px' }}>
             
      </div>

      {loading && <Grid columns={9} rows={3} />}
      {error && <div>error</div>}
      {!error && !loading && (
        <Table
          height={600}
          data={data.contents}
          loading={loading}
          renderEmpty={() => <div style={{ textAlign: 'center', padding: 80}}>No Content</div>}
          autoHeight
        >
          <Column width={60} align="center">
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column width={140} resizable>
            <HeaderCell>Date</HeaderCell>            
            <Cell>
              {({ createdAt }) => <SmartDate date={createdAt} />}
            </Cell>
          </Column>

          <Column width={260} align="left">
            <HeaderCell>Title</HeaderCell>
            <Cell dataKey="title" />
          </Column>

          <Column width={80} align="left">
            <HeaderCell>Slug</HeaderCell>
            <Cell dataKey="slug" />
          </Column>

          <Column width={300} flexGrow={1}>
            <HeaderCell>Body</HeaderCell>
            <Cell dataKey="body" />
          </Column>

          <Column width={80}>
            <HeaderCell>Action</HeaderCell>
            <Cell>
              {content => (
                <ButtonGroup>
                  <Button 
                    disabled={saving} 
                    size="xs"
                    onClick={() => {
                      const name = [user.first_name, user.last_name].join(' ');
                      if (confirm(`Delete user${!_.isEmpty(name.trim()) ? ` "${name}"` : ''} (${user.userId})?`)) {
                        deleteUser({ variables: { id: user.id }})
                          .then(refetch);  
                      }
                    }}
                  >
                    <Icon icon="trash" />
                  </Button>
                  <Button 
                    disabled={saving} 
                    size="xs"
                    onClick={() => {
                      setContent(content)  
                    }}
                  >
                    <Icon icon="edit2" />
                  </Button>
              </ButtonGroup>
              )}
            </Cell>
          </Column>

        </Table>
      )}
      {!error && !loading && (
        <Pagination
          activePage={page}
          displayLength={limit}
          onChangePage={page => setCursor({ ...cursor, page })}
          lengthMenu={[{ label: '10', value: 10 }, { label: '20', value: 20 }, { label: '30', value: 30 } ]}
          onChangeLength={limit => setCursor({ limit, page: 1 })}
          total={data.counters.contents.count}
      />
      )}
    </PageContainer>
  );


};

export default Contents;

