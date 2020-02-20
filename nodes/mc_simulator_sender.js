const _ = require('lodash');

module.exports = function(RED) {

  const { Events, sendMessage } = require('../mc')(RED);
  
  function MissionControlSimulatorSender(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    this.on('input', function(msg, send, done) {
      // send/done compatibility for node-red < 1.0
      send = send || function() { node.send.apply(node, arguments) };
      done = done || function(error) { node.error.call(node, error, msg) };
      // skip messages not from the simulator
      if (!msg.originalMessage.simulator) {
        done();
        return;
      }

      // TODO: implement here continuation
      if (_.isArray(msg.payload)) {
        sendMessage('simulator', {
          payload: msg.payload, 
          userId: msg.originalMessage.userId,
          username: msg.originalMessage.username,
          transport: msg.originalMessage.transport 
        });
      } else {
        sendMessage('simulator', {
          ...msg.payload, 
          userId: msg.originalMessage.userId,
          username: msg.originalMessage.username,
          transport: msg.originalMessage.transport 
        });
      }      
      
      send(msg);
      done();
    });
  }

  RED.nodes.registerType('mc-simulator-sender', MissionControlSimulatorSender);
};
