const _ = require('lodash');
const gql = require('graphql-tag');

const client = require('../database/client');
const MessageTemplate = require('../lib/message-template/index');

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
      const slug = extractValue('string', 'slug', node, msg, false);
      const language = extractValue('string', 'language', node, msg, false);
      const failbackLanguage = extractValue('string', 'failbackLanguage', node, msg, false);
      
      // build query variables
      let variables;
      if (!isNaN(parseInt(slug, 10))) {
        variables = { id: parseInt(slug, 10), limit: 100 };
      } else {
        variables = { slug, limit: 100 };
      }
      // get user's language from context
      const contextLanguage = await when(chat.get('language'));

      try {
        const response = await client.query({ query: CONTENT, variables, fetchPolicy: 'network-only' });        
        const { contents } = response.data;

        let content;
        if (_.isEmpty(language) && !_.isEmpty(contextLanguage)) {
          content = contents.find(content => content.language === contextLanguage);
        } else if (!_.isEmpty(language)) {
          content = contents.find(content => content.language === language);
        }
        if (content == null && !_.isEmpty(failbackLanguage)) {
          content = contents.find(content => content.language === failbackLanguage);
        }
        const payload = await template(content);
        send({ ...msg, payload });
        done();
      } catch(error) {
        done(error);
      }
    });
  }

  RED.nodes.registerType('mc-content', MissionControlContent);
};
