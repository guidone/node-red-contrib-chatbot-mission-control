import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import classNames from 'classnames';

import { Table } from 'rsuite';

const { Column, HeaderCell, Cell, Pagination } = Table;

import PageContainer from '../../../src/components/page-container';
import Breadcrumbs from '../../../src/components/breadcrumbs';
import Language from '../../../src/components/language';

import '../styles/users.scss';

const USERS = gql`
query ($limit: Int, $offset: Int) {
  counters {
    users {
     count
    }
  }
  users(limit: $limit, offset: $offset) {
    id,
    username,
    userId,
    first_name,
    last_name,
    username,
    language,
    payload
  }
}
`;


const Users = () => {

  const [ limit, setLimit ] = useState(10);
  const [ page, setPage ] = useState(1);  
  const { loading, error, data, refetch } = useQuery(USERS, {
    variables: { limit, offset: (page - 1) * limit }
  });




  return (
    <PageContainer className="page-users">
      <Breadcrumbs pages={['Users']}/>    
      {loading && <div>loading</div>}
      {error && <div>error</div>}
      {!error && !loading && (
        <Table
          height={600}
          data={data.users}
          loading={loading}
          renderEmpty={() => <div style={{ textAlign: 'center', padding: 80}}>No Users</div>}
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
            <HeaderCell>userId</HeaderCell>
            <Cell>{({ userId }) => <span className="cell-type-id">{userId}</span>}</Cell>
          </Column>

          <Column width={150} resizable>
            <HeaderCell>Username</HeaderCell>
            <Cell dataKey="username"/>
          </Column>

          <Column width={200} resizable>
            <HeaderCell>First Name</HeaderCell>
            <Cell dataKey="first_name"/>
          </Column>

          <Column width={200} resizable>
            <HeaderCell>Last Name</HeaderCell>
            <Cell dataKey="last_name"/>
          </Column>

          <Column width={300} resizable>
            <HeaderCell>Email</HeaderCell>
            <Cell dataKey="email"/>
          </Column>

          <Column width={100} resizable>
            <HeaderCell>Language</HeaderCell>
            <Cell>
              {({ language }) => <Language>{language}</Language>}
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
          total={data.counters.users.count}
      />
      )}
    </PageContainer>
  );


};

export default Users;

