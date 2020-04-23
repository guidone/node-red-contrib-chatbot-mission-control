import React from 'react';
import { useQuery } from 'react-apollo';
import { Button } from 'rsuite';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useHistory,
  useParams
} from 'react-router-dom';

import gql from 'graphql-tag';

import { useCodePlug } from '../../../lib/code-plug';
import PageContainer from '../../../src/components/page-container';
import Breadcrumbs from '../../../src/components/breadcrumbs';

import Header from '../views/header';

const USER_RECORD = gql`
query($id: Int!) {
  record(id: $id) {
    id,
    title,
    type,
    createdAt,
    payload,
    userId,
    user {
      id,
      username,
      first_name,
      last_name,
      language,
      email
    }
  }
}
`;

const UserRecord = () => {
  const { id } = useParams();
  const history = useHistory();
  const { props: userRecordTypes } = useCodePlug('user-record-types');




  const { data, loading, error } = useQuery(USER_RECORD, {
    fetchPolicy: 'network-only',
    variables: { id: parseInt(id, 10) },
    onCompleted: (data) => {
      console.log('data');
    }
  });

  if (loading) {
    return (
      <PageContainer className="page-user-record">
        {loading && <div>loading</div>}
      </PageContainer>
    );
  }

  console.log('userRecordTypes', userRecordTypes)
  const userRecordType = userRecordTypes.find(userRecordType => userRecordType.type === data.record.type);
  const UserRecordForm = userRecordType.form;

  console.log('user-record id', id)

  const breadcrumbs = [
    {
      title: userRecordType.list,
      onClick: () => history.goBack()
    }
  ];


  return (
    <PageContainer className="page-user-record">


      {loading && <div>loading</div>}
      {!loading && (
        <div>
          <Breadcrumbs
        pages={[...breadcrumbs, !loading ? data.record.title : null]} />
          <Header record={data.record} />
          <UserRecordForm
            record={data.record}
          />
        <Button onClick={() => history.goBack()}>back</Button>




        </div>)}
    </PageContainer>

  );
}

export default UserRecord;