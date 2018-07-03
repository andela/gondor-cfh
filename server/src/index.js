import passport from 'passport';
import express from 'express';
import fs from 'fs';
import logger from 'mean-logger';
import io from 'socket.io';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import expressSetup from './setup/expressSetup';
import passportSetup from './setup/passportSetup';
import config from './config';
import routes from './routes/index';
import auth from './middlewares/authorization';

dotenv.config();

// Bootstrap db connection
if (process.env.NODE_ENV === 'test') {
  mongoose.connect(config.testDb);
} else {
  mongoose.connect(config.db);
}

// Bootstrap models
const models_path = `${__dirname}/./models`;
const walk = (path) => {
  fs.readdirSync(path).forEach((file) => {
    const newPath = `${path}/${file}`;
    const stat = fs.statSync(newPath);
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
passportSetup(passport);

const app = express();

app.use((req, res, next) => {
  next();
});

// express setup
expressSetup(app, passport, mongoose);

// Bootstrap route
routes(app, passport, auth);

// Start the app by listening on <port>
const { port } = config;
const server = app.listen(port);
const ioObj = io.listen(server, { log: false });
// game logic handled here
require('./socket/socket')(ioObj);

console.log(`Express app started on port ${port}`);

// Initializing logger
logger.init(app, passport, mongoose);

// expose app
export default app;
