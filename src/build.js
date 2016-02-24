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

var rootRelativeUrlCheck = function(urls){
	var bad = urls.filter(u => u[0] === '/');
	if (bad.length)
		throw new Error(
			'Some plugins have provided root-relative URLs. ' +
			'This is incorrect, and it also suggests you may have these URLs in your modifyHtml function. ' +
			'Here are the URLs: ' +
			bad.join(', ') + '.'
		);
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
			rootRelativeUrlCheck(urls);
			return streamEndToPromise(streamCombiner(
				frozen(app, { urls: urls.map(u => '/' + u) }),
				gulp.dest(destinationDirectory)
			));
		});
	};
};
