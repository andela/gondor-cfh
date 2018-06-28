/**
 * Module dependencies.
 */
import express from 'express';
import fs from 'fs';
import passport from 'passport';
import logger from 'mean-logger';
import io from 'socket.io';

require('dotenv').config();

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Load configurations
// if test env, load example file
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
  config = require('./config/config'),
  auth = require('./config/middlewares/authorization'),
  mongoose = require('mongoose');

// Bootstrap db connection
let db = mongoose.connect(config.db);

// Bootstrap models
let models_path = `${__dirname  }/app/models`;
var walk = function (path) {
  fs.readdirSync(path).forEach((file) => {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js|coffee)/.test(file)) {
                require(newPath);
            }
        } else if (stat.isDirectory()) {
            walk(newPath);
        }
    });
};
walk(models_path);

// bootstrap passport config
require('./config/passport')(passport);

let app = express();

app.use((req, res, next) => {
    next();
});

// express settings
require('./config/express')(app, passport, mongoose);

// Bootstrap routes
require('./config/routes')(app, passport, auth);

// Start the app by listening on <port>
let port = config.port;
let server = app.listen(port);
let ioObj = io.listen(server, { log: false });
// game logic handled here
require('./config/socket/socket')(ioObj);

console.log(`Express app started on port ${  port}`);

// Initializing logger
logger.init(app, passport, mongoose);

// expose app
exports = module.exports = app;
