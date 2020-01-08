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

      // TODO: implement here continuation

      sendMessage('simulator', msg.payload);
      send(msg);
      done();
    });


  }


  RED.nodes.registerType('mc-simulator-sender', MissionControlSimulatorSender);
};
