const _ = require('lodash');
const gql = require('graphql-tag');

const client = require('../database/client');
const MessageTemplate = require('../lib/message-template/index');
const LIMIT = 100;

const { 
  isValidMessage, 
  getChatId, 
  getTransport, 
  extractValue,
  append,
  when 
} = require('../lib/helpers/utils');


const CONTENT = gql`
query($id: Int,$slug: String) {
  contents(id: $id, slug: $slug) {
    id,
    title,
    slug,
    language,
    body,
    categoryId,
    category {
      id,
      name
    }
  }
}`;

module.exports = function(RED) {
  
  function MissionControlContent(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.slug = config.slug;
    this.language = config.language;
    this.failbackLanguage = config.failbackLanguage;
    
    this.on('input', async function(msg, send, done) {
      // send/done compatibility for node-red < 1.0
      send = send || function() { node.send.apply(node, arguments) };
      done = done || function(error) { node.error.call(node, error, msg) };
      // check if valid message
      if (!isValidMessage(msg, node)) {
        return;
      }
      const chat = msg.chat();
      const template = MessageTemplate(msg, node);
      const slug = extractValue('string', 'slug', node, msg, false, true);
      const id = extractValue('number', 'id', node, msg, false, true);
      const language = extractValue('string', 'language', node, msg, false);
      const failbackLanguage = extractValue('string', 'failbackLanguage', node, msg, false);
      
      // build query variables
      let variables;
      let usingId = false;
      if (!isNaN(parseInt(slug, 10))) {
        variables = { id: parseInt(slug, 10), limit: LIMIT };
        usingId = true;
      } else if (_.isNumber(id)) {
        variables = { id, limit: LIMIT };
        usingId = true;
      } else if (!_.isEmpty(slug)) {
        variables = { slug, limit: LIMIT };
      } else {
        done('Invalid or empty slug/id, unable to retrieve content');
        return;
      }

      // get user's language from context
      const contextLanguage = await when(chat.get('language'));

      try {
        const response = await client.query({ query: CONTENT, variables, fetchPolicy: 'network-only' });                
        const { contents } = response.data;

        let content;
        if (usingId) {
          // if using id, then just get the first
          content = !_.isEmpty(contents) ? contents[0] : null;
        } else {
          // if not using id but the slug, then apply language logic, try to find the right one
          // matching the chat context language or the one defined in the configuration or the 
          // failback language
          if (_.isEmpty(language) && !_.isEmpty(contextLanguage)) {
            c.find(content => content.language === contextLanguage);
          } else if (!_.isEmpty(language)) {
            content = contents.find(content => content.language === language);
          }
          if (content == null && !_.isEmpty(failbackLanguage)) {
            content = contents.find(content => content.language === failbackLanguage);
          }
        }
        // error if still empty
        if (content == null) {
          send(msg);
          done(`Content not found for id: ${id} or slug: €{slug}`);
          return;
        }
        const payload = await template(content);        
        // store the result in the payload and save the previous content in "previous" key
        // to be used with the "Pop Message" node if needed, store also the result in data
        // in case the "Pop Message" node is used
        send({ 
          ...msg, 
          data: payload,
          payload,
          previous: msg.payload 
        });
        
        done();
      } catch(error) {
        done(error);
      }
    });
  }

  RED.nodes.registerType('mc-content', MissionControlContent);
};
