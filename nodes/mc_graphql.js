const _ = require('lodash');
const gql = require('graphql-tag');

const Client = require('../database/client');
const lcd = require('../lib/lcd/index');
const MessageTemplate = require('../lib/message-template/index');
const {
  isValidMessage,
  isSimulator,
  extractValue,
  when
} = require('../lib/helpers/utils');

const isEmptyResponse = response => {
  const keys = Object.keys(response.data);
  return keys.length === 1 && _.isEmpty(response.data[keys[0]]);
}

const isMutation = query => query.includes('mutation(');


module.exports = function(RED) {
  const client = Client(RED);

  function MissionControlGraphQL(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.query = config.query;
    this.debug = config.debug;
    this.name = config.name;

    this.on('input', async function(msg, send, done) {
      // send/done compatibility for node-red < 1.0
      send = send || function() { node.send.apply(node, arguments) };
      done = done || function(error) { node.error.call(node, error, msg) };

      const debug = extractValue('boolean', 'debug', node, msg, false);
      const name = extractValue('string', 'name', node, msg, false);
      // get params
      if (_.isEmpty(node.query)) {
        done('GraphQL query is empty');
        return;
      }
      let variables;
      if (_.isObject(msg.variables)) {
        variables = msg.variables;
      } else if (msg.payload != null && _.isObject(msg.payload.variables)) {
        variables = msg.payload.variables;
      }
      // TODO only if valid message
      let translatedQuery = node.query;
      if (isValidMessage(msg, null, { silent: true })) {
        const template = MessageTemplate(msg, node);
        translatedQuery = await template(node.query);
      }
      if (debug) {
        console.log(
          lcd.green('GraphQL')
          + ' (id: ' + lcd.grey(this.id)
          + (!_.isEmpty(name) ? `, name: ${lcd.grey(name)}` : '')
          + ')');
        console.log(lcd.prettify(translatedQuery, { indent: 2 }))
      }

      const mutate = isMutation(translatedQuery);
      const query = gql`${translatedQuery}`;

      try {
        const response = mutate ?
          await client.mutate({ mutation: query, variables }) :
          await client.query({ query, variables, fetchPolicy: 'network-only' });

        if (!isEmptyResponse(response)) {
          send([{
            ...msg,
            //data: response.data,
            payload: response.data,
            previous: msg.payload
          }, null]);
          done();
        } else {
          send([null, msg]);
          done();
        }

      } catch(error) {
        lcd.graphQLError(error, node);
        done(error);
      }
    });
  }

  RED.nodes.registerType('mc-graphql', MissionControlGraphQL);
};
