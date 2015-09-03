'use strict';

var gulp = require('gulp');
var gulpAutoprefixer = require('gulp-autoprefixer');
var gulpSourcemaps = require('gulp-sourcemaps');
var gulpConcat = require('gulp-concat');
var gulpIf = require('gulp-if');
var gulpLess = require('gulp-less');
var md5 = require('md5');

var expires = require('./util/expires');
var gulpStreamToString = require('./util/gulp-stream-to-string');
var getFiles = require('./util/get-files');

module.exports = function(directory){
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
				.pipe(gulpSourcemaps.write()));
		});
	};

	var hash = function(){ return get().then(md5); };

	var getPaths = function(){
		return hash().then(function(h){
			return ['/styles.' + h + '.css'];
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
		modifyHtml: function(req, $){
			return getPaths().then(function(paths){
				return paths.map(function(path){
					return $('<link>').attr('rel', 'stylesheet').attr('href', path);
				});
			}).then(function(tags){
				if ($('head').length > 0)
					$('head').append(tags);
				else if ($('meta, title').length > 0)
					$('meta, title').last().append(tags);
				else
					$.root().prepend(tags);
			});
		}
	};
};
