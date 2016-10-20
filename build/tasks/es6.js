'use strict';

const gulp = require('gulp');

const config = require('../config');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const babel = require('gulp-babel');
const source = require('vinyl-source-stream');
const webpack = require('webpack-stream');

gulp.task('es6', () => {

  return gulp.src(config.js.src)
    .pipe(plumber({
      errorHandler: notify.onError(function (err) {
        return {
          title: 'Build ES6',
          message: err.message
        };
      })
    }))
    .pipe(concat(`${config.projectName}.es6.js`))
    .pipe(gulp.dest(config.dest))
    .pipe(babel({ presets: ['babili'] }))
    // TODO (S.Panfilov) Remove comments
    // TODO (S.Panfilov) Perhaps add sourcemaps
    .pipe(rename({ basename: `${config.projectName}.es6.min` }))
    .pipe(gulp.dest(config.dest))
    ;
});