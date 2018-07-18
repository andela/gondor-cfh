/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai';
import io from 'socket.io-client';
import mongoose from 'mongoose';

import { questionList } from '../mock/mockQuestions';
import { answerList } from '../mock/mockAnswers';
import Game from '../../src/socket/game';
import questionModel from '../../src/models/question';
import answerModel from '../../src/models/answer';

const socketURL = 'http://localhost:3000';

const options = {
  transports: ['websocket'],
  'force new connection': true
};

describe('Game Server', () => {
  it('Should accept requests to joinGame', (done) => {
    const client1 = io.connect(socketURL, options);
    const disconnect = () => {
      client1.disconnect();
      done();
    };
    client1.on('connect', () => {
      client1.emit('joinGame',
        { userID: 'unauthenticated', room: '', createPrivate: false });
      setTimeout(disconnect, 200);
    });
  });

  it('Should send a game update upon receiving request to joinGame', (done) => {
    const client1 = io.connect(socketURL, options);
    const disconnect = () => {
      client1.disconnect();
      done();
    };
    client1.on('connect', () => {
      client1.emit('joinGame',
        { userID: 'unauthenticated', room: '', createPrivate: false });
      client1.on('gameUpdate', (data) => {
        data.gameID.should.match(/\d+/);
      });
      setTimeout(disconnect, 200);
    });
  });

  it('Should announce new user to all users', (done) => {
    const client1 = io.connect(socketURL, options);
    let client2;
    const disconnect = () => {
      client1.disconnect();
      client2.disconnect();
      done();
    };
    client1.on('connect', () => {
      client1.emit('joinGame',
        { userID: 'unauthenticated', room: '', createPrivate: false });
      client2 = io.connect(socketURL, options);
      client2.on('connect', () => {
        client2.emit('joinGame',
          { userID: 'unauthenticated', room: '', createPrivate: false });
        client1.on('notification', (data) => {
          data.notification.should.match(/ has joined the game!/);
        });
      });
      setTimeout(disconnect, 200);
    });
  });

  it('Should start game when startGame event is sent with 3 players',
    (done) => {
      let client2, client3;
      const client1 = io.connect(socketURL, options);
      const disconnect = () => {
        client1.disconnect();
        client2.disconnect();
        client3.disconnect();
        done();
      };
      const expectStartGame = () => {
        client1.emit('startGame');
        client1.on('gameUpdate', (data) => {
          data.state.should.equal('waiting for players to pick');
        });
        client2.on('gameUpdate', (data) => {
          data.state.should.equal('waiting for players to pick');
        });
        client3.on('gameUpdate', (data) => {
          data.state.should.equal('waiting for players to pick');
        });
        setTimeout(disconnect, 200);
      };
      client1.on('connect', () => {
        client1.emit('joinGame',
          { userID: 'unauthenticated', room: '', createPrivate: false });
        client2 = io.connect(socketURL, options);
        client2.on('connect', () => {
          client2.emit('joinGame',
            { userID: 'unauthenticated', room: '', createPrivate: false });
          client3 = io.connect(socketURL, options);
          client3.on('connect', () => {
            client3.emit('joinGame',
              { userID: 'unauthenticated', room: '', createPrivate: false });
            setTimeout(expectStartGame, 100);
          });
        });
      });
    });

  it('Should automatically start game when 6 players are in a game', (done) => {
    let client2, client3, client4, client5, client6;
    const client1 = io.connect(socketURL, options);
    const disconnect = () => {
      client1.disconnect();
      client2.disconnect();
      client3.disconnect();
      client4.disconnect();
      client5.disconnect();
      client6.disconnect();
      done();
    };
    const expectStartGame = () => {
      client1.emit('startGame');
      client1.on('gameUpdate', (data) => {
        data.state.should.equal('czar is selecting a question');
      });
      client2.on('gameUpdate', (data) => {
        data.state.should.equal('czar is selecting a question');
      });
      client3.on('gameUpdate', (data) => {
        data.state.should.equal('czar is selecting a question');
      });
      client4.on('gameUpdate', (data) => {
        data.state.should.equal('czar is selecting a question');
      });
      client5.on('gameUpdate', (data) => {
        data.state.should.equal('czar is selecting a question');
      });
      client6.on('gameUpdate', (data) => {
        data.state.should.equal('czar is selecting a question');
      });
      setTimeout(disconnect, 200);
    };
    client1.on('connect', () => {
      client1.emit('joinGame',
        { userID: 'unauthenticated', room: '', createPrivate: true });
      let connectOthers = true;
      client1.on('gameUpdate', (data) => {
        const { gameID } = data;
        if (connectOthers) {
          client2 = io.connect(socketURL, options);
          connectOthers = false;
          client2.on('connect', () => {
            client2.emit('joinGame',
              {
                userID: 'unauthenticated',
                room: gameID,
                createPrivate: false
              });
            client3 = io.connect(socketURL, options);
            client3.on('connect', () => {
              client3.emit('joinGame',
                {
                  userID: 'unauthenticated',
                  room: gameID,
                  createPrivate: false
                });
              client4 = io.connect(socketURL, options);
              client4.on('connect', () => {
                client4.emit('joinGame',
                  {
                    userID: 'unauthenticated',
                    room: gameID,
                    createPrivate: false
                  });
                client5 = io.connect(socketURL, options);
                client5.on('connect', () => {
                  client5.emit('joinGame',
                    {
                      userID: 'unauthenticated',
                      room: gameID,
                      createPrivate: false
                    });
                  client6 = io.connect(socketURL, options);
                  client6.on('connect', () => {
                    client6.emit('joinGame',
                      {
                        userID: 'unauthenticated',
                        room: gameID,
                        createPrivate: false
                      });
                    setTimeout(expectStartGame, 100);
                  });
                });
              });
            });
          });
        }
      });
    });
  });
});

describe('Game Socket:', () => {
  beforeEach((done) => {
    mongoose.connection.collections.questions.deleteMany({}, (err) => {
      if (err) return done(err);
    });
    questionModel.insertMany(questionList, () => {
      mongoose.connection.collections.answers.deleteMany({}, (err) => {
        if (err) return done(err);
      });
      answerModel.insertMany(answerList, () => {
        done();
      });
    });
  });
  it('Should only get questions for specified region', (done) => {
    const socket = io.connect(socketURL, options);
    const region = 'Europe';
    const game = new Game(123, socket, region);
    game.getQuestions((nullValue, result) => {
      const expectedResult = questionList.filter(q => q.region === region);
      expect(result[0].text).to.equal(expectedResult[0].text);
      expect(result[1].text).to.equal(expectedResult[1].text);
      expect(result[2].text).to.equal(expectedResult[2].text);
      done();
    });
  });

  it('Should only get answers for specified region', (done) => {
    const socket = io.connect(socketURL, options);
    const region = 'Europe';
    const game = new Game(123, socket, region);
    game.getAnswers((nullValue, result) => {
      const expectedResult = answerList.filter(q => q.region === region);
      expect(result[0].text).to.equal(expectedResult[0].text);
      expect(result[1].text).to.equal(expectedResult[1].text);
      expect(result[2].text).to.equal(expectedResult[2].text);
      done();
    });
  });

  describe('setCurQuestion method', () => {
    it('should update current question', () => {
      const socket = io.connect(socketURL, options);
      const region = 'Europe';
      const game = new Game(123, socket, region);
      game.czarQuestionOptions = ['asdf', 'adsfas', 'fcu'];
      game.setCurQuestion(1);
      expect(game.curQuestion).to.equal('adsfas');
    });
  });
});
