import React, { useState, useRef } from 'react';
import gql from 'graphql-tag';
import classNames from 'classnames';
import _ from 'lodash';
import { Table, Icon, SelectPicker, Button } from 'rsuite';

const { Column, HeaderCell, Cell } = Table;

import withMessageTypes from '../../../src/wrappers/with-message-types';
import withPlatforms from '../../../src/wrappers/with-platforms';
import PageContainer from '../../../src/components/page-container';
import MessageType from '../../../src/components/message-type';
import Transport from '../../../src/components/transport';
import Breadcrumbs from '../../../src/components/breadcrumbs';
import SmartDate from '../../../src/components/smart-date';
import { Input } from '../../../src/components/table-filters';

import CustomTable from '../../../src/components/table';

import '../styles/message-logs.scss';

const MESSAGES = gql`
query ($limit: Int, $offset: Int, $order: String, $inbound: Boolean, $type: String, $transport: String, $messageId: String, $chatId: String, $userId: String, $flag: String) {
  counters {
    rows: messages {
      count(
        inbound: $inbound,
        type: $type,
        transport: $transport,
        chatId: $chatId,
        messageId: $messageId,
        userId: $userId,
        flag: $flag
      )
    }
  }
  rows: messages(
    limit: $limit,
    offset: $offset,
    inbound: $inbound,
    order: $order,
    type: $type,
    transport: $transport,
    chatId: $chatId,
    messageId: $messageId,
    userId: $userId,
    flag: $flag
  ) {
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
    createdAt,
    flag
  }
}
`;

const SelectInbound = [
  { value: true, label: 'Inbound' },
  { value: false, label: 'Outbound' },
]

const MessageLogs = ({ messageTypes, platforms }) => {
  const table = useRef();

  return (
    <PageContainer className="page-message-logs">
      <Breadcrumbs pages={['Messages Log']}/>
      <CustomTable
        ref={table}
        query={MESSAGES}
        initialSortField="createdAt"
        initialSortDirection="desc"
        toolbar={(
          <Button
            appearance="primary"
            onClick={() => table.current.refetch()}>Reload
          </Button>
        )}
        filtersSchema={[
          {
            searchable: false,
            placeholder: 'Transport',
            name: 'transport',
            cleanable: true,
            block: true,
            data: platforms.map(transport => ({ value: transport.id, label: transport.name })),
            control: SelectPicker
          },
          {
            searchable: false,
            placeholder: 'Inbound or Outbound',
            name: 'inbound',
            cleanable: true,
            block: true,
            data: SelectInbound,
            control: SelectPicker
          },
          {
            searchable: false,
            placeholder: 'Message type',
            name: 'type',
            cleanable: true,
            block: true,
            data: messageTypes.map(type => ({ value: type.value, label: type.label })),
            control: SelectPicker
          },
          {
            name: 'messageId',
            placeholder: 'messageId',
            control: Input
          },
          {
            name: 'chatId',
            placeholder: 'chatId',
            control: Input
          },
          {
            name: 'userId',
            placeholder: 'userId',
            control: Input
          },
          {
            name: 'flag',
            placeholder: 'flag',
            control: Input
          }
        ]}
        height={600}
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

        <Column width={100} resizable>
          <HeaderCell>Flag</HeaderCell>
          <Cell>{({ flag }) => <span>{flag}</span>}</Cell>
        </Column>

        <Column width={300} flexGrow={1}>
          <HeaderCell>Content</HeaderCell>
          <Cell dataKey="content">
            {({ content }) => {
              return `"${content}"`;
            }}
          </Cell>
        </Column>
      </CustomTable>
    </PageContainer>
  );
};

export default withPlatforms(withMessageTypes(MessageLogs));
