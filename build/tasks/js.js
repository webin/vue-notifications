'use strict'

const gulp = require('gulp')

const config = require('../config')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const rename = require('gulp-rename')
const notify = require('gulp-notify')
const plumber = require('gulp-plumber')
const babel = require('gulp-babel')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const babelify = require('babelify')
const fs = require("fs")
const path = require("path")
const webpack = require('webpack-stream')
const to = require('to-case')
const stripCode = require('gulp-strip-code')
//const closureCompiler = require('google-closure-compiler').gulp();

gulp.task('js', () => {
  return gulp.src('./src/main.js')
    .pipe(webpack(require('../webpack.config.js')))
    .pipe(stripCode({
      start_comment: "START.TESTS_ONLY",
      end_comment: "END.TESTS_ONLY"
    }))
    .pipe(rename({ basename: config.projectName }))
    .pipe(gulp.dest(config.dest))
    .pipe(sourcemaps.init({ loadMaps: true }))
    // .pipe(closureCompiler({
    //   compilation_level: 'ADVANCED',
    //   // warning_level: 'VERBOSE',
    //   language_in: 'ECMASCRIPT5_STRICT',
    //   language_out: 'ECMASCRIPT5_STRICT',
    //   js_output_file: 'output.min.js'
    // }))
    .pipe(uglify())
    .pipe(rename({ basename: config.projectName + '.min' }))
    .pipe(gulp.dest(config.dest))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.dest))

})