/* eslint-disable */
var answers = require('../seed_data/answers-data');
module.exports = {

  up(db, next) {
    db.collection('answers').insert(answers, next);
  },

  down(db, next) {
    db.collection('answers').drop(next);
  }
};
