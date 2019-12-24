
const { ApolloClient } = require('apollo-boost');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { createHttpLink } = require('apollo-link-http');
const { ApolloLink } = require('apollo-link');
const fetch = require('node-fetch').default;

const cache = new InMemoryCache();
const apolloLink = createHttpLink({ uri: 'http://localhost:1880/graphql', fetch: fetch });

module.exports = new ApolloClient({
  cache,
  link: ApolloLink.from([apolloLink])
});