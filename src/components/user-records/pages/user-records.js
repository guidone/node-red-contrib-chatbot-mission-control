import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import _ from 'lodash';
import { Table, Icon, SelectPicker, ButtonGroup, Button, FlexboxGrid } from 'rsuite';

const { Column, HeaderCell, Cell } = Table;

import PageContainer from '../../../../src/components/page-container';
import Breadcrumbs from '../../../../src/components/breadcrumbs';
import SmartDate from '../../../../src/components/smart-date';
import Language from '../../../../src/components/language';
import CustomTable from '../../../../src/components/table';
import LanguagePicker from '../../../../src/components/language-picker';
import { Input, UserAutocomplete } from '../../../../src/components/table-filters';





const USER_RECORDS = gql`
query($offset: Int, $limit: Int, $order: String, $type: String, $userId: String) {
  counters {
    rows: records {
     count(type: $type, userId: $userId)
    }
  }
  rows: records(offset: $offset, limit: $limit, order: $order, type: $type, userId: $userId) {
    id,
    createdAt,
    title,
    payload,
    type,
    userId
  }
}
`;

// TODO implement
const useUserRecords = () => {

  return {}
}


const LABELS = {
  createContent: 'Create content',
  emptyContent: 'No Content',
  saveContent: 'Save content'
};

const UserRecords = ({
  type,
  title,
  labels,
  breadcrumbs
 }) => {
  const [filters, setFilters] = useState(null);
  const [content, setContent ] = useState(null);
  const table = useRef();

  const {
    error,
    saving,
    deleteContent,
    editContent,
    createContent
  } = useUserRecords();

  labels = { ...LABELS, ...labels };

  return (
    <PageContainer className="page-contents">
      <Breadcrumbs pages={breadcrumbs != null ? breadcrumbs : [title]}/>
      <CustomTable
        ref={table}
        query={USER_RECORDS}
        variables={{ type }}
        initialSortField="createdAt"
        initialSortDirection="desc"
        toolbar={(
          <Button
            appearance="primary"
            onClick={() => table.current.refetch()}
          >Refetch
          </Button>
        )}
        onFilters={setFilters}
        filtersSchema={[
          {
            name: 'userId',
            label: 'User',
            control: UserAutocomplete,
            width: 350
          }
        ]}
        height={600}
        labels={{
          empty: labels.emptyContent
        }}
        autoHeight
      >
        <Column width={60} align="center">
          <HeaderCell>Id</HeaderCell>
          <Cell dataKey="id" />
        </Column>

        <Column width={140} resizable sortable>
          <HeaderCell>Date</HeaderCell>
          <Cell dataKey="createdAt">
            {({ createdAt }) => <SmartDate date={createdAt} />}
          </Cell>
        </Column>

        <Column width={100} resizable>
          <HeaderCell>userId</HeaderCell>
          <Cell>{({ userId }) => <span className="cell-type-id">{userId}</span>}</Cell>
        </Column>

        <Column width={260} align="left" sortable resizable>
          <HeaderCell>Title</HeaderCell>
          <Cell dataKey="title" />
        </Column>

        <Column width={80}>
          <HeaderCell>Action</HeaderCell>
          <Cell>
            {record => (
              <ButtonGroup>
                <Button
                  disabled={saving}
                  size="xs"
                  onClick={async () => {
                    if (confirm(`Delete "${record.title}"?`)) {
                      await deleteContent({ variables: { id: record.id }})
                      refetch();
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
      </CustomTable>
    </PageContainer>
  );
};
UserRecords.propTypes = {
  type: PropTypes.string,
  title: PropTypes.string,
  labels: PropTypes.shape({

  }),
  breadcrumbs: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string, // the title of the page or the id of the page
    PropTypes.shape({
      title: PropTypes.string,
      url: PropTypes.string
    })
  ]))
};

export default UserRecords;
