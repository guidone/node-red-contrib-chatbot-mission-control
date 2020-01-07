const fs = require('fs');
const Sequelize = require('sequelize');
const { resolve } = require('path');
const moment = require('moment');
const lcd = require('../lib/lcd/index');

const GraphQLServer = require('./graphql');

let exportCache;

module.exports = mcSettings => {
  if (exportCache != null) {
    return exportCache;;
  }
  const { dbPath } = mcSettings;

  const sequelize = new Sequelize('mission_control', '', '', {
    host: 'localhost',
    dialect: 'sqlite',
    storage: dbPath,
    logging: true
  });
    
  const Configuration = sequelize.define('configuration', {
    namespace: Sequelize.STRING,
    payload: Sequelize.TEXT,
    ts: Sequelize.DATE
  }, {
    indexes: [
      { name: 'configuration_namespace', using: 'BTREE', fields: ['namespace'] }
    ]
  });

  const Message = sequelize.define('message', {
    chatId: Sequelize.STRING,
    userId: Sequelize.STRING,
    from: Sequelize.STRING,
    messageId: Sequelize.STRING,
    transport: Sequelize.STRING,
    type: Sequelize.TEXT,
    content: Sequelize.TEXT,
    inbound: Sequelize.BOOLEAN,
    ts: Sequelize.DATE
  }, {
    indexes: [
      { name: 'message_chatid', using: 'BTREE', fields: ['chatId'] },
      { name: 'message_userid', using: 'BTREE', fields: ['userId'] },
      { name: 'message_from', using: 'BTREE', fields: ['from'] },
      { name: 'message_messageid', using: 'BTREE', fields: ['messageId'] },
      { name: 'message_transport', using: 'BTREE', fields: ['transport'] },
      { name: 'message_type', using: 'BTREE', fields: ['type'] },
      { name: 'message_inbound', using: 'BTREE', fields: ['inbound'] },
      { name: 'message_ts', using: 'BTREE', fields: ['ts'] }
    ]
  });
 
  const User = sequelize.define('user', {
    userId: Sequelize.STRING,
    email: Sequelize.STRING,
    first_name: Sequelize.STRING,
    last_name: Sequelize.STRING,
    username: Sequelize.STRING,
    language: Sequelize.STRING,
    payload: Sequelize.TEXT
  }, {
    indexes: [
      { name: 'user_userid', using: 'BTREE', fields: ['userId'] },
      { name: 'user_email', using: 'BTREE', fields: ['email'] },
      { name: 'user_username', using: 'BTREE', fields: ['username'] },
      { name: 'user_language', using: 'BTREE', fields: ['language'] }
    ],
    /*getterMethods: {
      payload: function() {
        let result;
        try {
          console.log('parso', this.getDataValue('payload'))
          result = JSON.parse(this.getDataValue('payload'));
        } catch(e) {
          // do nothing
          console.log(e)
        }
        return result;
      }
    }*/
  });

  const ChatId = sequelize.define('chatid', {
    userId: Sequelize.STRING,
    chatId: Sequelize.STRING,
    transport: Sequelize.STRING
  }, {
    indexes: [
      { name: 'chatid_userid', using: 'BTREE', fields: ['userId'] },
      { name: 'chatid_chatid', using: 'BTREE', fields: ['chatId'] },
      { name: 'chatid_transport', using: 'BTREE', fields: ['transport'] }
    ]
  });

  const Event = sequelize.define('event', {
    flow: Sequelize.STRING,
    name: Sequelize.STRING,
    count: Sequelize.INTEGER
  }, {
    indexes: [
      { name: 'event_flow', using: 'BTREE', fields: ['flow'] },
      { name: 'event_name', using: 'BTREE', fields: ['name'] }
    ]
  });


  if (!fs.existsSync(dbPath)) {
    sequelize.sync({ force: true });
    console.log(lcd.white(moment().format('DD MMM HH:mm:ss')
    + ' - [info] Initialized RedBot Mission Control database:')
    + ' ' + lcd.grey(resolve(dbPath)));
  } else {
    console.log(lcd.white(moment().format('DD MMM HH:mm:ss')
      + ' - [info] Mounted RedBot Mission Control database:')
      + ' ' + lcd.grey(resolve(dbPath)));
  }

  const graphQLServer = GraphQLServer({ Configuration, Message, User, ChatId, Event, sequelize });
  
  exportCache = {
    Configuration,
    Message,
    User,
    graphQLServer,
    ChatId,
    Event
  }

  return exportCache;
};