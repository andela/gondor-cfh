import { config } from 'dotenv';
import path from 'path';
import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import mocha from 'gulp-mocha';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import shell from 'gulp-shell';
import sourcemaps from 'gulp-sourcemaps';
import karma from 'karma';
import { Instrumenter } from 'isparta';
import istanbul from 'gulp-istanbul';
import eslint from 'gulp-eslint';
import sass from 'gulp-sass';
import bower from 'gulp-bower';
import browserSync from 'browser-sync';
import exit from 'gulp-exit';
import gulpSequence from 'gulp-sequence';
import del from 'del';

config();
const { Server } = karma;
const { reload } = browserSync;

const copyFiles = (src, dest) => gulp.src(src).pipe(gulp.dest(dest));

gulp.task('install', () => {
  if (process.env.NODE_ENV !== 'production') {
    return bower({
      directory: 'client/lib'
    });
  }
  return bower({
    directory: 'dist/client/lib'
  });
});

gulp.task('watch', () => {
  gulp.watch('client/js/**', reload);
  gulp.watch('client/views/**', reload);
  gulp.watch('client/css/common.scss', ['sass']);
  gulp.watch('client/css/**', reload);
  gulp.watch('server/**/*.js', reload);
});

gulp.task('default', ['buildServer'], shell.task('node server/dist/index.js'));

gulp.task('startDev', gulpSequence('buildServer', 'nodemon'));

gulp.task('buildServerSetup', gulpSequence('clean', 'copyViews'));

gulp.task('buildServer', ['buildServerSetup'], () => gulp.src([
  'server/src/**/*.js',
  '!server/test/**/*.js'
])
  .pipe(babel())
  .pipe(gulp.dest('server/dist')));

gulp.task('nodemon', () => nodemon({
  verbose: true,
  script: 'server/dist/index.js',
  tasks: ['buildServer'],
  ext: 'js html jade scss css',
  ignore: [
    'README.md',
    'node_modules/**',
    'server/dist/**',
    'client/lib/**',
    '.DS_Store'
  ],
  watch: ['server/src', 'client'],
  env: {
    PORT: 3000,
    NODE_ENV: process.env.NODE_ENV,
  }
}));

gulp.task('lint', () => gulp.src(['**/*.js', '!node_modules/**', '!client/lib'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError()));

gulp.task('clean', () => del(['.tmp', 'server/dist/*', '!dist/.git'],
  { dot: true }));

gulp.task('babel', () => gulp.src([
  './**/*.js',
  '!node_modules/**',
  '!client/lib/**',
  '!gulpfile.babel.js',
  '!bower_components/**/*'
])
  .pipe(sourcemaps.init())
  .pipe(babel())
  .pipe(concat('all.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./dist')));

gulp.task('sass', () => gulp.src('client/css/common.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('client/css/')));

gulp.task('build', ['buildServer']);

gulp.task('copyAll', ['copyViews', 'copyclient']);

gulp.task('copyViews',
  () => copyFiles('server/src/views/**/*', 'server/dist/views'));

gulp.task('copyclient',
  () => copyFiles(['client/**/*', '!client/js/**'], './dist/client'));

gulp.task('backendTestCoverage:instrument',
  () => gulp.src(['server/**/*.js'])
    .pipe(istanbul({
      // supports es6
      instrumenter: Instrumenter
    }))
    .pipe(istanbul.hookRequire()));

gulp.task('backendMainTest', () => gulp.src(['server/test/**/*.js'])
  .pipe(mocha({
    reporter: 'spec',
    exit: true,
    compilers: '@babel/register',
    timeout: 5000
  })));

gulp.task('backendTestCoverage:cover', () => gulp.src(['server/test/**/*.js'])
  .pipe(istanbul.writeReports({
    dir: './coverage/backend',
    reporters: ['lcov', 'json', 'text', 'text-summary'],
  }))
  .pipe(exit()));

gulp.task('backendTest',
  gulpSequence(
    'backendTestCoverage:instrument',
    'backendMainTest',
    'backendTestCoverage:cover'
  ));

gulp.task('frontendTest', (done) => {
  new Server({
    configFile: path.join(__dirname, 'karma.conf.js'),
    singleRun: true
  }, done).start();
});

gulp.task('test', ['backendTest', 'frontendTest']);
