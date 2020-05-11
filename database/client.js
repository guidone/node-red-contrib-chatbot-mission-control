
const { ApolloClient } = require('apollo-boost');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { createHttpLink } = require('apollo-link-http');
const { ApolloLink, split } = require('apollo-link');
const { getMainDefinition } = require('apollo-utilities');
const ws = require('ws');
const fetch = require('node-fetch').default;

const cache = new InMemoryCache();
const apolloLink = createHttpLink({ uri: 'http://localhost:1880/graphql', fetch: fetch });

const { WebSocketLink } = require('apollo-link-ws');

const wsLink = new WebSocketLink({
  uri: `ws://localhost:1943/`,
  options: {
    reconnect: true
  },
  webSocketImpl: ws
});

const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  apolloLink,
);

module.exports = new ApolloClient({
  cache,
  link: ApolloLink.from([link])
});