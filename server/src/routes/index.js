import AnswerController from '../controllers/answers';
import UsersController from '../controllers/users';
import UsersApiController from '../controllers/api/users';
import MailController from '../controllers/api/mail';
import QuestionsController from '../controllers/questions';
import ErrorHandler from '../middlewares/errorHandler';
import Validations from '../middlewares/validation';
import { authenticate as Authenticate } from '../middlewares/authorization';
import GamesController from '../controllers/api/games';

const avatars = require('../controllers/avatars');
const index = require('../controllers/index');

export default (app, passport) => {
  // User Routes
  app.get('/signin', UsersApiController.authCallback, ErrorHandler);
  app.get('/signup', UsersApiController.authCallback, ErrorHandler);
  app.get('/chooseavatars', UsersController.checkAvatar);
  app.get('/signout', UsersController.signout);

  // Setting up the users api
  app.post('/users', UsersController.create);
  app.post('/users/avatars', UsersController.avatars);
  app.post('/api/auth/signup', UsersApiController.signup, ErrorHandler);
  app.post('/api/auth/login', UsersApiController.login, ErrorHandler);
  app.get(
    '/api/profile',
    Authenticate, UsersApiController.profile, ErrorHandler
  );
  app.get(
    '/api/leaderboard',
    Authenticate, GamesController.leaderboard, ErrorHandler
  );
  app.get(
    '/api/games/history',
    Authenticate, GamesController.history, ErrorHandler
  );

  // Adding the friend API
  app.post('/api/friends', Authenticate, UsersApiController.addFriend);
  app.get('/api/friends', Authenticate, UsersApiController.getFriends);

  // Game routes
  app.post('/api/games/save', Authenticate, GamesController.saveGame);

  // Donation Routes
  app.get('/api/donations', Authenticate, UsersApiController.getDonations);
  app.post(
    '/api/donations',
    Authenticate, Validations.validateDonation, UsersApiController.addDonation
  );
  app.post('/donations', UsersController.addDonation);

  app.post('/users/session', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: 'Invalid email or password.'
  }), UsersController.session);

  app.get('/users/me', UsersController.me);
  app.get('/users/:userId', UsersController.show);

  // Setting the facebook oauth routes
  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['email'],
    failureRedirect: '/signup'
  }), UsersApiController.authCallback);

  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/signup'
  }), UsersApiController.authCallback);

  // Setting the github oauth routes
  app.get('/auth/github', passport.authenticate('github', {
    failureRedirect: '/signin'
  }), UsersController.authCallback);

  app.get('/auth/github/callback', passport.authenticate('github', {
    failureRedirect: '/signin'
  }), UsersController.authCallback);

  // Setting the twitter oauth routes
  app.get('/auth/twitter', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), UsersController.signin);

  app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), UsersController.authCallback);

  // Setting the google oauth routes
  app.get('/auth/google', passport.authenticate('google', {
    failureRedirect: '/signin',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  }), UsersApiController.authCallback);

  app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/signin'
  }), UsersApiController.authCallback, ErrorHandler);

  // Finish with setting up the userId param
  app.param('userId', UsersController.user);

  // Answer Routes
  app.get('/answers', AnswerController.all);

  app.get('/answers/:answerId', AnswerController.show);
  // Finish with setting up the answerId param
  app.param('answerId', AnswerController.answer);

  // Question Routes
  app.get('/questions', QuestionsController.all);
  app.get('/questions/:questionId', QuestionsController.show);
  // Finish with setting up the questionId param
  app.param('questionId', QuestionsController.question);

  // Avatar Routes
  app.get('/avatars', avatars.allJSON);

  // Home route;
  app.get('/play', index.play);
  app.get('/', index.render);

  // Search Users
  app.get('/api/search/users', Authenticate, UsersController.userSearch);

  // Email Users
  app.post('/api/mail', Authenticate, MailController.sendMail);
};
