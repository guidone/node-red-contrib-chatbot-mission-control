const _ = require('lodash')
const moment = require('moment');
const gql = require('graphql-tag');

const { graphQLError } = require('../lib/lcd/index');
const { isValidMessage, isSimulator, when } = require('../lib/utils/index');
const Client = require('../database/client');

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
  const client = Client(RED);

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
        language
      } = await when(chat.get('firstName', 'lastName', 'username', 'language', 'userId'));
      // if the message is outbound and the user has already resolved by a mc_store upstream, then skip
      // the user sincronization is already been made, in order to optimize queries skip.
      // Of course always sync user for inbound messages
      const useSimplifiedQuery = msg.originalMessage.resolved === true && !msg.payload.inbound;

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
        // if user data sent back, then syncronize the data present in chat context
        if (user != null) {
          // the DB is the single source of truth
          const update = { };
          if (!_.isEmpty(user.firstName) && firstName !== user.first_name) {
            update.firstName = user.first_name;
          }
          if (!_.isEmpty(user.lastName) && lastName !== user.last_name) {
            update.lastName = user.last_name;
          }
          if (!_.isEmpty(user.language) && language !== user.language) {
            update.language = user.language;
          }
          if (!_.isEmpty(user.username) && username !== user.username) {
            update.username = user.username;
          }
          // avoid next mc store tries to resolve again the user
          msg.originalMessage.resolved = true;
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

          msg.chat = function() {
            const { userId, transport, chatId } = this.originalMessage;
            // override the chat context with the one got using userId and not chatId
            const { contextProvider } = msg.api().getOptions();
            return contextProvider.get(null, userId, { userId, transport, chatId });
          };
          msg.originalMessage.userId = user.userId;
          msg.user = user;
        }

        send(msg);
        done();
      } catch(error) {

        //console.log(error)
        // TODO: improve error handling here
        //console.log('error', error.graphQLErrors)
        //console.log('error', error.graphQLErrors[0].locations)
        graphQLError(error, node);

        done(error.graphQLErrors)
      }
    });
  }

  RED.nodes.registerType('mc-store', MissionControlStore);
};
