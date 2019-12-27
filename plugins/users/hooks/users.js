import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';

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
    createdAt
  }
}
`;

const DELETE_USER = gql`
mutation($id: Int!) {
  deleteUser(id: $id) {
    id
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

  return { 
    loading: loading, 
    saving: mutationLoading,
    error: error || mutationError, 
    data,
    deleteUser,
    refetch
  };
};