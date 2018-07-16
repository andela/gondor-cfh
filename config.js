require('dotenv').config();

/**
 * Gets the database name from a mongoose database connection url
 *
 * @param {string} url - Mongoose database url
 *
 * @returns {string} Database name
 */
const getDbNameFromUrl = url => url.split('/').pop();

const dbUrl = process.env.MONGOHQ_URL;
const databaseName = getDbNameFromUrl(dbUrl);

module.exports = {
  mongodb: {
    url: dbUrl,
    databaseName,
  },
  // The migrations dir, can be an relative or absolute path.
  // Only edit this when really necessary.
  migrationsDir: 'migrations',

  // The mongodb collection where the applied changes are stored.
  // Only edit this when really necessary.
  changelogCollectionName: 'changelog',
};
