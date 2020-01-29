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
       
      // TODO: check for valid message

      const chat = msg.chat();
      when(chat.get('previous_event'))
        .then(previousEvent => {
          return client.mutate({
            mutation: CREATE_EVENT,
            variables: {
              event: {
                flow: node.flow,
                name: node.name,
                source: previousEvent
              }
            }
          });
        })
        .then(() => chat.set('previous_event', node.name))      
        .then(() => {
          send(msg);
          done()
        })
        .catch(error => {
          console.log(error)
          console.log('erro saving event', error.networkError.result)
          done(error.networkError.result)
        });
    
      
    });
  }

  RED.nodes.registerType('mc-event', MissionControlEvent);
};
