

module.exports = function(RED) {

  const { Events } = require('../mc')(RED);
  
  function MissionControlSimulatorReceiver(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.topic = config.topic;

    const handler = async (topic, message) => {
      if (topic === 'simulator') {
        // ok sending message
        console.log('simulator in', message)
        
        // TODO: use platform to select the right chat server

        const serverNode = RED.nodes.getNode("e0289538.2f1698")
        //console.log('nodo master', node)
        //node.send({ topic, payload });
        const chatServer = serverNode.chat;
        const chatId = 'sim42';
        const userId = 'user42';
        const msgId = 'msg42'; // TODO: random
        const msg = await chatServer.createMessage(chatId, userId, msgId, {})
        msg.payload = {
          ...message.payload,
          chatId,
          msgId,
          userId,
          inbound: true
        };
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
