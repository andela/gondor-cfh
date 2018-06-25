'use strict';

var gulp = require ('gulp');
var nodemon = require ('gulp-nodemon');
var mocha = require ('gulp-mocha');
var babel = require ('gulp-babel');
var concat = require ('gulp-concat');
var sourcemaps = require ('gulp-sourcemaps');

var eslint = require ('gulp-eslint');
var sass = require ('gulp-sass');
var bower = require ('gulp-bower');
var browserSync = require ('browser-sync');
var exit = require ('gulp-exit');
var dotenv = require ('dotenv');
var gulpSequence = require ('gulp-sequence');
var del = require ('del');

dotenv.config();

var reload = browserSync.reload;

var copyFiles = function (src, dest){
  return gulp.src(src).pipe(gulp.dest(dest))};

gulp.task('install', function(){
  if (process.env.NODE_ENV !== 'production') {
    return bower({
      directory: 'public/lib'
    });
  }
  return bower({
    directory: 'dist/public/lib'
  });
});

gulp.task('watch', function() {
  gulp.watch('app/views/**', reload);
  gulp.watch('public/js/**', reload);
  gulp.watch('app/**/*.js', reload);
  gulp.watch('public/views/**', reload);
  gulp.watch('public/css/common.scss', ['sass']);
  gulp.watch('public/css/**', reload);
});

gulp.task('default', ['nodemon', 'watch']);
gulp.task('nodemon', function() {
  return nodemon({
  verbose: true,
  script: 'server.js',
  ext: 'js html jade scss css',
  ignore: ['README.md', 'node_modules/**', 'public/lib/**', '.DS_Store'],
  watch: ['app', 'config', 'public', 'server.js'],
  env: {
    PORT: 3000,
    NODE_ENV: process.env.NODE_ENV
  }
})});

gulp.task('lint', () =>
  gulp.src(['**/*.js', '!node_modules/**', '!public/lib'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError()));

gulp.task('clean', () => del(['.tmp', 'dist/*', '!dist/.git'], { dot: true }));

gulp.task('babel', () => {
  gulp.src([
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
    .pipe(gulp.dest('./dist'));
});

gulp.task('sass', function() {
  gulp.src('public/css/common.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('public/css/'));
});

gulp.task('build', gulpSequence('clean', 'babel', 'moveFiles'));

gulp.task('moveFiles', ['moveViews', 'moveConfig', 'movePublic']);

gulp.task('moveViews', function() {return copyFiles('app/views/**/*', './dist/app/views')});

gulp.task('moveConfig',function (){copyFiles('config/env/**/*', './dist/config/env')});

gulp.task('movePublic', function()
{
  return copyFiles(['public/**/*', '!public/js/**'], './dist/public')});

gulp.task('test', function() {
  gulp.src(['test/**/*.js'])
    .pipe(mocha({
      reporter: 'spec',
      exit: true,
      compilers: 'babel-core/register'
    }))
    .pipe(exit());
});