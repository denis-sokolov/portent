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
var fileExists = require('./util/exists');
var gulpStreamToString = require('./util/gulp-stream-to-string');
var getFiles = require('./util/get-files');

module.exports = function(directory, options){
	options = options || {};
	options.minify = Boolean(options.minify);
	options.sourcemaps = Boolean(options.sourcemaps);

	var get = function(getOpts){
		getOpts = getOpts || {};
		var getFilesOptions = {};
		if (getOpts.ie) {
			getFilesOptions.include = new RegExp('\\.ie' + getOpts.ie + '\\.[a-z]+$');
		} else {
			getFilesOptions.exclude = new RegExp('\\.ie\\d\\.[a-z]+$');
		}
		return getFiles(
			[directory + '/css'],
			['less', 'css'],
			getFilesOptions
		).then(function(files){
			var resources = [];
			return gulpStreamToString(gulp.src(files)
				.pipe(gulpIf(options.sourcemaps, gulpSourcemaps.init()))
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
				.pipe(gulpIf(options.sourcemaps, gulpSourcemaps.write()))
			)
				.then(function(css){
					return {
						css: css,
						resources: resources
					};
				});
		});
	};

	var getAll = function(){
		return Promise.all([get(), get({ ie: 8 }), get({ ie: 9 })]).then(function(r){
			var common = r[0];
			var ie8 = r[1];
			var ie9 = r[1];
			return {
				css: common.css,
				ie8: ie8.css,
				ie9: ie9.css,
				resources: common.resources.concat(ie8.resources).concat(ie9.resources)
			};
		});
	};

	var cssPath = function(css, opts){
		opts = opts || {};
		return '/css/styles.' + (opts.ie ? 'ie' + opts.ie + '.' : '') + md5(css) + '.css';
	};

	return {
		middleware: function(req, res, next){
			var send = function(promise){
				res.type('text/css');
				res.set('Expires', expires());
				promise.then(function(generatedResult){
					res.send(generatedResult.css);
				}).then(null, function(err){
					next(err);
				});
			};

			if (req.path.match(/^\/css\/styles\.ie8\..+\.css$/)) {
				return send(get({ ie: 8 }));
			}

			if (req.path.match(/^\/css\/styles\.ie9\..+\.css$/)) {
				return send(get({ ie: 9 }));
			}

			if (req.path.match(/^\/css\/styles\..+\.css$/)) {
				return send(get());
			}

			if (req.path.match(/^\/css\//)) {
				return res.sendFile(directory + req.path);
			}

			next();
		},
		paths: function(){
			return getAll().then(function(res){
				return Promise.all(
					res.resources
						.map(path => '/css/' + path)
						.map(path =>
							fileExists(directory + path)
								.then(exists => exists ? path : null))
				).then(function(paths){
					return paths
						.filter(p => p)
						.concat(res.css ? cssPath(res.css) : [])
						.concat(res.ie8 ? cssPath(res.ie8, { ie: 8 }) : [])
						.concat(res.ie9 ? cssPath(res.ie9, { ie: 9 }) : []);
				});
			});
		},
		modifyHtml: function($, env){
			return getAll().then(function(result){
				if (!result.css)
					return;
				env.appendToHead(
					'<!--[if IE 8]><link rel=stylesheet href="' +
					cssPath(result.ie8, { ie: 8 }) +
					'"><![endif]-->');
				env.appendToHead(
					'<!--[if IE 9]><link rel=stylesheet href="' +
					cssPath(result.ie9, { ie: 9 }) +
					'"><![endif]-->');
				return env.appendToHead($('<link>')
					.attr('rel', 'stylesheet')
					.attr('href', cssPath(result.css))
				);
			});
		}
	};
};
