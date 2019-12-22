import React, { useState } from 'react';
import gql from 'graphql-tag';
import { Query, useQuery, useMutation } from 'react-apollo';
import classNames from 'classnames';

import { Table, Icon } from 'rsuite';

const { Column, HeaderCell, Cell, Pagination } = Table;



import PageContainer from '../../../src/components/page-container';
import MessageType from '../../../src/components/message-type';
import Transport from '../../../src/components/transport';
import Breadcrumbs from '../../../src/components/breadcrumbs';

import '../styles/message-logs.scss';

const MESSAGES = gql`
query ($limit: Int, $offset: Int, $type: String) {
  counters {
    messages {
     count
    }
  }
  messages(limit: $limit, offset: $offset, type: $type) {
    id
    chatId
    content,
    messageId,
    inbound,
    ts,
    type,
    userId,
    from,
    transport
  }
}
`;



const MessageLogs = () => {

  const [ limit, setLimit ] = useState(10);
  const [ page, setPage ] = useState(1);
  const [ filterType, setFilterType ] = useState(undefined);
  const { loading, error, data } = useQuery(MESSAGES, {
    variables: { limit, offset: (page - 1) * limit, type: filterType }
  });


  console.log('limit, ', limit)
  console.log('error', error)

  return (
    <PageContainer className="page-message-logs">
       <Breadcrumbs pages={['Messages Log']}/>
    
      {loading && <div>loading</div>}
      {error && <div>error</div>}
      {!error && !loading && (
        <Table
          height={600}
          data={data.messages}
          autoHeight
          onSortColumn={(sortColumn, sortType) => {
            console.log(sortColumn, sortType);
          }}
        >
          <Column width={60} align="center">
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column width={40} resizable>
            <HeaderCell>I/O</HeaderCell>            
            <Cell>
              {({ inbound }) => (
                <div className={classNames('cell-inbound', { inbound, outbound: !inbound})}>
                  <Icon icon={inbound ? 'arrow-circle-o-right' : 'arrow-circle-o-left'}/>
                </div>
              )}
            </Cell>
          </Column>  

          <Column width={100} resizable>
            <HeaderCell>chatId</HeaderCell>
            <Cell>{({ chatId }) => <span className="cell-type-id">{chatId}</span>}</Cell>
          </Column>

          <Column width={100} resizable>
            <HeaderCell>Transport</HeaderCell>
            <Cell>
              {({ transport }) => <Transport transport={transport}/>}
            </Cell>
          </Column>

          <Column width={100} resizable>
            <HeaderCell>Type</HeaderCell>
            <Cell dataKey="type">
              {data => <MessageType type={data.type}/>}
            </Cell>
          </Column>

          <Column width={100} resizable>
            <HeaderCell>messageId</HeaderCell>
            <Cell>{({ messageId }) => <span className="cell-type-id">{messageId}</span>}</Cell>
          </Column>

          <Column width={100} resizable>
            <HeaderCell>userId</HeaderCell>
            <Cell>{({ userId }) => <span className="cell-type-id">{userId}</span>}</Cell>
          </Column>

          <Column width={300} flexGrow={1}>
            <HeaderCell>Content</HeaderCell>
            <Cell dataKey="content">
              {({ content }) => {
                return `"${content}"`;
              }}
            </Cell>
          </Column>
        </Table>
      )}
      {!error && !loading && (
        <Pagination
          activePage={page}
          displayLength={limit}
          onChangePage={setPage}
          lengthMenu={[{ label: '10', value: 10 }, { label: '20', value: 20 }, { label: '30', value: 30 } ]}
          onChangeLength={setLimit}
          total={data.counters.messages.count}
      />
      )}
    </PageContainer>
  );


};

export default MessageLogs;

