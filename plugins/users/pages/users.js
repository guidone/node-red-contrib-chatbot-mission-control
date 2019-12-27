import React, { useState } from 'react';
import { Table, Placeholder, Icon, ButtonGroup, Button } from 'rsuite';

const { Column, HeaderCell, Cell, Pagination } = Table;
const { Grid } = Placeholder;

import PageContainer from '../../../src/components/page-container';
import Breadcrumbs from '../../../src/components/breadcrumbs';
import Language from '../../../src/components/language';
import SmartDate from '../../../src/components/smart-date';

import '../styles/users.scss';
import useUsers from '../hooks/users';

const Users = () => {
  const [ limit, setLimit ] = useState(10);
  const [ page, setPage ] = useState(1);
  const { loading, saving, error, data, deleteUser, refetch } = useUsers({ limit, page });

  return (
    <PageContainer className="page-users">
      <Breadcrumbs pages={['Users']}/>    
      {loading && <Grid columns={9} rows={3} />}
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

          <Column width={140} resizable>
            <HeaderCell>Subscribed</HeaderCell>            
            <Cell>
              {({ createdAt }) => <SmartDate date={createdAt} />}
            </Cell>
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

          <Column width={50} resizable>
            <HeaderCell>Language</HeaderCell>
            <Cell>
              {({ language }) => <Language>{language}</Language>}
            </Cell>
          </Column>

          <Column width={300} flexGrow={1}>
            <HeaderCell>Email</HeaderCell>
            <Cell dataKey="email"/>
          </Column>
          
          <Column width={80}>
            <HeaderCell>Action</HeaderCell>
            <Cell>
              {({ id, first_name, last_name, userId }) => (
                <ButtonGroup>
                  <Button 
                    disabled={saving} 
                    size="xs"
                    onClick={() => {
                      if (confirm(`Delete user "${[first_name, last_name].join(' ')}" (${userId})?`)) {
                        deleteUser({ variables: { id }})
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

