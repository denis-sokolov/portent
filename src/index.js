'use strict';

var fs = require('fs');

var frozen = require('frozen-express');
var gulp = require('gulp');
var Promise = require('promise');
var streamCombiner = require('stream-combiner');

var base = require('./base');
var favicon = require('./favicon');
var images = require('./images');
var pages = require('./pages');
var scripts = require('./scripts');
var selfLinks = require('./self-links');
var server = require('./server');
var statics = require('./statics');
var stylesheets = require('./stylesheets');

var streamEndToPromise = function(stream){
	return new Promise(function(resolve, reject){
		stream.on('end', function(){ resolve(); });
		stream.on('error', reject);
	});
};

module.exports = function(directory){
	// Ensure the code works with symlinks and ../ in the path
	directory = fs.realpathSync(directory);

	var plugins = {
		server: [
			images(directory),
			favicon(directory + '/img/favicon.png'),
			scripts(directory),
			stylesheets(directory),
			statics(directory),
			base(),
			selfLinks()
		],
		build: [
			images(directory),
			favicon(directory + '/img/favicon.png'),
			scripts(directory),
			stylesheets(directory, { minify: true }),
			statics(directory),
			selfLinks()
		]
	};

	plugins.server.push(pages(directory, plugins.server));
	plugins.build.push(pages(directory, plugins.build, {
		minify: true
	}));

	return {
		build: function(destinationDirectory){
			var app = server(directory, plugins.build);

			var paths = plugins.build.map(function(plugin){
				if (plugin.paths)
					return plugin.paths();
			}).filter(function(x){ return x; });

			return Promise.all(paths).then(function(deepUrls){
				var urls = [].concat.apply([], deepUrls);
				return streamEndToPromise(streamCombiner(
					frozen(app, { urls: urls }),
					gulp.dest(destinationDirectory)
				));
			});
		},
		server: server(directory, plugins.server)
	};
};
