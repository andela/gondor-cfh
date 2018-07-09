/* eslint no-unused-expressions: 0 */
/* eslint no-unused-vars: 0 import/no-extraneous-dependencies: 0 */
import dotenv from 'dotenv';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import jwt from 'jsonwebtoken';
import app from '../../src/index';

dotenv.config();

const secret = process.env.SECRET;

chai.use(chaiHttp);

describe('Game Route test', () => {
  const gameData = {
    gameId: 2,
    players: ['ebenzer', 'sansaristic', 'phemy', 'aribaba', 'ogo'],
    winner: 'sansaristic',
    rounds: 7
  };

  const tokenDetails = {
    id: '5b3a140801281e015fc20158',
    email: 'jaysansa@gmail.com',
    username: 'sansaristic'
  };

  const validToken = jwt.sign(tokenDetails, secret, { expiresIn: '1200s' });
  const invalidToken = jwt.sign(tokenDetails, secret, { expiresIn: '0001s' });

  describe('Post /api/games/save', () => {
    it('should save gave successfully and return game details', (done) => {
      chai.request(app.listen())
        .post('/api/games/save')
        .set({ 'x-access-token': validToken })
        .send(gameData)
        .end((err, res) => {
          expect(res.statusCode).to.equal(201);
          expect(res.body.message)
            .to.deep.equal('Game saved successfully');
          expect(res.body.game.winner)
            .to.deep.equal('sansaristic');
          done();
        });
    });
  });

  describe('Test authenticated Users', () => {
    it('should return Token not provided', (done) => {
      chai.request(app.listen())
        .post('/api/games/save')
        .send(gameData)
        .end((err, res) => {
          expect(res.statusCode).to.equal(403);
          expect(res.body.message)
            .to.deep.equal('Token not provided');
          done();
        });
    });

    it('should return Invalid authorization token', (done) => {
      chai.request(app.listen())
        .post('/api/games/save')
        .set({ 'x-access-token': invalidToken })
        .send(gameData)
        .end((err, res) => {
          expect(res.statusCode).to.equal(401);
          expect(res.body.message)
            .to.deep.equal('User authorization token is expired');
          done();
        });
    });
  });
});
