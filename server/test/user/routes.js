/* eslint no-unused-expressions: 0 */
/* eslint no-unused-vars: 0 import/no-extraneous-dependencies: 0 */
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
      newUser.email = 'test01@test.com';
      newUser.username = 'myName007';
      newUser.password = undefined; // make a field undefined
      chai.request(server.listen())
        .post('/api/auth/signup')
        .send(newUser)
        .end((err, res) => {
          expect(res.status).to.equal(409);
          expect(res.body.success).to.equal(false);
          expect(res.body.message).to.be.an('array');
          expect(res.body.message).to.be.contain('Password is required');

          if (err) done(err);
        });
      done();
    });
  });
});
