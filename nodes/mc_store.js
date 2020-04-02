const _ = require('lodash')
const moment = require('moment');
const gql = require('graphql-tag');

const { isValidMessage, isSimulator, when } = require('../lib/utils/index');
const client = require('../database/client');

const CREATE_MESSAGE = gql`
mutation($message: NewMessage!) {
  message: createMessage(message: $message) {
    id,
    chatId,
    user {
      id,
      username,
      userId,
      first_name,
      last_name,
      username,
      language,
      payload,
      createdAt,
      email
    }
  }
}
`;

module.exports = function(RED) {

  function MissionControlStore(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    this.on('input', async function(msg, send, done) {
      // send/done compatibility for node-red < 1.0
      send = send || function() { node.send.apply(node, arguments) };
      done = done || function(error) { node.error.call(node, error, msg) };
      // check if valid redbot message or simulator, pass thru
      if (!isValidMessage(msg, node) || isSimulator(msg)) {
        send(msg);
        done();
        return;
      }
      const flag = msg.payload != null && msg.payload.params != null && msg.payload.params.messageFlag != null ?
        msg.payload.params.messageFlag : null

      // get chat context
      const chat = msg.chat();
      // get the data present in the chat context
      const { firstName, lastName, username, language, userId } = await when(chat.get('firstName', 'lastName', 'username', 'language', 'userId'))

      // TODO if outbound simplify query no need to lookup (perhaps in the server)

      try {
        const result = await client
          .mutate({
            mutation: CREATE_MESSAGE,
            variables: {
              message: {
                user: {
                  userId: userId != null ? String(userId) : null,
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
                flag,
                content: _.isString(msg.payload.content) ? msg.payload.content : '<buffer>'
              }
            }
          })

        console.log('result of mutation', result)



        const user = result != null && result.data != null && result.data.message != null && result.data.message.user != null
          ? result.data.message.user : null;


        console.log('utente trovato', user)
        // if user sent back, then syncronize the key data present in chat context
        if (user != null) {
          // the DB is the single source of truth
          const update = {};
          if (firstName !== user.first_name) {
            update.firstName = user.first_name;
          }
          if (lastName !== user.last_name) {
            update.lastName = user.last_name;
          }
          if (language !== user.language) {
            update.language = user.language;
          }
          if (userId !== user.userId) {
            update.userId = user.userId;
          }
          console.log('aggiornamento chat context', update)
          // update chat context only if there are changes
          if (!_.isEmpty(update)) {
            await when(chat.set(update));
          }
        }



        send({ ...msg, user });
        done();
      } catch(error) {

        console.log(error)
        // TODO: improve error handling here
        console.log('error', error.networkError.result)
        done(error.networkError.result)
      }

    });
  }

  RED.nodes.registerType('mc-store', MissionControlStore);
};
