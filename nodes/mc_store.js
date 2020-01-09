const _ = require('lodash')
const moment = require('moment');
const gql = require('graphql-tag');

const { isValidMessage, isSimulator, when } = require('../lib/utils/index');
const client = require('../database/client');

const CREATE_MESSAGE = gql`
mutation($message: NewMessage!) {
  createMessage(message: $message) {
    id
  }
}
`;

module.exports = function(RED) {
  
  function MissionControlStore(config) {
    RED.nodes.createNode(this, config);
    const node = this;
  
    this.on('input', function(msg, send, done) {
      // send/done compatibility for node-red < 1.0
      send = send || function() { node.send.apply(node, arguments) };
      done = done || function(error) { node.error.call(node, error, msg) };
      // check if valid redbot message or simulator, pass thru
      if (!isValidMessage(msg, node) || isSimulator(msg)) {
        send(msg);
        done();
        return;  
      }
      // get chat context
      const chat = msg.chat();
      when(chat.get('firstName', 'lastName', 'username', 'language', 'userId'))
        .then(({ firstName, lastName, username, language, userId }) => {
          client
            .mutate({
              mutation: CREATE_MESSAGE,
              variables: {
                message: {
                  user: {
                    userId: String(userId),
                    first_name: firstName, 
                    last_name: lastName, 
                    username, 
                    language
                  },
                  chatId: String(msg.payload.chatId),
                  messageId: msg.payload.messageId != null ? String(msg.payload.messageId) : undefined,
                  inbound: msg.payload.inbound,
                  type: msg.payload.type,
                  ts: moment(),
                  transport: msg.originalMessage.transport,
                  content: _.isString(msg.payload.content) ? msg.payload.content : '<buffer>'
                }
              }
            })
            .then(data => {
              send(msg);
              done();
            })
            .catch(error => {
              console.log(error)
              // TODO: improve error handling here
              console.log('error', error.networkError.result)
              done(error.networkError.result)
            });
        });
      });
  }

  RED.nodes.registerType('mc-store', MissionControlStore);
};
