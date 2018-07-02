/* eslint no-unused-expressions: 0 */
/* eslint max-len: 0 */
/* eslint no-unused-vars: 0 import/no-extraneous-dependencies: 0 */
import should from 'should';
import { expect } from 'chai';
import mongoose from 'mongoose';
import User from '../../src/models/user';
import '../../src/index';


// Globals
let user;

// The tests
describe('<Unit Test User Model>', () => {
  before((done) => {
    mongoose.connection.collections.users.drop((err) => {
      if (err) return done(err);
    });

    done();
  });

  describe('Validation', () => {
    it('should return validation error if any field is blank', (done) => {
      user = new User({
        name: '',
        email: '',
        username: '',
        password: ''
      });

      user.validate((err) => {
        expect(err).to.exist;
        expect(err.name).to.equal('ValidationError');
        expect(err.errors).to.exist;
        expect(err.errors.name.message).to.equal('Name cannot be blank');
        expect(err.errors.hashed_password.message).to.equal('Password is required');
        expect(err.errors.username.message).to.equal('Username cannot be blank');
        expect(err.errors.email.message).to.equal('Email cannot be blank');
      });

      done();
    });

    it('should return validation error if email is not in correct format', (done) => {
      user = new User({
        name: 'myName',
        email: 'test.com',
        username: 'User',
        password: 'password'
      });

      user.validate((err) => {
        expect(err.errors.email.message).to.equal('Email is incorrect!');
      });

      done();
    });

    it('should return validation error if username consist of only numbers', (done) => {
      user = new User({
        name: 'myName',
        email: 'test@test.com',
        username: '1234567',
        password: 'password'
      });

      user.validate((err) => {
        expect(err.errors.username.message).to.equal('Username is incorrect!');
      });

      done();
    });

    it('should not return any validation error if all input are correct', (done) => {
      user = new User({
        name: 'myName',
        email: 'test@test.com',
        username: 'myName007',
        password: 'password'
      });

      user.validate((err) => {
        expect(err).to.not.exist;
      });

      done();
    });
  });

  describe('Methods', () => {
    it('it should return encrypted password', (done) => {
      user = new User({
        name: 'myName',
        email: 'test@test.com',
        username: 'myName007',
        password: 'password',
      });

      const encryptedPassword = user.encryptPassword(user.password);
      expect(encryptedPassword).to.be.a('string');
      expect(encryptedPassword.slice(0, 7)).to.equal('$2a$10$');

      done();
    });


    it('it should return true if password is equal to hashed password', (done) => {
      user = new User({
        name: 'myName',
        email: 'test@test.com',
        username: 'myName007',
        password: 'password',
      });

      expect(user.authenticate('password')).to.equal(true);

      done();
    });

    it('it should return false if password is not equal to hashed password', (done) => {
      user = new User({
        name: 'myName',
        email: 'test@test.com',
        username: 'myName007',
        password: 'password',
      });

      expect(user.authenticate('1234567')).to.equal(false);

      done();
    });
  });

  after(done => done());

  describe('Method Save', () => {
    before((done) => {
      user = new User({
        name: 'Full name',
        email: 'test@test.com',
        username: 'user',
        password: 'password'
      });

      done();
    });

    describe('Save User', () => {
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

    after(done => done());
  });

  after(done => done());
});
