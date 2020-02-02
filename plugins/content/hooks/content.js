import { useState } from 'react'; 
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';

import withoutParams from '../../../src/helpers/without-params';

const CONTENTS = gql`
query($offset: Int, $limit: Int, $order: String, $categoryId: Int, $slug: String) {
  counters {
    contents {
     count(categoryId: $categoryId, slug: $slug)
    }
  }
  categories {
    id,
    name
  }
  contents(offset: $offset, limit: $limit, order: $order, categoryId: $categoryId, slug: $slug) {
    id,
    slug,
    title,
    body,
    categoryId,
    createdAt,
    category {
      id,
      name
    }
    fields {
      id,
      name,
      value,
      type
    } 
  }
}
`;

const DELETE_CONTENT = gql`
mutation($id: Int!) {
  deleteContent(id: $id) {
    id
  }
}`;

const EDIT_CONTENT = gql`
mutation($id: Int!, $content: NewContent!) {
  editContent(id: $id, content: $content) {
    id,
    slug,
    title,
    body,
    fields {
      id,
      name,
      value,
      type
    }
  }
}
`;

const CREATE_CONTENT = gql`
mutation($content: NewContent!) {
  createContent(content: $content) {
    id,
    slug,
    title,
    body,
    fields {
      id,
      name,
      value,
      type
    }
  }
}
`;


const makeOrder = (sortField, sortType) => `${sortType === 'desc' ? 'reverse:' : ''}${sortField}`;

export default ({ limit, page, sortField, sortType, categoryId, onCompleted = () => {}, slug }) => {
  const { loading, error, data, refetch } = useQuery(CONTENTS, {
    fetchPolicy: 'network-only',
    variables: { 
      limit, 
      offset: (page - 1) * limit,
      sortField, sortType, 
      order: makeOrder(sortField, sortType), 
      categoryId,
      slug
    },
    onCompleted: () => setBootstrapping(false)
  });
  const [bootstrapping, setBootstrapping] = useState(true);
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
    bootstrapping,
    loading: loading, 
    saving: deleteLoading || createLoading || editLoading,
    error: error || deleteError || editError || createError, 
    data,
    deleteContent,
    createContent: withoutParams(createContent, ['id', 'updatedAt', 'createdAt', '__typename', 'cid', 'category']),
    editContent: withoutParams(editContent, ['id', 'updatedAt', 'createdAt', '__typename', 'cid', 'category']),
    refetch
  };
};