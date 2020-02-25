const _ = require('lodash');
const request = require('request').defaults({ encoding: null });
const lcd = require('../lib/lcd/index');

const saveConfiguration = (configuration, context, namespace) => {
  Object.keys(configuration)
    .filter(key => key !== 'translations')
    .forEach(key => context.set(`${namespace}_${key}`, configuration[key]));


  // save dictionary if present
  if (configuration != null && configuration.translations != null) {
    console.log('installing translator')
    const currentDictionary = context.get('dictionary') || {};
    //Object.assign(currentDictionary, configuration.translations, { tx: tx.bind(context) });
    context.set('dictionary', { ...currentDictionary, ...configuration.translations }); 
    context.set('tx', tx.bind(context)); 
  }


};

const tx = function(key, language, predefined) {
  //console.log('--', this, key, predefined)
  
  const dictionary = this.get('dictionary') || {};
  
  if (dictionary[key] != null && dictionary[key][language] != null) {
    return dictionary[key][language];
  } else if (dictionary[key] != null && dictionary[key][predefined] != null) {
    return dictionary[key][predefined];
  } 
  return key;
};


const RequestConfiguration = function({ url, poll = 2000, callback = () => {} }) {
  this.timerId = setInterval(() => {
    console.log(lcd.orange('Asking configuration...'));
    
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
  const { Events } = require('../mc')(RED);

  function MissionControlConfiguration(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.namespace = config.namespace;
    // ask configuration until it comes online
    this.requestConfiguration = new RequestConfiguration({
      url: `http://localhost:${RED.settings.uiPort}/mc/api/configuration/${node.namespace}`,
      callback: configuration => {
        console.log(lcd.green('Initial configuration received') + ' (' + lcd.grey(this.namespace) +')')
        saveConfiguration(configuration, this.context().global, node.namespace);
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
        


        saveConfiguration(payload, this.context().global, node.namespace);
        // pass through
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
