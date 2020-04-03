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

const CREATE_MESSAGE_LIGHT = gql`
mutation($message: NewMessage!) {
  message: createMessage(message: $message) {
    id,
    chatId
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
      const userId = msg.get('userId');
      // get the data present in the chat context
      const {
        firstName,
        lastName,
        username,
        language,
        resolved
      } = await when(chat.get('firstName', 'lastName', 'username', 'language', 'userId', 'resolved'));

      // if the message is outbound and the user has already resolved by a mc_store upstream, then skip
      // the user sincronization is already been made, in order to optimize queries skip.
      // Of course always sync user for inbound messages
      const useSimplifiedQuery = resolved === true && !msg.payload.inbound;

      const variables = {
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
      };

      try {
        const result = await client
          .mutate({
            mutation: useSimplifiedQuery ? CREATE_MESSAGE_LIGHT : CREATE_MESSAGE,
            variables
          });

        const user = result != null && result.data != null && result.data.message != null && result.data.message.user != null
          ? result.data.message.user : null;
        // if user sent back, then syncronize the key data present in chat context
        if (user != null) {
          // the DB is the single source of truth
          const update = { resolved: true };
          if (firstName !== user.first_name) {
            update.firstName = user.first_name;
          }
          if (lastName !== user.last_name) {
            update.lastName = user.last_name;
          }
          if (language !== user.language) {
            update.language = user.language;
          }

          // update chat context only if there are changes
          if (!_.isEmpty(update)) {
            await when(chat.set(update));
          }

          // if a chat context still not exists for this user, then assign
          // the current one (which could be enriched of information) to the
          // user resolved previously
          const { contextProvider } = msg.api().getOptions();
          if (contextProvider.get(null, user.userId) == null) {
            contextProvider.assignToUser(user.userId, msg.chat());
          }
          msg.chat = () => {
            // override the chat context with the one got using userId and not chatId
            const { contextProvider } = msg.api().getOptions();
            return contextProvider.get(null, user.userId)
          };
          msg.originalMessage.userId = user.userId;
          msg.user = user;
        }

        send(msg);
        done();
      } catch(error) {

        console.log(error)
        // TODO: improve error handling here
        console.log('error', error.networkError)
        done(error.networkError.result)
      }
    });
  }

  RED.nodes.registerType('mc-store', MissionControlStore);
};
