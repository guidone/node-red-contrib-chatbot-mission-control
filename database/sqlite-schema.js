const fs = require('fs');
const Sequelize = require('sequelize');
const { resolve } = require('path');
const moment = require('moment');

const lcd = require('../lib/lcd/index');

const dbPath = __dirname + '/../mission-control.sqlite';

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

  module.exports = { Configuration };