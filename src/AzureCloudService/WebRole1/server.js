#!/usr/bin/env node

/**
 * Initialize
 */

var log = require("./common/logger/index");
log.configure("./settings/log.json");

var logger = log.getRunServiceLogger();

var layoutRender = require("./common/layoutRender");
layoutRender.configure("./views", false);

/**
 * Module dependencies.
 */

logger.info("load app");
var app = require('./app');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */
logger.info("process.env.NODE_ENV = " + process.env.NODE_ENV);
logger.info("process.env.PORT = " + process.env.PORT);
var port = normalizePort(process.env.PORT || '44300');

logger.info("set app port: " + port);
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  logger.error("Server emit error: ", error);
  
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  logger.info('Listening on ' + bind);
}
