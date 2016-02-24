'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var gulpConcat = require('gulp-concat');
var gulpIf = require('gulp-if');
var gulpSourcemaps = require('gulp-sourcemaps');
var gulpUglify = require('gulp-uglify');
var md5 = require('md5');
var sortStream = require('sort-stream2');
var through2 = require('through2');

var expires = require('./util/expires');
var gulpStreamToString = require('./util/gulp-stream-to-string');
var getFiles = require('./util/get-files');

module.exports = function(directory, options){
	options = options || {};

	var jsDirectories = [directory + '/js'];

	var get = function(){
		return getFiles(jsDirectories, ['js']).then(function(files){
			return gulpStreamToString(gulp.src(files)
				.pipe(gulpIf(/\.cjs\.js$/, through2.obj(function (file, enc, next){
					return browserify(file.path, {
						debug: options.debug, fullPaths: true
					})
						.bundle(function(err, res){
							if (err) return next(err);
							file.contents = res;
							next(null, file);
						});
					})))
				.pipe(sortStream(function(a, b){
					return getFiles.sort(jsDirectories)(a.path, b.path);
				}))
				.pipe(gulpIf(options.debug, gulpSourcemaps.init({loadMaps: true})))
				.pipe(gulpConcat('compiled.js'))
				.pipe(gulpIf(!options.debug, gulpUglify({preserveComments: 'license'})))
				.pipe(gulpIf(options.debug, gulpSourcemaps.write()))
			);
		});
	};

	var getPaths = function(){
		return get().then(function(code){
			if (!code)
				return [];
			return ['scripts.' + md5(code) + '.js'];
		});
	};

	return {
		middleware: function(req, res, next){
			var send = function(codePromise){
				codePromise.then(function(code){
					res.type('application/javascript');
					res.set('Expires', expires());
					res.send(code);
				}).then(null, next);
			};
			if (req.path.match(/^\/scripts\..+\.js$/))
				return send(get());
			next();
		},
		paths: getPaths,
		modifyHtml: function($, env){
			return getPaths().then(function(paths){
				return paths.map(function(path){
					return $('<script>').attr('src', path);
				});
			}).then(env.appendToBody);
		}
	};
};
