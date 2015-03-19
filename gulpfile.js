'use strict';

var babelify = require('babelify');
var browserify = require('browserify');
var gulp = require('gulp');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');

gulp.task('javascript', function () {
   return browserify({
      basedir: './resources/assets/javascript',
      debug: true
   })
   .transform(babelify).
   .bundle()
   .on('error', function (err) { console.log('Error: ' + err.message); })
   .pipe(source('bundle.js'))
   .pipe(rename('main.js'))
   .pipe(gulp.dest('./public/'));
});

gulp.task('default', ['javascript']);
