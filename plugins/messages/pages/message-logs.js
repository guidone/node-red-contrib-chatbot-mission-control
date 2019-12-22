import React, { useState } from 'react';
import gql from 'graphql-tag';
import { Query, useQuery, useMutation } from 'react-apollo';

import { Table } from 'rsuite';
const { Column, HeaderCell, Cell, Pagination } = Table;

import PageContainer from '../../../src/components/page-container';
import MessageType from '../../../src/components/message-type';

const MESSAGES = gql`
query ($limit: Int, $offset: Int, $type: String) {
  messages(limit: $limit, offset: $offset, type: $type) {
    id
    chatId
    content,
    messageId,
    ts,
    type,
    userId,
    from,
    transport
  }
}
`;



const MessageLogs = () => {

  const { limit, setLimit } = useState(10);
  const { offset, setOffset } = useState(0);
  const { filterType, setFilterType } = useState(null);
  const { loading, error, data } = useQuery(MESSAGES, {
    variables: { limit, offset, type: filterType }
  });


  console.log(data)

  return (
    <PageContainer className="page-message-logs">
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

          <Column width={100} resizable>
            <HeaderCell>chatId</HeaderCell>
            <Cell dataKey="chatId" />
          </Column>

          <Column width={100} resizable>
            <HeaderCell>Transport</HeaderCell>
            <Cell dataKey="transport" />
          </Column>

          <Column width={100} resizable>
            <HeaderCell>Type</HeaderCell>
            <Cell dataKey="type">
              {data => <MessageType type={data.type}/>}
            </Cell>
          </Column>

          <Column width={100} resizable>
            <HeaderCell>messageId</HeaderCell>
            <Cell dataKey="messageId" />
          </Column>

          <Column width={100} resizable>
            <HeaderCell>userId</HeaderCell>
            <Cell dataKey="userId" />
          </Column>

          <Column width={300} flexGrow={1}>
            <HeaderCell>Content</HeaderCell>
            <Cell dataKey="content" />
          </Column>
        </Table>
      )}
    </PageContainer>
  );


};

export default MessageLogs;

