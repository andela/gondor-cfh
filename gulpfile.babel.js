import { config } from 'dotenv';
import path from 'path';
import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import babel from 'gulp-babel';
import karma from 'karma';
import istanbul from 'gulp-istanbul';
import mocha from 'gulp-mocha';
import eslint from 'gulp-eslint';
import bower from 'gulp-bower';
import sass from 'gulp-sass';
import exit from 'gulp-exit';
import gulpSequence from 'gulp-sequence';
import del from 'del';
import browserSync from 'browser-sync';
import cache from 'gulp-cached';

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

gulp.task('sass', () => gulp.src('public/css/common.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('public/css/')));

gulp.task('watch', () => {
  gulp.watch('app/views/**', reload);
  gulp.watch('public/js/**', reload);
  gulp.watch('app/**/*.js', reload);
  gulp.watch('public/views/**', reload);
  gulp.watch('public/css/common.scss', ['sass']);
  gulp.watch('public/css/**', reload);
});
gulp.task('lint', () => gulp.src(['**/*.js', '!node_modules/**', '!public/lib'])
  .pipe(cache('lint'))
  .pipe(eslint())
  .pipe(eslint.format()));
gulp.task('default', ['nodemon', 'watch']);

gulp.task('nodemon', () => nodemon({
  verbose: true,
  script: 'server.js',
  tasks: ['lint'],
  ext: 'js html jade scss css',
  nodeArgs: ['-r', 'esm'],
  watch: ['app', 'config', 'public', 'server.js'],
  ignore: ['README.md', 'node_modules/**', 'public/lib/**', '.DS_Store'],
  env: {
    PORT: 3000,
  }
}));

gulp.task('default', ['nodemon', 'watch']);


gulp.task('clean', () => del(['.tmp', 'dist/*', '!dist/.git']));


gulp.task('babel', () => gulp.src([
  './**/*.js',
  '!node_modules/**',
  '!public/lib/**',
  '!gulpfile.babel.js',
  '!bower_components/**/*'
])
  .pipe(cache('babel'))
  .pipe(babel())
  .pipe(gulp.dest('./dist')));

gulp.task('sass', () => gulp.src('public/css/common.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('public/css/')));

gulp.task('build', gulpSequence('clean', 'babel', 'copyAll'));

gulp.task('copyAll', ['copyViews', 'copyPublic']);

gulp.task('copyViews',
  () => copyFiles('app/views/**/*', './dist/app/views'));

gulp.task('copyPublic',
  () => copyFiles(['public/**/*', '!public/js/**'], './dist/public'));


gulp.task('backendTestCoverage:instrument',
  () => gulp.src(['app/**/*.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire()));

gulp.task('backendMainTest', () => gulp.src(['test/backend/**/*.js'])
  .pipe(mocha({
    reporter: 'spec',
    exit: true,
    compilers: 'babel-core/register',
    timeout: 5000
  })));

gulp.task('backendTestCoverage:cover', () => gulp.src(['test/backend/**/*.js'])
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

