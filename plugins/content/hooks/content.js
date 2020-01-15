import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';

const CONTENTS = gql`
query($offset: Int, $limit: Int) {
  counters {
    contents {
     count
    }
  }
  contents(offset: $offset, limit: $limit) {
    id,
    slug,
    title,
    body 
  }
}
`;

const DELETE_CONTENT = gql`
mutation($id: Int!) {
  deleteUser(id: $id) {
    id
  }
}`;

const EDIT_CONTENT = gql`
mutation($id: Int!, $content: NewContent!) {
  editContent(id: $id, content: $content) {
    id,
    slug,
    title,
    body
  }
}
`;

const CREATE_CONTENT = gql`
mutation($content: newContentType) {
  createContent(content: $content) {
    id,
    slug,
    title,
    body
  }
}
`;

export default ({ limit, page, onCompleted = () => {} }) => {
  
  const { loading, error, data, refetch } = useQuery(CONTENTS, {
    fetchPolicy: 'network-only',
    variables: { limit, offset: (page - 1) * limit, order: 'reverse:createdAt' }
  });

  const [
    deleteContent,
    { loading: deleteLoading, error: deleteError },
  ] = useMutation(DELETE_CONTENT, { onCompleted });
  const [
    createContent,
    { loading: createLoading, error: createError },
  ] = useMutation(CREATE_CONTENT, { onCompleted });
  const [
    editContent,
    { loading: editLoading, error: editError },
  ] = useMutation(EDIT_CONTENT, { onCompleted });

  return { 
    loading: loading, 
    saving: deleteLoading || createLoading || editLoading,
    error: error || deleteError || editError || createError, 
    data,
    deleteContent,
    createContent,
    editContent,
    refetch
  };
};