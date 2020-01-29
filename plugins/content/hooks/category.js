import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';

import withoutParams from '../../../src/helpers/without-params';

const CATEGORIES = gql`
query($offset: Int, $limit: Int, $order: String) {  
  counters {
    categories {
      count
    }
  }
  categories(offset: $offset, limit: $limit, order: $order) {
    id,
    name
  }
}
`;

const DELETE_CATEGORY = gql`
mutation($id: Int!) {
  deleteCategory(id: $id) {
    id
  }
}`;

const EDIT_CATEGORY = gql`
mutation($id: Int!, $category: NewCategory!) {
  editCategory(id: $id, category: $category) {
    id,
    name
  }
}
`;

const CREATE_CATEGORY = gql`
mutation($category: NewCategory!) {
  createCategory(category: $category) {
    id,
    name
  }
}
`;


const makeOrder = (sortField, sortType) => `${sortType === 'desc' ? 'reverse:' : ''}${sortField}`;

export default ({ limit, page, sortField, sortType, onCompleted = () => {}, slug }) => {
  const { loading, error, data, refetch } = useQuery(CATEGORIES, {
    fetchPolicy: 'network-only',
    variables: { 
      limit, 
      offset: (page - 1) * limit,
      sortField, sortType, 
      order: makeOrder(sortField, sortType)
    }
  });

  const [
    deleteCategory,
    { loading: deleteLoading, error: deleteError },
  ] = useMutation(DELETE_CATEGORY, { onCompleted });
  const [
    createCategory,
    { loading: createLoading, error: createError },
  ] = useMutation(CREATE_CATEGORY, { onCompleted });
  const [
    editCategory,
    { loading: editLoading, error: editError },
  ] = useMutation(EDIT_CATEGORY, { onCompleted });

  return { 
    loading: loading, 
    saving: deleteLoading || createLoading || editLoading,
    error: error || deleteError || editError || createError, 
    data,
    deleteCategory,
    createCategory: withoutParams(createCategory, ['id', 'updatedAt', 'createdAt', '__typename', 'cid', 'category']),
    editCategory: withoutParams(editCategory, ['id', 'updatedAt', 'createdAt', '__typename', 'cid', 'category']),
    refetch
  };
};