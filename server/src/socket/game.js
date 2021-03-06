/* eslint max-len: 0 */
/* eslint no-console: 0 */
/* eslint no-unused-vars: 0 */
import _ from 'lodash';
import async from 'async';
import answers from '../controllers/answers';
import questions from '../controllers/questions';

const guestNames = [
  'Disco Potato',
  'Silver Blister',
  'Insulated Mustard',
  'Funeral Flapjack',
  'Toenail',
  'Urgent Drip',
  'Raging Bagel',
  'Aggressive Pie',
  'Loving Spoon',
  'Swollen Node',
  'The Spleen',
  'Dingle Dangle'
];

/**
 * @class Game
 */
class Game {
  /**
   *
   * @param {number} gameID - game id
   * @param {object} io - socket.io object
   * @param {object} region - player region
   */
  constructor(gameID, io, region) {
    this.io = io;
    this.gameID = gameID;
    this.region = region || null;
    this.players = []; // Contains array of player models
    this.table = []; // Contains array of {card: card, player: player.id}
    this.winningCard = -1; // Index in this.table
    this.gameWinner = -1; // Index in this.players
    this.winnerAutopicked = false;
    this.czar = -1; // Index in this.players
    this.playerMinLimit = 6;
    this.playerMaxLimit = 12;
    this.pointLimit = 5;
    this.state = 'awaiting players';
    this.round = 0;
    this.questions = [];
    this.answers = null;
    this.czarQuestionOptions = [];
    this.curQuestion = null;
    this.timeLimits = {
      stateChoosing: 20,
      stateJudging: 15,
      stateResults: 5
    };
    // setTimeout ID that triggers the czar judging state
    // Used to automatically run czar judging if players
    // don't pick before time limit
    // Gets cleared if players finish picking before time limit.
    this.choosingTimeout = 0;
    // setTimeout ID that triggers the result state
    // Used to automatically run result if czar doesn't decide before time limit
    // Gets cleared if czar finishes judging before time limit.
    this.judgingTimeout = 0;
    this.resultsTimeout = 0;
    this.guestNames = guestNames.slice();
  }

  /**
   * @returns {undefined} - undefined
   */
  payload = () => {
    const players = [];
    this.players.forEach((player) => {
      players.push({
        hand: player.hand,
        points: player.points,
        username: player.username,
        avatar: player.avatar,
        premium: player.premium,
        socketID: player.socket.id,
        color: player.color
      });
    });
    return {
      gameID: this.gameID,
      players,
      czar: this.czar,
      state: this.state,
      round: this.round,
      gameWinner: this.gameWinner,
      winningCard: this.winningCard,
      winningCardPlayer: this.winningCardPlayer,
      winnerAutopicked: this.winnerAutopicked,
      table: this.table,
      pointLimit: this.pointLimit,
      czarQuestionOptions: this.czarQuestionOptions,
      curQuestion: this.curQuestion
    };
  }

  /**
   *
   * @param {string} msg Notification message
   *
   * @returns {undefined} undefined
   */
  sendNotification(msg) {
    this.io.sockets.in(this.gameID).emit('notification', { notification: msg });
  }

  /**
   * Currently called on each joinGame event from socket.js
   * Also called on removePlayer IF game is in 'awaiting players' state
   *
   * @returns {undefined} undefined
   */
  assignPlayerColors() {
    this.players.forEach((player, index) => {
      player.color = index;
    });
  }

  /**
   * @returns {undefined} undefined
   */
  assignGuestNames() {
    this.players.forEach((player) => {
      if (player.username === 'Guest') {
        player.username = _.sample(this.guestNames);
        if (!this.guestNames.length) {
          this.guestNames = guestNames.slice();
        }
      }
    });
  }

  /**
   * @returns {undefined} - undefined
   */
  prepareGame = () => {
    this.state = 'game in progress';

    this.io.sockets.in(this.gameID).emit('prepareGame',
      {
        playerMinLimit: this.playerMinLimit,
        playerMaxLimit: this.playerMaxLimit,
        pointLimit: this.pointLimit,
        timeLimits: this.timeLimits
      });

    async.parallel([
      this.getQuestions,
      this.getAnswers
    ],
    (err, results) => {
      [this.questions, this.answers] = results;

      this.startGame();
    });
  }

  /**
   * @returns {undefined} - undefined
   */
  startGame() {
    this.questions = _.shuffle(this.questions);
    this.answers = _.shuffle(this.answers);
    this.stateSelectingQuestion();
  }

  /**
   * @returns {undefined} - undefined
   */
  sendUpdate() {
    this.io.sockets.in(this.gameID).emit('gameUpdate', this.payload());
  }

  /**
   * Allows czar to select questions for each round
   *
   * @returns {undefined} undefined
   */
  stateSelectingQuestion() {
    this.state = 'czar is selecting a question';
    this.table = [];
    this.winningCard = -1;
    this.winningCardPlayer = -1;
    this.winnerAutopicked = false;
    // Rotate card czar
    if (this.czar >= this.players.length - 1) {
      this.czar = 0;
    } else {
      this.czar += 1;
    }
    this.czarQuestionOptions = _.shuffle(this.questions).slice(0, 10);
    this.sendUpdate();
  }

  /**
   * Sets the question selected by the czar as the current game question
   *
   * @param {Number} questionIndex Index of the selected question from the czarQuestionOptions array
   *
   * @returns {undefined} undefined
   */
  setCurQuestion(questionIndex) {
    this.curQuestion = this.czarQuestionOptions[questionIndex];
  }

  /**
   *
   * @returns {undefined} - undefined
   */
  stateChoosing = () => {
    this.state = 'waiting for players to pick';
    // console.log(self.gameID,self.state);
    if (_.isEmpty(this.questions)) {
      this.getQuestions((err, data) => {
        this.questions = data;
      });
    }
    this.round += 1;
    this.dealAnswers();
    this.sendUpdate();

    this.choosingTimeout = setTimeout(
      this.stateJudging,
      this.timeLimits.stateChoosing * 1000
    );
  }

  /**
   * @returns {undefined} - undefined
   */
  selectFirst() {
    if (this.table.length) {
      this.winningCard = 0;
      const winnerIndex = this._findPlayerIndexBySocket(this.table[0].player);
      this.winningCardPlayer = winnerIndex;
      this.players[winnerIndex].points += 1;
      this.winnerAutopicked = true;
      this.stateResults();
    } else {
    // console.log(this.gameID,'no cards were picked!');
      this.stateSelectingQuestion();
    }
  }

  /**
   * Function to handle CZAR's winner card selection
   *
   * @returns {null} - null value
   */
  stateJudging = () => {
    this.state = 'waiting for czar to decide';
    // console.log(self.gameID,self.state);

    if (this.table.length <= 1) {
      // Automatically select a card if only one card was submitted
      this.selectFirst();
    } else {
      this.sendUpdate();
      this.judgingTimeout = setTimeout(() => {
        // Automatically select the first submitted card when time runs out.
        this.selectFirst();
      }, this.timeLimits.stateJudging * 1000);
    }
  }

  /**
   * Function to set winner and update player's point
   * @param {object} self
   * @return {null} - null
   */
  stateResults = () => {
    this.state = 'winner has been chosen';

    let winner = -1;
    const gameWon = this.players.some((player, index) => {
      winner = index;
      return player.points >= this.pointLimit;
    });

    this.sendUpdate();
    this.resultsTimeout = setTimeout(() => {
      if (gameWon) {
        this.stateEndGame(winner);
      } else {
        this.stateSelectingQuestion();
      }
    }, this.timeLimits.stateResults * 1000);
  }

  /**
   * Function to update game state when game ends
   *
   * @param {Number} winner - Winner index in players array
   *
   * @return {undefined} - undefined
   */
  stateEndGame(winner) {
    this.state = 'game ended';
    this.gameWinner = winner;
    this.sendUpdate();
    const players = this.players.map(player => player.username);
    const gameDetails = {
      gameID: this.gameID,
      players,
      winner: this.players[winner].username,
      rounds: this.round,
    };
    this.io.sockets.in(this.gameID).emit('saveGame', gameDetails);
  }

  /**
   * Function to update game state when game dissolves
   *
   * @returns {undefined} - undefined
   */
  stateDissolveGame() {
    this.state = 'game dissolved';
    this.sendUpdate();
  }

  /**
   * Function to get questions from db using region
   * @param {function} cb - callback function
   * @returns {null} - null
   */
  getQuestions = (cb) => {
    questions.allQuestionsForGame((data) => {
      cb(null, data);
    }, this.region);
  }

  /**
   * Function to get answers from db using region
   * @param {function} cb - callback function
   * @returns {null} - null
   */
  getAnswers = (cb) => {
    answers.allAnswersForGame((data) => {
      cb(null, data);
    }, this.region);
  }

  /**
   * Function to deal answer cards
   *
   * @param {number} maxAnswers
   * @return {undefined} - undefined
   */
  dealAnswers(maxAnswers = 10) {
    let availableAnswers = this.answers.slice();
    this.players.forEach((player) => {
      if (_.isEmpty(availableAnswers)) {
        availableAnswers = this.answers.slice();
      }
      player.hand = availableAnswers.splice(0, maxAnswers);
    });
  }

  /**
   * Function to find a player by socket id
   * @param {object} thisPlayer
   * @returns {number} - player index
   */
  _findPlayerIndexBySocket(thisPlayer) {
    const playerIndex = this.players.findIndex(player => player.socket.id === thisPlayer);

    return playerIndex;
  }

  /**
   * Function to handle picking of cards by players
   * @param {array} thisCardArray
   * @param {object} thisPlayer
   * @returns {null} - null
   */
  pickCards(thisCardArray, thisPlayer) {
  // Only accept cards when we expect players to pick a card
    if (this.state === 'waiting for players to pick') {
    // Find the player's position in the players array
      const playerIndex = this._findPlayerIndexBySocket(thisPlayer);
      // console.log('player is at index', playerIndex);
      if (playerIndex !== -1) {
      // Verify that the player hasn't previously picked a card
        let previouslySubmitted = false;
        /* eslint-disable no-unused-vars */
        _.each(this.table, (pickedSet, index) => {
          if (pickedSet.player === thisPlayer) {
            previouslySubmitted = true;
          }
        });
        if (!previouslySubmitted) {
        // Find the indices of the cards in the player's
        // hand (given the card ids)
          const tableCard = [];
          for (let i = 0; i < thisCardArray.length; i++) {
            let cardIndex = null;
            for (let j = 0; j < this.players[playerIndex].hand.length; j++) {
              if (this.players[playerIndex].hand[j].id === thisCardArray[i]) {
                cardIndex = j;
              }
            }
            // console.log('card', i, 'is at index', cardIndex);
            if (cardIndex !== null) {
              tableCard.push(
                this.players[playerIndex].hand.splice(cardIndex, 1)[0]
              );
            }
            // console.log('table object at', cardIndex, ':', tableCard);
          }
          if (tableCard.length === this.curQuestion.numAnswers) {
            this.table.push({
              card: tableCard,
              player: this.players[playerIndex].socket.id
            });
          }
          if (this.table.length === this.players.length - 1) {
            clearTimeout(this.choosingTimeout);
            this.stateJudging(this);
          } else {
            this.sendUpdate();
          }
        }
      }
    } else {
      // console.log('NOTE:', thisPlayer, 'picked a card during', this.state);
    }
  }

  /**
   * Function to return a particular player
   * @param {object} thisPlayer
   * @returns {object} player
   */
  getPlayer(thisPlayer) {
    const playerIndex = this._findPlayerIndexBySocket(thisPlayer);
    if (playerIndex > -1) {
      return this.players[playerIndex];
    }
    return {};
  }

  /**
   * Function to remove a particular player
   * @param {object} thisPlayer
   * @returns {null} - null
   */
  removePlayer(thisPlayer) {
    const playerIndex = this._findPlayerIndexBySocket(thisPlayer);

    if (playerIndex !== -1) {
    // Just used to send the remaining players a notification
      const playerName = this.players[playerIndex].username;

      // If this player submitted a card, take it off the table
      this.table.forEach((tableItem, index) => {
        if (tableItem.player === thisPlayer) {
          this.table.splice(index, 1);
        }
      });

      // Remove player from this.players
      this.players.splice(playerIndex, 1);

      if (this.state === 'awaiting players') {
        this.assignPlayerColors();
      }

      // Check if the player is the czar
      if (this.czar === playerIndex) {
      // If the player is the czar...
      // If players are currently picking a card, advance to a new round.
        if (this.state === 'waiting for players to pick') {
          clearTimeout(this.choosingTimeout);
          this.sendNotification(
            'The Czar left the game! Starting a new round.'
          );
          return this.stateSelectingQuestion();
        } if (this.state === 'waiting for czar to decide') {
        // If players are waiting on a czar to pick, auto pick.
          this.sendNotification(
            'The Czar left the game! First answer submitted wins!'
          );
          this.pickWinning(this.table[0].card[0].id, thisPlayer, true);
        }
      } else {
      // Update the czar's position if the removed
      // player is above the current czar
        if (playerIndex < this.czar) {
          this.czar -= 1;
        }
        this.sendNotification(`${playerName} has left the game.`);
      }

      this.sendUpdate();
    }
  }

  /**
   * Function to pick winner
   *
   * @param {object} thisCard
   * @param {object} thisPlayer
   * @param {boolean} autopicked
   *
   * @returns {undefined} undefined
   */
  pickWinning(thisCard, thisPlayer, autopicked) {
    autopicked = autopicked || false;
    const playerIndex = this._findPlayerIndexBySocket(thisPlayer);
    if ((playerIndex === this.czar || autopicked)
      && this.state === 'waiting for czar to decide') {
      let cardIndex = -1;
      _.each(this.table, (winningSet, index) => {
        if (winningSet.card[0].id === thisCard) {
          cardIndex = index;
        }
      });
      if (cardIndex !== -1) {
        this.winningCard = cardIndex;
        const winnerIndex = this._findPlayerIndexBySocket(
          this.table[cardIndex].player
        );
        this.sendNotification(
          `${this.players[winnerIndex].username} has won the round!`
        );
        this.winningCardPlayer = winnerIndex;
        this.players[winnerIndex].points += 1;
        clearTimeout(this.judgingTimeout);
        this.winnerAutopicked = autopicked;
        this.stateResults();
      }
    } else {
    // TODO: Do something?
      this.sendUpdate();
    }
  }

  /**
   * Function to kill the game
   *
   * @returns {undefined} undefined
   */
  killGame() {
    // console.log('Killing game', this.gameID);
    clearTimeout(this.resultsTimeout);
    clearTimeout(this.choosingTimeout);
    clearTimeout(this.judgingTimeout);
  }
}


export default Game;
