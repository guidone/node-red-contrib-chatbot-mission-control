const _ = require('lodash');

const moment = require('moment');
const gql = require('graphql-tag');

const client = require('../database/client');

const { 
  isValidMessage, 
  getChatId, 
  getTransport, 
  extractValue,
  append,
  when 
} = require('../lib/helpers/utils');


const CREATE_EVENT = gql`
mutation ($event: NewEvent!) {
	createEvent(event: $event) {
    id,
    count,
    sources 
  }
}
`;

module.exports = function(RED) {
  
  function MissionControlEvent(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.flow = config.flow;
    node.name = config.name;
      
    this.on('input', async function(msg, send, done) {
      // send/done compatibility for node-red < 1.0
      send = send || function() { node.send.apply(node, arguments) };
      done = done || function(error) { node.error.call(node, error, msg) };
       
      const flow = extractValue('string', 'flow', node, msg, false);
      const name = extractValue('string', 'name', node, msg, false);

      const chat = msg.chat();
      try {
        let previousEvents = await when(chat.get('previous_events'));
        // default stack message          
        if (_.isEmpty(previousEvents) || !_.isArray(previousEvents)) {
          previousEvents = [];
        }


        // TODO skip on simulator

        const newEvent = await client.mutate({
          mutation: CREATE_EVENT,
          variables: {
            event: {
              flow,
              name,
              sources: previousEvents
            }
          }
        });
        if (newEvent != null) {
          console.log('risetto', newEvent, newEvent.data.createEvent.sources)
          await when(chat.set('previous_events', newEvent.data.createEvent.sources ));
        }
        
        send(msg);
        done();
      } catch(error) {
        // TODO cleanup
        console.log(error)
        console.log('erro saving event', error)
        done(error)
      }
            
    });
  }

  RED.nodes.registerType('mc-event', MissionControlEvent);
};
