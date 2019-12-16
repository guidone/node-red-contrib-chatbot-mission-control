const serveStatic = require('serve-static');
const path = require('path');
const events = require('events');
const WebSocket = require('ws');







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

  log.info('RedBot Mission Control 0.0.1');
  console.log('redSettings', redSettings.getUserSettings())

  const uiSettings = redSettings.ui || {};
  if ((uiSettings.hasOwnProperty('path')) && (typeof uiSettings.path === 'string')) {
    settings.path = uiSettings.path;
  } else { 
    settings.path = 'mc'; 
  }

  const fullPath = join(redSettings.httpNodeRoot, settings.path);
  const socketIoPath = join(fullPath, 'socket.io');

  console.log('socket', socketIoPath)
  //io = socketio(server, { path: '/mc-socket-io' });

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
      console.log('chiudo e rimiuovo send handler')
      Events.removeListener('send', sendHandler);  
    });
    
    Events.on('send', (topic, payload) => {
      sendHandler(topic, payload);
    });
  });

};