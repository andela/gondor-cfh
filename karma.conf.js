/*eslint-disable*/
module.exports = (config) => {
  config.set({
    files: [
      'client/lib/jquery/jquery.js',
      'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0-rc.2/js/materialize.min.js',
      'client/lib/lodash/lodash.js',
      'client/lib/cloudinary-core/cloudinary-core.js',
      'client/lib/angular/angular.js',
      'client/lib/angular-mocks/angular-mocks.js',
      'client/lib/cloudinary_ng/js/angular.cloudinary.js',
      'client/js/**/*.js',
      'client/test/**/*.js',
    ],
    basePath: '',
    frameworks: ['jasmine'],
    exclude: ['client/js/landingPage.js'],
    preprocessors: {
      'client/js/**/*.js': ['coverage'],
    },
    coveragePreprocessor: {
      exclude: ['server/**/*']
    },
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      type: ['lcov', 'json', 'text', 'text-summary'],
      dir: 'coverage/frontend',
      reporters: [
        { type: 'html', subdir: '.' },
        { type: 'lcov', subdir: '.' },
        { type: 'json', subdir: '.' },
        { type: 'text', subdir: '.', },
        { type: 'text-summary', subdir: '.', },
      ]
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    singleRun: false,
    concurrency: Infinity
  });
};
