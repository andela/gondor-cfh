/**
 * Module dependencies.
 */
const should = require('should'),
  mongoose = require('mongoose'),
  app = require('../../server'),
  User = mongoose.model('User');

// Globals
let user;

// The tests
describe('<Unit Test>', () => {
  describe('Model User:', () => {
    before((done) => {
      user = new User({
        name: 'Full name',
        email: 'test@test.com',
        username: 'user',
        password: 'password'
      });

      done();
    });

    describe('Method Save', () => {
      it('should be able to save whithout problems', () => user.save((err) => {
        should.not.exist(err);
      }));

      it('should be able to show an error when try to save witout name', () => {
        user.name = '';
        user.save((err) => {
          should.exist(err);
        });
      });
    });

    after((done) => {
      done();
    });
  });
});
