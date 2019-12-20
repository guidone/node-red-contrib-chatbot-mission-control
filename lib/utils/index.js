const lcd = require('../lcd/index');

module.exports = {
  
  isValidMessage: function(msg, node) {
    if (msg.originalMessage == null || msg.originalMessage.transport == null) {
      lcd.title('Warning: Invalid input message' + (node != null ? ' (id:' + node.id + ')' : ''));
      // eslint-disable-next-line no-console
      console.log(lcd.warn('An invalid message was sent to a RedBot node'));
      // eslint-disable-next-line no-console
      console.log(lcd.grey('RedBot nodes are able to handle messages that are originated from a RedBot node, specifically a'
        + ' receiver node (Telegram Receive, Facebook Receiver, etc.) or a Conversation node.'));
      // eslint-disable-next-line no-console
      console.log(lcd.grey('If you are receiving this it\'s likely because the flow is trying to start a conversation with'
        + ' the chatbot user without adding a "Conversation node" at the beginning of the flow. Please read here:'));
      // eslint-disable-next-line no-console
      console.log('');
      // eslint-disable-next-line no-console
      console.log(lcd.green('https://github.com/guidone/node-red-contrib-chatbot/wiki/Conversation-node'));
      // eslint-disable-next-line no-console
      console.log('');
      return false;
    }
    return true;
  }


};