
require('dotenv').config();
// In this file you can configure migrate-mongo
let dbName, dbUrl = '';
if (process.env.NODE_ENV === 'test') {
  dbName = 'cfh_test';
  dbUrl = process.env.MONGOHQ_URL_TEST;
} else if (process.env.NODE_ENV === 'development') {
  dbName = 'cfh';
  dbUrl = process.env.MONGOHQ_URL;
} else if (process.env.NODE_ENV === 'staging') {
  dbName = 'gondor-cfh-staging';
  dbUrl = process.env.MONGOHQ_URL_STAGING;
} else {
  dbName = 'gondor-cfh';
  dbUrl = process.env.MONGOHQ_URL_PROD;
}

module.exports = {

  mongodb: {
    url: dbUrl,
    databaseName: dbName,
  },

  // The migrations dir, can be an relative or absolute path.
  // Only edit this when really necessary.
  migrationsDir: 'migrations',

  // The mongodb collection where the applied changes are stored.
  // Only edit this when really necessary.
  changelogCollectionName: 'changelog',

};
