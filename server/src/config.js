import path from 'path';

const appDir = path.dirname(require.main.filename);

const config = {
  app: {
    name: `Cards for Humanity - ${process.env.NODE_ENV}`,
    url: process.env.APP_URL
  },
  root: appDir,
  port: process.env.PORT || 3000,
  db: process.env.MONGOHQ_URL,
  testDb: process.env.MONGOHQ_URL_TEST
};

if (process.env.HEROKU_APP_NAME) {
  config.app.url = `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`;
}

export default config;
