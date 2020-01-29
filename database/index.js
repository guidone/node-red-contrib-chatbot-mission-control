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

  const Content = sequelize.define('content', {
    title: Sequelize.STRING,
    slug: Sequelize.STRING,  
    body: Sequelize.TEXT
  }, {
    indexes: [
      { name: 'content_title', using: 'BTREE', fields: ['title'] },
      { name: 'content_slug', using: 'BTREE', fields: ['slug'] },
      { name: 'content_content', using: 'BTREE', fields: ['body'] }
    ]
  });

  const Category = sequelize.define('category', {
    name: Sequelize.STRING
  }, {
    indexes: [
      { name: 'category_name', using: 'BTREE', fields: ['name'] }
    ]
  });

  const Field = sequelize.define('field', {
    name: Sequelize.STRING,
    type: Sequelize.STRING,
    value: Sequelize.TEXT
  }, {
    indexes: [
      { name: 'field_name', using: 'BTREE', fields: ['name'] }
    ]
  });

  Content.Category = Content.belongsTo(Category);
  Content.Fields = Content.hasMany(Field);

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
 
  const Admin = sequelize.define('admin', {
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    first_name: Sequelize.STRING,
    last_name: Sequelize.STRING,
    avatar: Sequelize.STRING,
    email: Sequelize.STRING
  }, {
    indexes: [
      { name: 'admin_username', using: 'BTREE', fields: ['username'] },
      { name: 'admin_password', using: 'BTREE', fields: ['password'] }
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
    source: Sequelize.STRING, 
    name: Sequelize.STRING,
    count: Sequelize.INTEGER
  }, {
    indexes: [
      { name: 'event_flow', using: 'BTREE', fields: ['flow'] },
      { name: 'event_name', using: 'BTREE', fields: ['name'] },
      { name: 'event_source', using: 'BTREE', fields: ['source'] }
    ]
  });


  if (!fs.existsSync(dbPath)) {
    sequelize.sync({ force: true })
      .then(() => {
        Admin.create({ username: 'guidone', password: 'mysalt$10$d5b9be8303d735591db5e83f2cc547dc' })
        console.log(lcd.white(moment().format('DD MMM HH:mm:ss')
        + ' - [info] Initialized RedBot Mission Control database:')
        + ' ' + lcd.grey(resolve(dbPath)));
      });
  } else {
    console.log(lcd.white(moment().format('DD MMM HH:mm:ss')
      + ' - [info] Mounted RedBot Mission Control database:')
      + ' ' + lcd.grey(resolve(dbPath)));
  }

  const graphQLServer = GraphQLServer({ Configuration, Message, User, ChatId, Event, Content, Category,Field, sequelize });
  
  exportCache = {
    Configuration,
    Message,
    User,
    graphQLServer,
    ChatId,
    Event,
    Admin,
    Content,
    Category,
    Field
  };

  return exportCache;
};