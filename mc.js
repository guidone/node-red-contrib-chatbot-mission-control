const serveStatic = require('serve-static');
const path = require('path');
const events = require('events');
const WebSocket = require('ws');
const fs = require('fs');
const moment = require('moment');


const lcd = require('./lib/lcd/index');

let initialized = false;
let io;
let settings = {};
const Events = new events.EventEmitter();




module.exports = function(RED) {
  if (!initialized) {
    initialized = true;
    bootstrap(RED.server, RED.httpNode || RED.httpAdmin, RED.log, RED.settings);
  }
  // exposed methods
  return {
    Events,
    sendMessage: sendMessage
  };
}

function sendMessage(topic, payload) {
  Events.emit('send', topic, payload);
}


function join() {
  var trimRegex = new RegExp('^\\/|\\/$','g');
  var paths = Array.prototype.slice.call(arguments);
  return '/'+paths.map(function(e) {
      if (e) { return e.replace(trimRegex,""); }
  }).filter(function(e) {return e;}).join('/');
}

// webpack https://webpack.js.org/guides/getting-started/
// from https://github.com/node-red/node-red-dashboard/blob/63da162998c421b43a6e5ebf447ed90e04040aa3/ui.js#L309

// web socket docs
// https://github.com/websockets/ws#api-docs

function bootstrap(server, app, log, redSettings) {

  // print version
  const jsonPackage = fs.readFileSync(__dirname + '/package.json');
  try {
    const package = JSON.parse(jsonPackage.toString());
    // eslint-disable-next-line no-console
    console.log(lcd.white(moment().format('DD MMM HH:mm:ss')
      + ' - [info] RedBot Mission Control version:')
      + ' ' + lcd.green(package.version) + lcd.grey(' (node-red-contrib-chatbot-mission-control)'));
  } catch(e) {
    lcd.error('Unable to open node-red-contrib-chatbot-mission-control/package.json');
  }

  const uiSettings = redSettings.ui || {};
  if ((uiSettings.hasOwnProperty('path')) && (typeof uiSettings.path === 'string')) {
    settings.path = uiSettings.path;
  } else { 
    settings.path = 'mc'; 
  }

  //const fullPath = join(redSettings.httpNodeRoot, settings.path);
  //const socketIoPath = join(fullPath, 'socket.io');



  app.get('/mc/api/configuration', (req, res) => {
    // todo get real configuration
    res.send({ test1: 42 });
  });
  app.use('^\/mc', (req, res, next) => res.sendFile(`${__dirname}/src/index.html`));
  app.use('/mc/main.js', serveStatic(path.join(__dirname, 'dist/main.js')));


  // Setup web socket
  const wss = new WebSocket.Server({ port: 1942 });

  wss.on('connection', ws => {
    
    const sendHandler = (topic, payload) => ws.send(JSON.stringify({ topic, payload }));
    ws.on('message', message => {
      // console.log('received: %s', message);
      let parsed;
      try {
        parsed = JSON.parse(message);
      } catch(e) {
        // error
      }
      if (parsed != null) {
        Events.emit('message', parsed.topic, parsed.payload);
      } 
    });
  
    ws.on('close', () => {
      Events.removeListener('send', sendHandler);  
    });
    
    Events.on('send', (topic, payload) => {
      sendHandler(topic, payload);
    });
  });

};