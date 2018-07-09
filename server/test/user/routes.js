/* eslint no-unused-expressions: 0 max-len: 0 */
/* eslint no-unused-vars: 0 import/no-extraneous-dependencies: 0 */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import server from '../../src/index';
import { tokens } from '../setup';

chai.use(chaiHttp);

describe('Users API Routes', () => {
  const newUser = {
    name: 'myName',
    email: 'test@test.com',
    username: 'myName006',
    password: 'password'
  };

  before((done) => {
    mongoose.connection.collections.users.drop((err) => {
      if (err) return done(err);
    });

    done();
  });

  describe('Post /api/auth/signup', () => {
    it('should create user successfully and return token', (done) => {
      chai.request(server.listen())
        .post('/api/auth/signup')
        .send(newUser)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body.message).to.equal('user created successfully!');
          expect(res.body).to.have.property('token');

          if (err) done(err);
          done();
        });
    });

    it('should return error if user already exist', (done) => {
      chai.request(server.listen())
        .post('/api/auth/signup')
        .send(newUser)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.success).to.equal(false);
          expect(res.body.message).to.equal('ValidationError');
          expect(res.body.errors).to.be.an('object');
          expect(res.body.errors.email).to.equal('email already exist!');
          expect(res.body.errors.username).to.equal('username already exist!');

          if (err) done(err);
          done();
        });
    });

    it('should return error if user input is not complete', (done) => {
      newUser.email = 'test01@test.com';
      newUser.username = 'myName007';
      newUser.password = undefined; // make a field undefined
      chai.request(server.listen())
        .post('/api/auth/signup')
        .send(newUser)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.success).to.equal(false);
          expect(res.body.message).to.equal('ValidationError');
          expect(res.body.errors).to.be.an('object');
          expect(res.body.errors.hashedPassword).to.equal('Password is required');

          if (err) done(err);
          done();
        });
    });
  });

  describe('Post /api/auth/login', () => {
    // Login user details
    const user = {
      email: 'test@test.com',
      password: 'password'
    };

    it('should log user in successfully and return token', (done) => {
      chai.request(server.listen())
        .post('/api/auth/login')
        .send(user)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('Login successful!');
          expect(res.body).to.have.property('token');

          if (err) done(err);
          done();
        });
    });

    it('should return error if password is incorrect', (done) => {
      user.password = '1234567';
      chai.request(server.listen())
        .post('/api/auth/login')
        .send(user)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.success).to.equal(false);
          expect(res.body.message).to.equal('Email or Password is incorrect!');

          if (err) done(err);
          done();
        });
    });

    it('should return error if email is not found', (done) => {
      user.email = 'nottest@test.com';
      chai.request(server.listen())
        .post('/api/auth/login')
        .send(user)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.success).to.equal(false);
          expect(res.body.message).to.equal('Email or Password is incorrect!');

          if (err) done(err);
          done();
        });
    });

    it('should return error if any field is empty', (done) => {
      user.email = '';
      user.password = 'password';
      chai.request(server.listen())
        .post('/api/auth/login')
        .send(user)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.success).to.equal(false);
          expect(res.body.message).to.equal('Email and Password are required!');

          if (err) done(err);
          done();
        });
    });
  });

  describe('Get /api/profile', () => {
    it('should return user profile successfully', (done) => {
      chai.request(server.listen())
        .get('/api/profile')
        .set('x-access-token', tokens.goodToken)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.success).to.equal(true);
          expect(res.body.user.username).to.equal('myname006');

          if (err) done(err);
          done();
        });
    });

    it('should return error if message if user is not registered', (done) => {
      chai.request(server.listen())
        .get('/api/profile')
        .set('x-access-token', tokens.fakeToken)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.success).to.equal(false);
          expect(res.body.message).to.equal('User does not exist!');

          if (err) done(err);
          done();
        });
    });
  });

  describe('Post /api/donations', () => {
    it('should add user donation', (done) => {
      chai.request(server.listen())
        .post('/api/donations')
        .set('x-access-token', tokens.goodToken)
        .send({ date: 'June 3, 2019' })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.success).to.equal(true);
          expect(res.body.message).to.equal('Donation Successful');

          if (err) done(err);
          done();
        });
    });
  });
});
