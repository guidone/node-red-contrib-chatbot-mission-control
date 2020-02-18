const _ = require('lodash');

module.exports = function(RED) {

  const { Events, sendMessage } = require('../mc')(RED);
  
  function MissionControlSimulatorReceiver(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.topic = config.topic;

    const handler = async (topic, message) => {
      if (topic === 'simulator') {
        // ok sending message
        console.log('simulator in', message)
        
        const serverNode = RED.nodes.getNode(message.nodeId);

        if (serverNode == null || serverNode.chat == null) {
          node.error(`Unable to find a RedBot chat node with id ${message.nodeId}`);
          return;
        }

        const chatServer = serverNode.chat;
        const chatId = 'sim42'; // TODO: fix chat id with something meaningful
        const userId = String(message.userId); // TODO: select right userid
        const username = message.username;
        const language = message.language;
        const firstName = message.firstName;
        const lastName = message.lastName;
        const messageId = _.uniqueId('msg_');;
        const msg = await chatServer.createMessage(chatId, userId, messageId, {})
        msg.payload = {
          ...message.payload,
          chatId,
          messageId,
          userId,
          inbound: true
        };
        
        msg.originalMessage = {
          ...msg.originalMessage,
          simulator: true,
          userId: userId,
          username: username
        }
        await msg.chat().set({ username, userId, language, firstName, lastName });
        // send back the evaluated message so also originated messages are visible in the simulator
        sendMessage('simulator', {
          ...msg.payload, 
          messageId: _.uniqueId('msg_'), 
          transport: msg.originalMessage.transport,
          userId: userId,
          username: username 
        });
        // continue the flow
        node.send(msg);
      }
    }

    Events.on('message', handler);

    this.on('close', done => {
      Events.removeListener('message', handler);
      done();
    });
  }

  RED.nodes.registerType('mc-simulator-receiver', MissionControlSimulatorReceiver);
};
