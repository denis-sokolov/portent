'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var gulpConcat = require('gulp-concat');
var gulpIf = require('gulp-if');
var gulpSourcemaps = require('gulp-sourcemaps');
var gulpUglify = require('gulp-uglify');
var md5 = require('md5');
var sortStream = require('sort-stream2');

var expires = require('./util/expires');
var gulpStreamToString = require('./util/gulp-stream-to-string');
var getFiles = require('./util/get-files');

module.exports = function(directory){
	var get = function(){
		var jsDirectories = [directory + '/js'];
		return getFiles(jsDirectories, ['js']).then(function(files){
			var through2 = require('through2');
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

	var getPaths = function(){
		return get().then(function(js){
			return ['/scripts.' + md5(js) + '.js'];
		});
	};

	return {
		middleware: function(req, res, next){
			if (!req.path.match(/^\/scripts\..+\.js$/))
				return next();
			res.type('application/javascript');
			res.set('Expires', expires());
			get().then(function(generatedJs){
				res.send(generatedJs);
			}).then(null, next);
		},
		paths: getPaths,
		modifyHtml: function(req, $){
			return getPaths().then(function(paths){
				return paths.map(function(path){
					return $('<script>').attr('src', path);
				});
			}).then(function(tags){
				if ($('body').length > 0)
					$('body').append(tags);
				else if ($('html').length > 0)
					$('html').append(tags);
				else {
					$.root().append(tags);
				}
			});
		}
	};
};
