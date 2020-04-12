const _ = require('lodash');
const moment = require('moment');

const { when } = require('../lib/utils');

module.exports = function(RED) {

  const { Events, sendMessage } = require('../mc')(RED);

  function MissionControlSimulatorSender(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.track = config.track;
    this.passThrough = config.passThrough;


    // relay message
    const handleConversation = function(msg) {
      node.send(msg);
    };
    RED.events.on('node:' + config.id, handleConversation);

    // cleanup on close
    this.on('close', function() {
      RED.events.removeListener('node:' + config.id, handleConversation);
    });

    this.on('input', async function(msg, send, done) {
      // send/done compatibility for node-red < 1.0
      send = send || function() { node.send.apply(node, arguments) };
      done = done || function(error) { node.error.call(node, error, msg) };

      const context = msg.chat();
      // skip messages not from the simulator
      if (!msg.originalMessage.simulator) {
        done();
        return;
      }
      // check if this node has some wirings in the follow up pin, in that case
      // the next message should be redirected here
      if (context != null && node.track && !_.isEmpty(node.wires[0])) {
        console.log('storing track node', node.id)
        await when(context.set({
          currentConversationNode: node.id,
          currentConversationNode_at: moment()
        }));
      }


      if (_.isArray(msg.payload)) {
        sendMessage('simulator', {
          payload: msg.payload,
          inbound: false,
          userId: msg.originalMessage.userId,
          username: msg.originalMessage.username,
          transport: msg.originalMessage.transport
        });
      } else {
        sendMessage('simulator', {
          ...msg.payload,
          inbound: false,
          userId: msg.originalMessage.userId,
          username: msg.originalMessage.username,
          transport: msg.originalMessage.transport
        });
      }

      // forward if pass thru
      if (node.passThrough) {
        send(msg);
      }
      done();
    });
  }

  RED.nodes.registerType('mc-simulator-sender', MissionControlSimulatorSender);
};
