const Sequelize = require('sequelize');

const sequelize = new Sequelize('mission_control', '', '', {
    host: 'localhost',
    dialect: 'sqlite',
    storage: './mission-control.sqlite',
    logging: false
  });
  
  const Configuration = sequelize.define('configuration', {
    namespace: Sequelize.STRING,
    payload: Sequelize.TEXT,
    ts: Sequelize.DATE
  });

  module.exports = { Configuration };