/* eslint no-unused-expressions: 0 max-len: 0 */
/* eslint no-unused-vars: 0 import/no-extraneous-dependencies: 0 */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import server from '../../src/index';
import { tokens, users, games } from '../setup';

chai.use(chaiHttp);

describe('Games API Routes', () => {
  before((done) => {
    mongoose.connection.collections.users.insertMany(users).then(() => {
      done();
    }).catch(done);
  });

  after((done) => {
    mongoose.connection.collections.users.drop((err) => {
      if (err) return done(err);

      done();
    });
  });

  describe('GET /api/leaderboard', () => {
    it('should return game leaderboard successfully', (done) => {
      chai.request(server.listen())
        .get('/api/leaderboard')
        .set('x-access-token', tokens.goodToken)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.success).to.equal(true);
          expect(res.body.players[0].username).to.equal('test2');
          expect(res.body.players[0].gamesWon).to.equal(5);
          expect(res.body.players[1].username).to.equal('test3');
          expect(res.body.players[1].gamesWon).to.equal(3);
          expect(res.body.players[2].username).to.equal('test');
          expect(res.body.players[2].gamesWon).to.equal(1);

          if (err) done(err);
          done();
        });
    });
  });

  describe('GET /api/games/history', () => {
    before((done) => {
      mongoose.connection.collections.games.insertMany(games).then(() => {
        done();
      }).catch(done);
    });

    after((done) => {
      mongoose.connection.collections.games.drop((err) => {
        if (err) return done(err);

        done();
      });
    });

    it('should return users game history successfully', (done) => {
      chai.request(server.listen())
        .get('/api/games/history')
        .set('x-access-token', tokens.goodToken)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.success).to.equal(true);
          expect(res.body.games[0].gameId).to.equal(3245);
          expect(res.body.games[0].winner).to.equal('test1');

          if (err) done(err);
          done();
        });
    });
  });
});
