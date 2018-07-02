/* eslint no-unused-expressions: 0 */
/* eslint no-unused-vars: 0 */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import User from '../../src/models/user';
import server from '../../src/index';

chai.use(chaiHttp);

describe('Users API Routes', () => {
  const newUser = {
    name: 'myName',
    email: 'test@test.com',
    username: 'myName006',
    password: 'password'
  };

  // after(done => done());

  describe('Post /api/auth/signup', () => {
    before((done) => {
      mongoose.connection.collections.users.drop((err) => {
        if (err) return done(err);
      });

      done();
    });

    it('should create user successfully and return token', (done) => {
      chai.request(server.listen())
        .post('/api/auth/signup')
        .send(newUser)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body.message).to.equal('user created successfully!');
          expect(res.body).to.have.property('token');

          if (err) done(err);
        });
      done();
    });

    it('should return error if user already exist', (done) => {
      chai.request(server.listen())
        .post('/api/auth/signup')
        .send(newUser)
        .end((err, res) => {
          expect(res.status).to.equal(409);
          expect(res.body.success).to.equal(false);
          expect(res.body.error).to.equal('ValidationError');
          expect(res.body.message).to.be.an('array');
          expect(res.body.message).to.be.contain('email already exist!');
          expect(res.body.message).to.be.contain('username already exist!');

          if (err) done(err);
        });
      done();
    });

    it('should return error if user input is not complete', (done) => {
      newUser.password = undefined; // make a field undefined
      chai.request(server.listen())
        .post('/api/auth/signup')
        .send(newUser)
        .end((err, res) => {
          expect(res.status).to.equal(409);
          expect(res.body.success).to.equal(false);
          expect(res.body.message).to.be.equal('Password is required');

          if (err) done(err);
        });
      done();
    });
  });

  describe('Post /api/auth/login', () => {
    before((done) => {
      mongoose.connection.collections.users.drop((err) => {
        if (err) return done(err);
      });

      // Add user to database
      const user = new User({
        name: 'myName',
        email: 'test@test.com',
        username: 'myName006',
        password: 'password'
      });

      done();
    });

    // after(done => done());

    // Add user to database
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
        });
      done();
    });

    it('should return error if password is incorrect', (done) => {
      user.email = 'nottest@test.com';
      chai.request(server.listen())
        .post('/api/auth/login')
        .send(user)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.success).to.equal(false);
          expect(res.body.message).to.be.equal('User not found!');

          if (err) done(err);
        });
      done();
    });

    it('should return error if password is incorrect', (done) => {
      user.email = 'test@test.com';
      user.password = '123456';
      chai.request(server.listen())
        .post('/api/auth/login')
        .send(user)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.success).to.equal(false);
          expect(res.body.message).to.be.equal('Password incorrect!');

          if (err) done(err);
        });
      done();
    });

    it('should return error if fields are empty', (done) => {
      user.email = '';
      user.password = 'password';
      chai.request(server.listen())
        .post('/api/auth/login')
        .send(user)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.success).to.equal(false);
          expect(res.body.message).to.be.equal('You must fill all fields.');

          if (err) done(err);
        });
      done();
    });
  });
});
