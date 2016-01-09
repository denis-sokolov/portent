'use strict';

var frozen = require('frozen-express');
var gulp = require('gulp');
var Promise = require('promise');
var streamCombiner = require('stream-combiner');

var streamEndToPromise = function(stream){
	return new Promise(function(resolve, reject){
		stream.on('end', function(){ resolve(); });
		stream.on('error', reject);
	});
};

module.exports = function(server, directory, plugins){
	var app = server(directory, plugins);

	var paths = plugins.map(function(plugin){
		if (plugin.paths)
			return plugin.paths();
	}).filter(function(x){ return x; });

	return function(destinationDirectory){
		return Promise.all(paths).then(function(deepUrls){
			var urls = [].concat.apply([], deepUrls);
			return streamEndToPromise(streamCombiner(
				frozen(app, { urls: urls }),
				gulp.dest(destinationDirectory)
			));
		});
	};
};
