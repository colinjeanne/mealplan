'use strict';

var babelify = require('babelify');
var browserify = require('browserify');
var gulp = require('gulp');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');

gulp.task('javascript', function () {
   return browserify({
      entries: ['./main.js'],
      basedir: './resources/assets/javascript',
      debug: true
   })
   .transform(babelify)
   .bundle()
   .on('error', function (err) { console.log('Error: ' + err.message); })
   .pipe(source('bundle.js'))
   .pipe(rename('main.js'))
   .pipe(gulp.dest('./public/'));
});

gulp.task('test', function () {
   console.log('Running test task');
});

gulp.task('es6-shim', function () {
   return gulp.src('./node_modules/es6-shim/es6-shim.js')
   .pipe(gulp.dest('./public/'));
});

gulp.task('prepare', ['test', 'es6-shim', 'javascript']);

gulp.task('default', ['es6-shim', 'javascript']);
