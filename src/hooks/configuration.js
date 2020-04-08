import gql from 'graphql-tag';

import { useQuery, useMutation } from 'react-apollo';

import useSocket from './socket';

const GET_CONFIGURATION = gql`
query($namespace: String) {
  configurations(namespace: $namespace) {
    id
    namespace
    payload
  }
}
`;

const UPDATE_CONFIGURATION = gql`
mutation($configuration: NewConfiguration!) {
  createConfiguration(configuration: $configuration) {
    id,
    namespace,
    payload
  }
}
`;

const useConfiguration = ({ namespace, onCompleted = () => {} }) => {

  const { loading, error, data } = useQuery(GET_CONFIGURATION, {
    variables: { namespace },
  });
  const { sendMessage } = useSocket();

  let configurationValue;
  if (data != null && data.configurations != null && data.configurations.length !== 0) {
    configurationValue = JSON.parse(data.configurations[0].payload);
  }

  const [
    updateConfiguration,
    { loading: mutationLoading, error: mutationError },
  ] = useMutation(UPDATE_CONFIGURATION, { onCompleted });

  return {
    loading: loading,
    saving: mutationLoading,
    error: error || mutationError,
    data: configurationValue,
    update: configuration => {
      updateConfiguration({
        variables: {
          configuration: {
            namespace,
            payload: JSON.stringify(configuration)
          }
        }
      });
      sendMessage('mc.configuration', { namespace, ...configuration });
    }
  };
};

export default useConfiguration;