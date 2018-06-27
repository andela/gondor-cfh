
import { config } from 'dotenv';
import path from 'path';
import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import mocha from 'gulp-mocha';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import sourcemaps from 'gulp-sourcemaps';
import karma from 'karma';

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
      directory: 'public/lib'
    });
  }
  return bower({
    directory: 'dist/public/lib'
  });
});

gulp.task('watch', () => {
  gulp.watch('app/views/**', reload);
  gulp.watch('public/js/**', reload);
  gulp.watch('app/**/*.js', reload);
  gulp.watch('public/views/**', reload);
  gulp.watch('public/css/common.scss', ['sass']);
  gulp.watch('public/css/**', reload);
});

gulp.task('default', ['nodemon', 'watch']);
gulp.task('nodemon', () => nodemon({
  verbose: true,
  script: 'server.js',
  tasks: ['lint'],
  ext: 'js html jade scss css',
  ignore: ['README.md', 'node_modules/**', 'public/lib/**', '.DS_Store'],
  watch: ['app', 'config', 'public', 'server.js'],
  env: {
    PORT: 3000,
    NODE_ENV: process.env.NODE_ENV,
  }
}));

gulp.task('lint', () => gulp.src(['**/*.js', '!node_modules/**', '!public/lib'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError()));

gulp.task('clean', () => del(['.tmp', 'dist/*', '!dist/.git'], { dot: true }));

gulp.task('babel', () => gulp.src([
  './**/*.js',
  '!node_modules/**',
  '!public/lib/**',
  '!gulpfile.babel.js',
  '!bower_components/**/*'
])
  .pipe(sourcemaps.init())
  .pipe(babel())
  .pipe(concat('all.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./dist')));

gulp.task('sass', () => gulp.src('public/css/common.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('public/css/')));

gulp.task('build', gulpSequence('clean', 'babel', 'copyAll'));

gulp.task('copyAll', ['copyViews', 'copyConfig', 'copyPublic']);

gulp.task('copyViews', () => copyFiles('app/views/**/*', './dist/app/views'));

gulp.task('copyConfig', (

) => copyFiles('config/env/**/*', './dist/config/env'));

gulp.task('copyPublic',
  () => copyFiles(['public/**/*', '!public/js/**'], './dist/public'));

gulp.task('server-test', () => gulp.src(['backend_test/**/*.js'])
  .pipe(mocha({
    reporter: 'spec',
    exit: true,
    compilers: '@babel/register'
  }))
  .pipe(exit()));

gulp.task('front-end-test', (done) => {
  new Server({
    configFile: path.join(__dirname, 'karma.conf.js'),
    singleRun: true
  }, done).start();
});

gulp.task('test', ['server-test', 'front-end-test']);

/**
 * Run test once and exit
 */
