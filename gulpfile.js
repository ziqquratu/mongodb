'use strict';

var gulp        = require('gulp'),
    tslint      = require('gulp-tslint'),
    tsc         = require('gulp-typescript'),
    batch       = require('gulp-batch'),
    watch       = require('gulp-watch'),
    exec        = require('child_process').exec,
    runSequence = require('run-sequence'),
    del         = require('del');

// Lint
//-----------------------------------------------------------------------------
gulp.task('lint', function() {
  var config =  {formatter: 'verbose'};
  return gulp.src([
    'src/**/**.ts'
  ])
  .pipe(tslint(config))
  .pipe(tslint.report());
});

// Test
//-----------------------------------------------------------------------------
gulp.task('test', function(cb) {
  exec('npm test', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb();
  });
});

gulp.task('test:clean', function () {
  return del(['mongo.js']);
});

var tstProject = tsc.createProject('tsconfig.json', {
  typescript: require('typescript')
});

// Build
//-----------------------------------------------------------------------------
gulp.task('build', function() {
  return gulp.src([
    'src/**/*.ts'
  ])
  .pipe(tstProject())
  .on('error', function (err) {
      process.exit(1);
  })
  .js.pipe(gulp.dest('dist/'));
});

// Build dts
//-----------------------------------------------------------------------------
var tsDtsProject = tsc.createProject('tsconfig.json', {
  declaration: true,
  noResolve: false,
  typescript: require('typescript')
});

gulp.task('build-dts', function() {
  return gulp.src([
    'src/**/*.ts'
  ])
  .pipe(tsDtsProject())
  .on('error', function (err) {
    process.exit(1);
  })
  .dts.pipe(gulp.dest('dts'));
});

// Watch
//-----------------------------------------------------------------------------
gulp.task('watch', function () {
  watch(['src/**/*.ts', 'test/**/*.ts'], batch(function (events, done) {
    gulp.start('default', done);
  }));
});

// Default
//-----------------------------------------------------------------------------
gulp.task('default', function (cb) {
  runSequence('lint', 'test', 'test:clean', ['build', 'build-dts'], cb);
});
