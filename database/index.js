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
  });
 
  const User = sequelize.define('user', {
    userId: Sequelize.STRING,
    email: Sequelize.STRING,
    first_name: Sequelize.STRING,
    last_name: Sequelize.STRING,
    username: Sequelize.STRING,
    language: Sequelize.STRING,
    payload: Sequelize.TEXT
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

  const graphQLServer = GraphQLServer({ Configuration, Message, User });
  
  exportCache = {
    Configuration,
    Message,
    User,
    graphQLServer
  }

  return exportCache;
};