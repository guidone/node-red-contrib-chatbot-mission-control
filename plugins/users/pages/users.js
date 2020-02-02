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
import ModalUser from '../views/modal-user';

const Users = () => {
  const [ { limit, page }, setPage ] = useState({ page: 1, limit: 10 });
  const [ user, setUser ] = useState(null);
  const { loading, saving, error, data, deleteUser, editUser, refetch } = useUsers({ limit, page });

  return (
    <PageContainer className="page-users">
      <Breadcrumbs pages={['Users']}/>    
      {user != null && (
        <ModalUser 
          user={user}
          error={error}
          disabled={saving}
          onCancel={() => setUser(null)}
          onSubmit={async user => {            
            await editUser({ variables: { id: user.id, user }})              
            setUser(null);
            refetch();
          }}
        />)}
      {loading && <Grid columns={9} rows={3} />}
      {error && <div>error</div>}
      {!error && !loading && (
        <Table
          height={600}
          data={data.users}
          loading={loading}
          renderEmpty={() => <div style={{ textAlign: 'center', padding: 80}}>No Users</div>}
          autoHeight
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
              {user => (
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
                    onClick={() => setUser(user)}
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
          onChangePage={page => setPage({ page, limit })}
          lengthMenu={[{ label: '10', value: 10 }, { label: '20', value: 20 }, { label: '30', value: 30 } ]}
          onChangeLength={limit => setPage({ page: 1, limit })}
          total={data.counters.users.count}
      />
      )}
    </PageContainer>
  );


};

export default Users;

