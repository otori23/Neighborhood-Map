'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-html-minifier');
var jshint = require('gulp-jshint');
var imageop = require('gulp-image-optimization');

var del = require('del');
var runSequence = require('run-sequence');
var minimist = require('minimist');

var options = minimist(process.argv);
var environment = options.environment || 'development';

gulp.task('images', function(cb) {
    return gulp.src(['src/img/*','!src/img/*.db'])
				.pipe(imageop({optimizationLevel: 5, progressive: true, interlaced: true}))
				.pipe(gulp.dest('img'));
});

gulp.task('html', function() {
	var opts = {
		collapseWhitespace: true,
		minifyJS: true,
		minifyCSS: true
	};

	return gulp.src('src/index.html')
		.pipe(environment === 'production' ? htmlmin(opts) : gutil.noop())
		.pipe(gulp.dest(''))
});

gulp.task('styles', function() {
	return gulp.src('src/css/*.css')
		.pipe(environment === 'production' ? minifyCss() : gutil.noop())
		.pipe(gulp.dest('css'));
});

gulp.task('scripts', function() {
	return gulp.src('src/js/app.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(environment === 'production' ? uglify() : gutil.noop())
		.pipe(gulp.dest('js'));
});

gulp.task('copy-js', function() {
	return gulp.src(['src/js/*', '!src/js/app.js'])
		.pipe(gulp.dest('js'));
});

gulp.task('copy-fonts', function() {
	return gulp.src('src/css/fonts/*')
		.pipe(gulp.dest('css/fonts'));
});

gulp.task('clean', del.bind(null, ['*.html', 'css', 'img', 'js', 'views'], {dot: true}));

gulp.task('build', ['default']);

gulp.task('default', ['clean'], function(cb) {
  runSequence(['images', 'html', 'styles', 'scripts', 'copy-js', 'copy-fonts'], cb);
});