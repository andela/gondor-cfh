/* eslint no-unused-expressions: 0 max-len: 0 */
/* eslint no-unused-vars: 0 import/no-extraneous-dependencies: 0 */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import server from '../../src/index';
import { tokens } from '../setup';

chai.use(chaiHttp);

describe('Authorization', () => {
  describe('authenticate', () => {
    it('should not authenticate user with no token succesfully', (done) => {
      chai.request(server.listen())
        .get('/api/profile')
        .end((err, res) => {
          expect(res.status).to.equal(403);
          expect(res.body.success).to.equal(false);
          expect(res.body.message).to.equal('Token not provided');

          if (err) done(err);
          done();
        });
    });

    it('should not authenticate user with fake token succesfully', (done) => {
      chai.request(server.listen())
        .get('/api/profile')
        .set('x-access-token', tokens.badToken)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body.success).to.equal(false);
          expect(res.body.message).to.equal('Failed to authenticate token');

          if (err) done(err);
          done();
        });
    });

    it('should not authenticate user with expired token succesfully', (done) => {
      chai.request(server.listen())
        .get('/api/profile')
        .set('x-access-token', tokens.expiredToken)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body.success).to.equal(false);
          expect(res.body.message).to.equal('User authorization token is expired');

          if (err) done(err);
          done();
        });
    });
  });
});
