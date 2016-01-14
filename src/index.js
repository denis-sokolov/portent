'use strict';

var fs = require('fs');

var base = require('./base');
var build = require('./build');
var favicon = require('./favicon');
var htaccess = require('./htaccess');
var images = require('./images');
var pages = require('./pages');
var scripts = require('./scripts');
var selfLinks = require('./self-links');
var server = require('./server');
var statics = require('./statics');
var stylesheets = require('./stylesheets');


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
			scripts(directory, { minify: true }),
			stylesheets(directory, { minify: true }),
			statics(directory),
			selfLinks(),
			htaccess()
		]
	};

	plugins.server.push(pages(directory, plugins.server));
	plugins.build.push(pages(directory, plugins.build, {
		minify: true
	}));

	return {
		build: build(server, directory, plugins.build),
		server: server(directory, plugins.server)
	};
};
