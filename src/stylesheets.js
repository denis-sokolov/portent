'use strict';

var gulp = require('gulp');
var gulpAutoprefixer = require('gulp-autoprefixer');
var gulpSourcemaps = require('gulp-sourcemaps');
var gulpConcat = require('gulp-concat');
var gulpCssNano = require('gulp-cssnano');
var gulpIf = require('gulp-if');
var gulpLess = require('gulp-less');
var md5 = require('md5');

var expires = require('./util/expires');
var gulpStreamToString = require('./util/gulp-stream-to-string');
var getFiles = require('./util/get-files');

module.exports = function(directory, options){
	options = options || {};
	options.minify = Boolean(options.minify);

	var get = function(){
		return getFiles(
			[directory + '/css'],
			['less', 'css']
		).then(function(files){
			return gulpStreamToString(gulp.src(files)
				.pipe(gulpSourcemaps.init())
				.pipe(gulpIf(/\.less$/, gulpLess({
					paths: [__dirname + '/css']
				})))
				.pipe(gulpConcat('compiled.css'))
				.pipe(gulpAutoprefixer())
				.pipe(gulpIf(options.minify, gulpCssNano()))
				.pipe(gulpSourcemaps.write()));
		});
	};

	var getPaths = function(){
		return get().then(function(css){
			if (!css)
				return [];
			return ['/styles.' + md5(css) + '.css'];
		});
	};

	return {
		middleware: function(req, res, next){
			if (!req.path.match(/^\/styles\..+\.css$/))
				return next();
			res.type('text/css');
			res.set('Expires', expires());
			get().then(function(generatedCss){
				res.send(generatedCss);
			}).then(null, function(err){
				next(err);
			});
		},
		paths: getPaths,
		modifyHtml: function($, env){
			return getPaths().then(function(paths){
				return paths.map(function(path){
					return $('<link>').attr('rel', 'stylesheet').attr('href', path);
				});
			}).then(env.appendToHead);
		}
	};
};
