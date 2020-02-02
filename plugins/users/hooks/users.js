import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';

import withoutParams from '../../../src/helpers/without-params';

const USERS = gql`
query ($limit: Int, $offset: Int, $order: String) {
  counters {
    users {
     count
    }
  }
  users(limit: $limit, offset: $offset, order: $order) {
    id,
    username,
    userId,
    first_name,
    last_name,
    username,
    language,
    payload,
    createdAt,
    email,
    chatIds {
      transport,
      chatId
    }
  }
}
`;

const DELETE_USER = gql`
mutation($id: Int!) {
  deleteUser(id: $id) {
    id
  }
}`;

const EDIT_USER = gql`
mutation($id: Int!, $user: NewUser!) {
  editUser(id:$id, user: $user) {
    id,
    username,
    userId,
    first_name,
    last_name,
    username,
    language,
    payload,
    createdAt,
    email
  }
}`;

export default ({ limit, page, onCompleted = () => {} }) => {
  
  const { loading, error, data, refetch } = useQuery(USERS, {
    fetchPolicy: 'network-only',
    variables: { limit, offset: (page - 1) * limit, order: 'reverse:createdAt' }
  });

  const [
    deleteUser,
    { loading: mutationLoading, error: mutationError },
  ] = useMutation(DELETE_USER, { onCompleted });
  const [
    editUser,
    { loading: editLoading, error: editError },
  ] = useMutation(EDIT_USER, { onCompleted });

  return { 
    loading: loading, 
    saving: mutationLoading || mutationLoading,
    error: error || mutationError || editError, 
    data,
    deleteUser,    
    editUser: withoutParams(editUser, ['id', 'updatedAt', 'createdAt', '__typename', 'chatIds']),
    refetch
  };
};