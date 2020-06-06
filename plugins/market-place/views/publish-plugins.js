import React, { useState } from 'react';
import { Button, Notification } from 'rsuite';
import { useApolloClient } from 'react-apollo';
import gql from 'graphql-tag';
import useFetch from 'use-http';
import _ from 'lodash';

import useConfiguration from '../../../src/hooks/configuration';

const CONTENT_PLUGINS = gql`
query {
  contents(namespace: "plugins") {
    id,
    title,
    body,
    fields {
      name,
      value
    }
  }
}
`;

// API for jsonbin.io: https://jsonbin.io/api-reference/bins/read

const PublishPlugins = () => {
  const client = useApolloClient();
  const { data } = useConfiguration({ namespace: 'market-place' });
  const [state, setState] = useState(null);
  const { put } = useFetch('https://api.jsonbin.io', {
    headers: {
      'Content-Type': 'application/json',
      'secret-key': data != null ? data.jsonbin_key : null,
      'versioning': 'false'
    }
  });
  const hasSecretKey = data != null && !_.isEmpty(data.jsonbin_key);

  return (
    <Button
      disabled={state != null || !hasSecretKey}
      appearance="primary"
      onClick={async () => {
        setState('Loading...');
        const response = await client.query({ query: CONTENT_PLUGINS, fetchPolicy: 'network-only' });
        const plugins = response.data.contents.map(plugin => {
          const fields = plugin.fields.reduce((acc, item) => ({ ...acc, [item.name]: item.value }), {});
          return {
            id: fields.id,
            name: plugin.title,
            description: plugin.body,
            url: fields.url,
            flow: fields.flow,
            version: fields.version,
            github: fields.github,
            author: {
              name: fields.author,
              url: fields.author_url
            }
          };
        })
        setState('Publishing...');
        await put(`/b/${data.jsonbin_id}`, plugins);
        setState(null);
        Notification.success({ title: 'Published', description: 'Plugin list published succesfully '});
      }}
    >
      {state != null ? state : 'Publish plugins'}
    </Button>
  );
};

export default PublishPlugins;