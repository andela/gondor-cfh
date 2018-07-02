import path from 'path';

const appDir = path.dirname(require.main.filename);

export default {
  app: {
    name: `Cards for Humanity - ${process.env.NODE_ENV}`
  },
  root: appDir,
  port: process.env.PORT || 3000,
  db: process.env.MONGOHQ_URL,
  testDb: process.env.MONGOHQ_URL_TEST
};
