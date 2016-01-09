'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var gulpConcat = require('gulp-concat');
var gulpIf = require('gulp-if');
var gulpSourcemaps = require('gulp-sourcemaps');
var gulpUglify = require('gulp-uglify');
var md5 = require('md5');
var sortStream = require('sort-stream2');
var Promise = require('promise');
var through2 = require('through2');

var expires = require('./util/expires');
var gulpStreamToString = require('./util/gulp-stream-to-string');
var getFiles = require('./util/get-files');

module.exports = function(directory){
	var jsDirectories = [directory + '/js'];
	var filesPromise = getFiles(jsDirectories, ['js']);

	var get = function(){
		return filesPromise.then(function(files){
			files = files.filter(function(file){
				return !file.match(/\.min\.js/);
			});
			return gulpStreamToString(gulp.src(files)
				.pipe(gulpIf(/\.cjs\.js$/, through2.obj(function (file, enc, next){
					return browserify(file.path, {
						debug: true, fullPaths: true
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
				.pipe(gulpSourcemaps.init({loadMaps: true}))
				.pipe(gulpConcat('compiled.js'))
				.pipe(gulpUglify({preserveComments: 'license'}))
				.pipe(gulpSourcemaps.write())
			);
		});
	};

	var getLibCode = function(){
		return filesPromise.then(function(files){
			files = files.filter(function(file){
				return file.match(/\.min\.js/);
			});
			return gulpStreamToString(gulp.src(files)
				.pipe(sortStream(function(a, b){
					return getFiles.sort(jsDirectories)(a.path, b.path);
				}))
				.pipe(gulpConcat('compiled.js'))
			);
		});
	};

	var getPaths = function(){
		return Promise.all([get(), getLibCode()]).then(function(codeList){
			var result = [];
			if (codeList[0])
				result.push('/libs.' + md5(codeList[0]) + '.js');
			if (codeList[1])
				result.push('/scripts.' + md5(codeList[1]) + '.js');
			return result;
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
			if (req.path.match(/^\/libs\..+\.js$/))
				return send(getLibCode());
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
