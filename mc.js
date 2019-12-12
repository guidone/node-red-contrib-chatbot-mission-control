const serveStatic = require('serve-static');
const path = require('path');

let initialized = false;

module.exports = function(RED) {
  if (!initialized) {
    initialized = true;
    bootstrap(RED.server, RED.httpNode || RED.httpAdmin, RED.log, RED.settings);
  }
  // exposed methods
  return {

  };
}

// webpack https://webpack.js.org/guides/getting-started/
// from https://github.com/node-red/node-red-dashboard/blob/63da162998c421b43a6e5ebf447ed90e04040aa3/ui.js#L309
function bootstrap(server, app, log, redSettings) {

  log.info('RedBot Mission Control 0.0.1');

  console.log('----', path.join(__dirname, 'dist/main.js'))

  app.use('/mc', serveStatic(path.join(__dirname, 'src')));
  app.use('/mc/main.js', serveStatic(path.join(__dirname, 'dist/main.js')));

};