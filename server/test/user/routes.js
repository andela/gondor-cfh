/* eslint no-unused-expressions: 0 max-len: 0 */
/* eslint no-unused-vars: 0 import/no-extraneous-dependencies: 0 */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import server from '../../src/index';
import { tokens, cleanCollection } from '../setup';
import User from '../../src/models/user';

chai.use(chaiHttp);

describe('Users API Routes', () => {
  const newUser = {
    name: 'myName',
    email: 'test@test.com',
    username: 'myName006',
    password: 'password'
  };

  before((done) => {
    cleanCollection('users', done);
  });

  describe('POST /api/auth/signup', () => {
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

  describe('POST /api/auth/login', () => {
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

  describe('GET /api/profile', () => {
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

  describe('POST /api/donations', () => {
    it('should add user donation', (done) => {
      chai.request(server.listen())
        .post('/api/donations')
        .set('x-access-token', tokens.goodToken)
        .send({ amount: '5' })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.success).to.equal(true);
          expect(res.body.message).to.equal('Donation Successful');

          if (err) done(err);
          done();
        });
    });

    it('should return amount is required error when amount is not passed', (done) => {
      chai.request(server.listen())
        .post('/api/donations')
        .set('x-access-token', tokens.goodToken)
        .send()
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.success).to.equal(false);
          expect(res.body.errors.amount).to.equal('Amount must be a number greater than 0');

          if (err) done(err);
          done();
        });
    });

    it('should return amount is required error when amount is not a number', (done) => {
      chai.request(server.listen())
        .post('/api/donations')
        .set('x-access-token', tokens.goodToken)
        .send({ amount: 'hdidio' })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.success).to.equal(false);
          expect(res.body.errors.amount).to.equal('Amount must be a number');

          if (err) done(err);
          done();
        });
    });

    it('should return amount is required error when amount is 0', (done) => {
      chai.request(server.listen())
        .post('/api/donations')
        .set('x-access-token', tokens.goodToken)
        .send({ amount: 0 })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.success).to.equal(false);
          expect(res.body.errors.amount).to.equal('Amount must be a number greater than 0');

          if (err) done(err);
          done();
        });
    });

    it('should return amount is required error when amount is negative', (done) => {
      chai.request(server.listen())
        .post('/api/donations')
        .set('x-access-token', tokens.goodToken)
        .send({ amount: -1 })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.success).to.equal(false);
          expect(res.body.errors.amount).to.equal('Amount must be a number greater than 0');

          if (err) done(err);
          done();
        });
    });
  });
  describe(' /api/friends', () => {
    const user = {
      name: 'myname100',
      email: 'test6@test.com',
      username: 'test6',
      password: 'password'
    };
    before((done) => {
      User.create([user], (err) => {
        if (err) return done(err);
        done();
      });
    });
    it('POST should add a friend', (done) => {
      chai.request(server.listen())
        .post('/api/friends')
        .set('x-access-token', tokens.goodToken)
        .send({ email: user.email, username: user.username })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.success).to.equal(true);
          expect(res.body.message).to.equal('Friend Added Successfully');

          if (err) done(err);
          done();
        });
    });
    it('GET should return the friend', (done) => {
      chai.request(server.listen())
        .get('/api/friends')
        .set('x-access-token', tokens.goodToken)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.success).to.equal(true);
          expect(res.body.user.friends[0]).to.include({ email: user.email, username: user.username });

          if (err) done(err);
          done();
        });
    });
  });

  describe('Search users GET /api/search/users', () => {
    const searchTerm = 'ozim';
    const user1 = {
      name: `Full AB${searchTerm}YZ`,
      email: `AB${searchTerm}YZ@test.com`,
      username: `AB${searchTerm}YZ`,
      password: 'password'
    };
    const user2 = {
      name: `Full CD${searchTerm}WX`,
      email: `CD${searchTerm}WX@test.com`,
      username: `CD${searchTerm}WX`,
      password: 'password'
    };
    const user3 = {
      name: 'Full name0',
      email: 'test0@test.com',
      username: 'user0',
      password: 'password'
    };
    before((done) => {
      User.insertMany([user1, user2, user3], (err) => {
        if (err) return done(err);
        done();
      });
    });

    it('should return all users that match the search term', (done) => {
      const userResponse1 = {
        name: user1.name,
        email: user1.email.toLowerCase(),
      };
      const userResponse2 = {
        name: user2.name,
        email: user2.email.toLowerCase(),
      };
      const userResponse3 = {
        name: user3.name,
        email: user3.email.toLowerCase(),
      };
      chai.request(server)
        .get(`/api/search/users?search=${searchTerm}`)
        .set('x-access-token', tokens.goodToken)
        .end((err, res) => {
          if (err) { return done(err); }
          expect(res).to.have.status(200);
          expect(res.body.users).to.deep.include(userResponse1);
          expect(res.body.users).to.deep.include(userResponse2);
          expect(res.body.users).to.not.deep.include(userResponse3);
          done();
        });
    });
  });

  after((done) => {
    cleanCollection('users', done);
  });
});
