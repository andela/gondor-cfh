/* eslint no-unused-expressions: 0 max-len: 0 */
/* eslint no-unused-vars: 0 import/no-extraneous-dependencies: 0 */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import server from '../../src/index';
import { tokens, users } from '../setup';

chai.use(chaiHttp);

describe('Games API Routes', () => {
  before((done) => {
    mongoose.connection.collections.users.insertMany(users).catch((err) => {
      if (err) return done(err);
    });

    done();
  });

  describe('Get /api/leaderboard', () => {
    it('should return game leaderboard successfully', (done) => {
      chai.request(server.listen())
        .get('/api/leaderboard')
        .set('x-access-token', tokens.goodToken)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.success).to.equal(true);
          expect(res.body.users[0].username).to.equal('test2');
          expect(res.body.users[0].gamesWon).to.equal(5);
          expect(res.body.users[1].username).to.equal('test3');
          expect(res.body.users[1].gamesWon).to.equal(3);
          expect(res.body.users[2].username).to.equal('test');
          expect(res.body.users[2].gamesWon).to.equal(1);

          if (err) done(err);
          done();
        });
    });
  });
});
