import React, { useState } from 'react';
import gql from 'graphql-tag';
import { Query, useQuery, useMutation } from 'react-apollo';
import classNames from 'classnames';
import moment from 'moment';

import { Table, Icon, SelectPicker, Placeholder } from 'rsuite';

const { Column, HeaderCell, Cell, Pagination } = Table;
const { Grid } = Placeholder

import withMessageTypes from '../../../src/wrappers/with-message-types';
import withPlatforms from '../../../src/wrappers/with-platforms';

import PageContainer from '../../../src/components/page-container';
import MessageType from '../../../src/components/message-type';
import Transport from '../../../src/components/transport';
import Breadcrumbs from '../../../src/components/breadcrumbs';
import SmartDate from '../../../src/components/smart-date';

import '../styles/message-logs.scss';

const MESSAGES = gql`
query ($limit: Int, $offset: Int, $order: String, $inbound: Boolean, $type: String, $transport: String) {
  counters {
    messages {
     count
    }
  }
  messages(limit: $limit, offset: $offset, inbound: $inbound, order: $order, type: $type, transport: $transport) {
    id
    chatId
    content,
    messageId,
    inbound,
    ts,
    type,
    userId,
    from,
    transport,
    createdAt
  }
}
`;

const SelectInbound = [
  { value: true, label: 'Inbound' },
  { value: false, label: 'Outbound' },
]




const MessageLogs = ({ messageTypes, platforms }) => {

  const [ limit, setLimit ] = useState(10);
  const [ page, setPage ] = useState(1);
  const [ messageType, setMessageType ] = useState(undefined);
  const [ transport, setTransport ] = useState(undefined);
  const [ inbound, setInbound ] = useState(undefined);
  const { loading, error, data, refetch } = useQuery(MESSAGES, {
    fetchPolicy: 'network-only',
    variables: { 
      limit, 
      offset: (page - 1) * limit, 
      type: messageType,
      order: 'reverse:createdAt',
      inbound, 
      transport 
    }
  });

  return (
    <PageContainer className="page-message-logs">
      <Breadcrumbs pages={['Messages Log']}/>
      <div className="filters" style={{ marginBottom: '10px' }}>
        <SelectPicker 
          value={transport}
          data={platforms.map(transport => ({ value: transport.id, label: transport.name }))} 
          onChange={transport => {
            setTransport(transport);
            refetch({ transport })
          }} 
          onClean={() => setTransport(undefined)} 
          cleanable
          searchable={false}          
          placeholder="Transport" 
          size="md"
        />
        &nbsp;
        <SelectPicker 
          value={inbound}
          data={SelectInbound} 
          onChange={inbound => {
            setInbound(inbound)
            refetch({ inbound })
          }} 
          onClean={() => setInbound(undefined)} 
          cleanable
          searchable={false}          
          placeholder="Inbound or Inbound" 
          size="md"
        />
        &nbsp;
        <SelectPicker 
          value={messageType}
          data={messageTypes.map(type => ({ value: type.value, label: type.label }))} 
          onChange={type => {
            setMessageType(type)
            refetch({ type })
          }} 
          onClean={() => setMessageType(undefined)} 
          cleanable
          searchable={false}          
          placeholder="Message type" 
          size="md"
        />
      </div>

      {loading && <Grid columns={9} rows={3} />}
      {error && <div>error</div>}
      {!error && !loading && (
        <Table
          height={600}
          data={data.messages}
          loading={loading}
          renderEmpty={() => <div style={{ textAlign: 'center', padding: 80}}>No Messages</div>}
          autoHeight
          onSortColumn={(sortColumn, sortType) => {
            console.log(sortColumn, sortType);
          }}
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

export default withPlatforms(withMessageTypes(MessageLogs));

