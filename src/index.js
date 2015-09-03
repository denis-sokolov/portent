'use strict';

var fs = require('fs');

var frozen = require('frozen-express');
var gulp = require('gulp');
var streamCombiner = require('stream-combiner');
var streamToPromise = require('stream-to-promise');

var detectUrls = require('./detectUrls');
var base = require('./base');
var images = require('./images');
var scripts = require('./scripts');
var server = require('./server');
var statics = require('./statics');
var stylesheets = require('./stylesheets');

module.exports = function(directory){
	// Ensure the code works with symlinks and ../ in the path
	directory = fs.realpathSync(directory);

	var plugins = {
		server: [
			images(directory),
			scripts(directory),
			stylesheets(directory),
			statics(directory),
			base()
		],
		build: [
			images(directory),
			scripts(directory),
			stylesheets(directory),
			statics(directory)
		]
	};

	return {
		build: function(destinationDirectory){
			var app = server(directory, plugins.build);

			return Promise.all(plugins.build.map(function(plugin){
				if (plugin.paths)
					return plugin.paths();
			}).concat(detectUrls(directory))).then(function(deepUrls){
				var urls = [].concat.apply([], deepUrls);
				return streamToPromise(streamCombiner(
					frozen(app, { urls: urls }),
					gulp.dest(destinationDirectory)
				));
			});
		},
		server: server(directory, plugins.server)
	};
};
