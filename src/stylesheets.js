'use strict';

var autoprefixer = require('autoprefixer');
var gulp = require('gulp');
var gulpSourcemaps = require('gulp-sourcemaps');
var gulpConcat = require('gulp-concat');
var gulpCssNano = require('gulp-cssnano');
var gulpIf = require('gulp-if');
var gulpLess = require('gulp-less');
var gulpPostcss = require('gulp-postcss');
var md5 = require('md5');
var postcssUrl = require('postcss-url');

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
			var resources = [];
			return gulpStreamToString(gulp.src(files)
				.pipe(gulpSourcemaps.init())
				.pipe(gulpIf(/\.less$/, gulpLess({
					paths: [__dirname + '/css'],
					relativeUrls: true
				})))
				.pipe(gulpPostcss([autoprefixer,
					postcssUrl({
						url: function(url, _decl, _from, filedir){
							if (url.match(/^[a-z]+:/))
								return url;
							// 4 is length of /css/
							var prefix = filedir.slice(directory.length + 5);
							if (prefix) {
								prefix += '/';
							}
							var resourcePath = prefix + url;
							resources.push(resourcePath);
							return resourcePath;
						}
					})
				]))
				.pipe(gulpConcat('compiled.css'))
				.pipe(gulpIf(options.minify, gulpCssNano()))
				.pipe(gulpSourcemaps.write())
			)
				.then(function(css){
					return {
						css: css,
						resources: resources
					};
				});
		});
	};

	var cssPath = function(res){
		return '/css/styles.' + md5(res.css) + '.css';
	};

	return {
		middleware: function(req, res, next){
			if (req.path.match(/^\/css\/styles\..+\.css$/)) {
				res.type('text/css');
				res.set('Expires', expires());
				get().then(function(generatedResult){
					res.send(generatedResult.css);
				}).then(null, function(err){
					next(err);
				});
				return;
			}

			if (req.path.match(/^\/css\//)) {
				get().then(function(generatedResult){
					if (generatedResult.resources.indexOf(req.path.slice(5) > -1))
						return res.sendFile(directory + req.path);
					next();
				}).catch(err => next(err));
				return;
			}

			next();
		},
		paths: function(){
			return get().then(function(res){
				return res.resources
					.map(path => '/css/' + path)
					.concat(res.css ? cssPath(res) : []);
			});
		},
		modifyHtml: function($, env){
			return get().then(function(result){
				if (!result.css)
					return;
				return env.appendToHead($('<link>')
					.attr('rel', 'stylesheet')
					.attr('href', cssPath(result))
				);
			});
		}
	};
};
