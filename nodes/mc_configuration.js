const _ = require('lodash');
const request = require('request').defaults({ encoding: null });
const lcd = require('../lib/lcd/index');

const saveConfiguration = (configuration, context) => {
  Object.keys(configuration)
    .forEach(key => {
      console.log('setting', key, configuration[key])
      context.set(key, configuration[key])        
    });
};

const RequestConfiguration = function({ url, poll = 2000, callback = () => {} }) {

  this.timerId = setInterval(() => {
    console.log(lcd.orange('Asking configuration...'));
    // todo put dinamic
    request({ url }, (error, response, body) => {
      if (!error) {
        let json;
        try {
          json = JSON.parse(body.toString())
        } catch(e) {
          // do nothing
        }
        if (json != null) {
          callback(json);
          clearInterval(this.timerId);
        }
      }
    });
  }, poll);
  


  return {
    done: () => clearInterval(this.timerId)
  };
};



module.exports = function(RED) {
  
  const { Events, sendMessage } = require('../mc')(RED);

  function MissionControlConfiguration(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.namespace = config.namespace;

    // todo: ask on startup
    this.requestConfiguration = new RequestConfiguration({
      url: `http://localhost:${RED.settings.uiPort}/mc/api/configuration`,
      callback: configuration => {
        console.log(lcd.green('Initial configuration received') + ' (' + lcd.grey(this.namespace) +')')
        saveConfiguration(configuration, this.context().global);
        node.send({ payload: configuration });
      },
      context: this.context().global
    });

    const handler = (topic, payload) => {      
      if (topic === 'mc.configuration') {
        // clear interval
        if (this.timerId != null) {
          clearInterval(this.timerId);
        }
        saveConfiguration(payload, this.context().global);
        node.send({ payload });
      }
    };
    Events.on('message', handler);

    this.on('close', done => {
      Events.removeListener('message', handler);
      done();
    });
  }

  RED.nodes.registerType('mc-configuration', MissionControlConfiguration);
};
