const _ = require('lodash');
const { ApolloClient } = require('apollo-boost');
const moment = require('moment');
const gql = require('graphql-tag');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { createHttpLink } = require('apollo-link-http');
const { ApolloLink } = require('apollo-link');
const fetch = require('node-fetch').default;

const { isValidMessage } = require('../lib/utils/index');

const CREATE_MESSAGE = gql`
mutation($message: NewMessage!) {
  createMessage(message: $message) {
    id
  }
}
`;

module.exports = function(RED) {
  
  function MissionControlStore(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    
    const cache = new InMemoryCache();
    const apolloLink = createHttpLink({ uri: 'http://localhost:1880/graphql', fetch: fetch });
    this.client = new ApolloClient({
      cache,
      link: ApolloLink.from([apolloLink])
    });

    this.on('input', function(msg, send, done) {
      // send/done compatibility for node-red < 1.0
      send = send || function() { node.send.apply(node, arguments) };
      done = done || function(error) { node.error.call(node, error, msg) };
      // check if valid redbot message
      if (!isValidMessage(msg, node)) {
        send(msg);
        done();
        return;  
      }
      // check for valid message
      node.client.mutate({
        mutation: CREATE_MESSAGE,
        variables: {
          message: {
            chatId: String(msg.payload.chatId),
            userId: msg.payload.userId != null ? String(msg.payload.userId) : undefined,
            messageId: msg.payload.messageId != null ? String(msg.payload.messageId) : undefined,
            inbound: msg.payload.inbound,
            type: msg.payload.type,
            ts: moment(),
            transport: msg.originalMessage.transport,
            content: _.isString(msg.payload.content) ? msg.payload.content : '<buffer>'
          }
        }
      }).then(data => done())
      .catch(error => done(error.networkError.result));

      send(msg);
    });
  }

  RED.nodes.registerType('mc-store', MissionControlStore);
};
