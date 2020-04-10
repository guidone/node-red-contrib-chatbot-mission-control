import { useState } from 'react';
import { useQuery } from 'react-apollo';

const makeOrder = (sortField, sortType) => `${sortType === 'desc' ? 'reverse:' : ''}${sortField}`;

const useTable = ({ query, limit, page, sortField, sortType, filters = {}, namespace }) => {
  const { loading, error, data, refetch } = useQuery(query, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
    variables: {
      limit,
      offset: (page - 1) * limit,
      sortField, sortType,
      order: makeOrder(sortField, sortType),
      ...filters,
      namespace
    },
    onCompleted: () => setBootstrapping(false)
  });
  const [bootstrapping, setBootstrapping] = useState(true);

  return {
    bootstrapping,
    loading: loading,
    error,
    data,
    refetch
  };
};

export default useTable;