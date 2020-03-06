const _ = require('lodash');
const gql = require('graphql-tag');

const client = require('../database/client');
const lcd = require('../lib/lcd/index');

const { 
  getTransport,
  getChatId
} = require('../lib/helpers/utils');

const GET_USER = gql`
query($chatId: String, $transport: String) {
  chatIds(chatId: $chatId, transport: $transport) {
    transport,
    user {
      id,      
      payload,
      userId
    }
  }
}`;


const EDIT_USER = gql`
mutation($id: Int!, $user: NewUser!) {
  editUser(id:$id, user: $user) {
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
}`;

module.exports = function(RED) {
  
  function MissionControlUserPayload(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.query = config.query;
    this.chain = config.chain;
    
    this.on('input', async function(msg, send, done) {
      // send/done compatibility for node-red < 1.0
      send = send || function() { node.send.apply(node, arguments) };
      done = done || function(error) { node.error.call(node, error, msg) };

      const chatId = getChatId(msg);
      const transport = getTransport(msg);

      try {
        const response = await client.query({ 
          query: GET_USER, 
          variables: { chatId: String(chatId), transport }, 
          fetchPolicy: 'network-only' 
        });
        
        if (response.data != null && !_.isEmpty(response.data.chatIds)) {        
          const chatIdObj = response.data.chatIds[0];
          // merge payload
          let payload = chatIdObj.user.payload != null ? chatIdObj.user.payload : {}; 
          payload = _.isObject(msg.payload) ? { ...payload, ...msg.payload } : payload;

          await client.mutate({ 
            mutation: EDIT_USER, 
            variables: { 
              id: chatIdObj.user.id, 
              user: {
                payload 
              }
            }
          });
        }

        send(msg);
        done();
      } catch(error) {
        console.log('errr', error )
        // format error
        // TODO: generalize query error
        if (error != null && error.networkError != null && error.networkError.result != null && error.networkError.result.errors != null) {
          let errors = error.networkError.result.errors.map(error => {
            let errorMsg = error.message;
            if (error.locations != null) {
              errorMsg += ` (line: ${error.locations[0].line})`;
            }
            return errorMsg;
          });            
          lcd.dump(errors, `GraphQL Error (id: ${node.id})`);
        } else {
          lcd.dump('Unknown GraphQL error', `GraphQL Error (id: ${node.id})`);
          console.log(error);
        }
        done(error);
      }
    });
  }

  RED.nodes.registerType('mc-user-payload', MissionControlUserPayload);
};
