const serveStatic = require('serve-static');
const path = require('path');
const events = require('events');
const WebSocket = require('ws');
const fs = require('fs');
const moment = require('moment');
const passport = require('passport');
const { BasicStrategy } = require('passport-http');  
const _ = require('lodash');

const lcd = require('./lib/lcd/index');
const { hash } = require('./lib/utils/index');
const DatabaseSchema = require('./database/index');
const Settings = require('./src/settings');

let initialized = false;
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
  if (mcSettings.root == null) {
    mcSettings.root = '/mc';
  } else {
    mcSettings.root = mcSettings.root.replace(/\/$/, '');
  }
  console.log(lcd.timestamp() + '  ' + lcd.green('root: ') + lcd.grey(mcSettings.root));
  mcSettings.port = redSettings.uiPort;
  console.log(lcd.timestamp() + '  ' + lcd.green('port: ') + lcd.grey(mcSettings.port));
  if (mcSettings.salt == null) {
    mcSettings.salt = 'mysalt';
    console.log(lcd.timestamp() + '  ' + lcd.green('salt: ') + lcd.grey('default'));
  } else {
    console.log(lcd.timestamp() + '  ' + lcd.green('salt: ') + lcd.grey('****'));
  }

  // todo put db schema here
  const databaseSchema = DatabaseSchema(mcSettings)
  const { Configuration, graphQLServer, Admin } = databaseSchema;

  //passport authentication
  passport.use(new BasicStrategy(async function (username, password, done) {
    try {
      user = await Admin.findOne({ where: { username } });
      if (user == null) {
        done(null, false);
      } else {
        const hashedPassword = hash(password, { salt: mcSettings.salt });
        //console.log('Hashed password: ', hashedPassword);
        //console.log('DB password', user.password);
        if (user.password === hashedPassword) {
          done(null, { 
            id: user.id,
            username: user.username, 
            firstName: user.first_name, 
            lastName: user.last_name, 
            avatar: user.avatar 
          });
        } else {
          done(null, false);
        }
      }
    } catch (e) {
      done(e);
    }
  }));
  app.use(passport.initialize());

  // install graphql server
  app.use(graphQLServer.getMiddleware())
  // eslint-disable-next-line no-console
  console.log(lcd.white(moment().format('DD MMM HH:mm:ss')
  + ' - [info] GraphQL ready at :')
  + ' ' + lcd.green(`http://localhost:${mcSettings.port}${graphQLServer.graphqlPath}`));

  // serve a configuration given the namespace
  app.get(`${mcSettings.root}/api/configuration/:namespace`, (req, res) => {
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
  app.use(
    '^' + mcSettings.root, 
    passport.authenticate('basic', { session: false }),
    (req, res, next) => {
      // inject user info into template
      fs.readFile(`${__dirname}/src/index.html`, (err, data) => {
        const template = data.toString();
        const bootstrap = { user: req.user, settings: mcSettings };
        const json = `<script>var bootstrap = ${JSON.stringify(bootstrap)};</script>`;        
        res.send(template.replace('{{data}}', json));
     });
    }
  );
  // assets
  app.use(`${mcSettings.root}/main.js`, serveStatic(path.join(__dirname, 'dist/main.js')));

  // Setup web socket
  const wss = new WebSocket.Server({ port: Settings.wsPort });
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