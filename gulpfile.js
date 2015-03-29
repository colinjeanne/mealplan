'use strict';

var babel = require('gulp-babel');
var browserify = require('browserify');
var gulp = require('gulp');
var jasmine = require('gulp-jasmine');
var source = require('vinyl-source-stream');

gulp.task('browserify', function () {
   return browserify({
         entries: ['./main.js'],
         basedir: './build/src',
         debug: true
      })
      .bundle()
      .on('error', function (err) { console.log('Error: ' + err.message); })
      .pipe(source('main.js'))
      .pipe(gulp.dest('./public/'));
});

gulp.task('babel-src', function () {
   return gulp.src('./resources/assets/javascript/**/*.js')
      .pipe(babel())
      .pipe(gulp.dest('./build/src/'));
});

gulp.task('babel-test', function () {
   return gulp.src('./tests/javascript/*.js')
      .pipe(babel())
      .pipe(gulp.dest('./build/test/'));
});

gulp.task('test', ['babel-src', 'babel-test'], function () {
   console.log('Running test task');
   return gulp.src('./build/test/*.js')
      .pipe(jasmine());
});

gulp.task('es6-shim', function () {
   return gulp.src('./node_modules/es6-shim/es6-shim.js')
      .pipe(gulp.dest('./public/'));
});

gulp.task('es6-symbol', function () {
   return browserify({
         entries: ['./implement.js'],
         basedir: './node_modules/es6-symbol'
      })
      .bundle()
      .on('error', function (err) { console.log('Error: ' + err.message); })
      .pipe(source('es6-symbol.js'))
      .pipe(gulp.dest('./public/'));
});

gulp.task('fetch', function () {
   return gulp.src('./node_modules/whatwg-fetch/fetch.js')
      .pipe(gulp.dest('./public/'));
});

gulp.task('external-js', ['es6-shim', 'es6-symbol', 'fetch']);

gulp.task('prepare', ['external-js', 'test', 'browserify']);

gulp.task('default', ['external-js', 'browserify']);
