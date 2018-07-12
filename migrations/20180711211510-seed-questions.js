/* eslint-disable */
var questions = require('../seed_data/questions-data');
module.exports = {

  up(db, next) {
    db.collection('questions').insert(questions, next);
  },

  down(db, next) {
    db.collection('questions').drop(next);
  }
};
