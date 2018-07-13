import passport from 'passport';
import express from 'express';
import logger from 'mean-logger';
import io from 'socket.io';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import socketSetup from './socket/socket';
import expressSetup from './setup/expressSetup';
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
socketSetup(ioObj);

console.log(`Express app started on port ${port}`);

// Initializing logger
logger.init(app, passport, mongoose);

// expose app
export default app;
