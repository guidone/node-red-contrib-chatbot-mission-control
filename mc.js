const serveStatic = require('serve-static');
const path = require('path');
const events = require('events');
const WebSocket = require('ws');
const fs = require('fs');
const moment = require('moment');

const lcd = require('./lib/lcd/index');

const DatabaseSchema = require('./database/index');

let initialized = false;
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


// webpack https://webpack.js.org/guides/getting-started/
// from https://github.com/node-red/node-red-dashboard/blob/63da162998c421b43a6e5ebf447ed90e04040aa3/ui.js#L309

// web socket docs
// https://github.com/websockets/ws#api-docs

// design 
// https://adminlte.io/themes/v3/index2.html

// Inspiration design
// https://colorlib.com/wp/free-dashboard-templates/
// clone schema https://demo.uifort.com/bamburgh-admin-dashboard-pro/
// React grid
// https://github.com/STRML/react-grid-layout#installation
// useQuery
// https://www.apollographql.com/docs/react/data/queries/


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




  // get mission control configurations
  console.log(lcd.timestamp() + 'Red Bot Mission Control configuration:')
  const mcSettings = redSettings.missionControl || {};
  if (mcSettings.dbPath == null) {
    mcSettings.dbPath = __dirname + '/mission-control.sqlite';
  } else {
    mcSettings.dbPath = mcSettings.dbPath.replace(/\/$/, '') + '/mission-control.sqlite';
  }
  console.log(lcd.timestamp() + '  ' + lcd.green('dbPath: ') + lcd.grey(mcSettings.dbPath));

  // todo put db schema here
  const databaseSchema = DatabaseSchema(mcSettings)
  const { Configuration, graphQLServer } = databaseSchema;


  const uiSettings = redSettings.ui || {};
  if ((uiSettings.hasOwnProperty('path')) && (typeof uiSettings.path === 'string')) {
    settings.path = uiSettings.path;
  } else { 
    settings.path = 'mc'; 
  }

  //const fullPath = join(redSettings.httpNodeRoot, settings.path);
  //const socketIoPath = join(fullPath, 'socket.io');

  // install graphql server
  app.use(graphQLServer.getMiddleware())
  // eslint-disable-next-line no-console
  console.log(lcd.white(moment().format('DD MMM HH:mm:ss')
  + ' - [info] GraphQL ready at :')
  + ' ' + lcd.green(`http://localhost:1880${graphQLServer.graphqlPath}`));

  // serve a configuration given the namespace
  app.get('/mc/api/configuration/:namespace', (req, res) => {
    Configuration.findOne({ where: { namespace: req.params.namespace }})
      .then(found => {
        if (found == null) {
          res.send({});
          return;
        }
        let json;
        try {
          json = JSON.parse(found.payload);
        } catch(e) {
          //
        }
        if (json != null) {
          res.send(json);
        } else {
          res.status(400).send('Invalid JSON');
        }
      });
  });
  // serve mission control page and assets
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