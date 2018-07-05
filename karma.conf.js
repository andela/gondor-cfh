module.exports = (config) => {
  config.set({
    files: [
      'client/lib/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'client/js/app.js',
      'client/js/**/*.js',
      'client/test/**/*.js',
    ],
    basePath: '',
    frameworks: ['jasmine'],
    exclude: [''],
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
    browsers: ['PhantomJS'],
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
