const _ = require('lodash');

const moment = require('moment');
const gql = require('graphql-tag');


const { isValidMessage, when } = require('../lib/utils/index');

const client = require('../database/client');

const CREATE_EVENT = gql`
mutation ($event: NewEvent!) {
	createEvent(event: $event) {
    id,
    count 
  }
}
`;

module.exports = function(RED) {
  
  function MissionControlEvent(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.flow = config.flow;
    node.name = config.name;
    
    

    this.on('input', function(msg, send, done) {
      // send/done compatibility for node-red < 1.0
      send = send || function() { node.send.apply(node, arguments) };
      done = done || function(error) { node.error.call(node, error, msg) };
       
      // if inbound get userId from chatContext

      client
        .mutate({
          mutation: CREATE_EVENT,
          variables: {
            event: {
              flow: node.flow,
              name: node.name
            }
          }
        })
        .then(data => done())
        .catch(error => {
          console.log(error)
          console.log('errorascio', error.networkError.result)
          done(error.networkError.result)
        });
    
      send(msg);
    });
  }

  RED.nodes.registerType('mc-event', MissionControlEvent);
};
