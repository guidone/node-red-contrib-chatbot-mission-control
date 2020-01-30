const _ = require('lodash');
const gql = require('graphql-tag');

const client = require('../database/client');
const lcd = require('../lib/lcd/index');
const MessageTemplate = require('../lib/message-template/index');

module.exports = function(RED) {
  
  function MissionControlQuery(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.query = config.query;
    
    this.on('input', async function(msg, send, done) {
      // send/done compatibility for node-red < 1.0
      send = send || function() { node.send.apply(node, arguments) };
      done = done || function(error) { node.error.call(node, error, msg) };

      const template = MessageTemplate(msg, node);
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

      const translatedQuery = await template(node.query);
      const query = gql`${translatedQuery}`;

      try {
        const response = await client.query({ query, variables, fetchPolicy: 'network-only' });
        send({ ...msg, payload: response.data });
        done();
      } catch(error) {
        // format error
        // TODO: generalize query error
        if (error != null && error.networkError != null && error.networkError.result != null && error.networkError.result.errors != null) {
          let errors = error.networkError.result.errors.map(error => {
            let errorMsg = error.message;
            if (error.locations != null) {
              errorMsg += ` (line: ${error.locations[0].line})`;
            }
            return errorMsg;
          });            
          lcd.dump(errors, `GraphQL Error (id: ${node.id})`);
        } else {
          lcd.dump('Unknown GraphQL error', `GraphQL Error (id: ${node.id})`);
        }
      }

    });
  }

  RED.nodes.registerType('mc-query', MissionControlQuery);
};
