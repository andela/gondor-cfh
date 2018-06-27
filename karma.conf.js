module.exports = (config) => {
  config.set({
    files: [
      'public/lib/angular/angular.js',
      'public/js/**/*.js',
      'test/frontend/**/*.js'
    ],
    basePath: '',
    frameworks: ['jasmine'],
    exclude: [],
    preprocessors: {
      'public/js/**/*.js': ['coverage']
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
    singleRun: false,
    concurrency: Infinity
  });
};
