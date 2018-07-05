import AnswerController from '../controllers/answers';
import UsersController from '../controllers/users';
import UsersApiController from '../controllers/api/users';
import MailController from '../controllers/api/mail';
import QuestionsController from '../controllers/questions';
import ErrorHandler from '../middlewares/errorHandler';

export default (app, passport) => {
  // User Routes
  app.get('/signin', UsersController.signin);
  app.get('/signup', UsersController.signup);
  app.get('/chooseavatars', UsersController.checkAvatar);
  app.get('/signout', UsersController.signout);

  // Setting up the users api
  app.post('/users', UsersController.create);
  app.post('/users/avatars', UsersController.avatars);
  app.post('/api/auth/signup', UsersApiController.signup, ErrorHandler);

  // Donation Routes
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
    failureRedirect: '/signin'
  }), UsersController.signin);

  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/signin'
  }), UsersController.authCallback);

  // Setting the github oauth routes
  app.get('/auth/github', passport.authenticate('github', {
    failureRedirect: '/signin'
  }), UsersController.signin);

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
  }), UsersController.signin);

  app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/signin'
  }), UsersController.authCallback);

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
  const avatars = require('../controllers/avatars');
  app.get('/avatars', avatars.allJSON);

  // Home route;
  const index = require('../controllers/index');
  app.get('/play', index.play);
  app.get('/', index.render);

  // Search Users
  app.get('/api/search/users', UsersController.userSearch);

  // Email Users
  app.post('/api/mail', MailController.sendMail);
};
