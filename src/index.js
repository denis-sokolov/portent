'use strict';

var fs = require('fs');

var base = require('./base');
var build = require('./build');
var favicon = require('./favicon');
var htaccess = require('./htaccess');
var images = require('./images');
var pages = require('./pages');
var robots = require('./robots');
var scripts = require('./scripts');
var selfLinks = require('./self-links');
var server = require('./server');
var statics = require('./statics');
var stylesheets = require('./stylesheets');


module.exports = function(directory){
	// Ensure the code works with symlinks and ../ in the path
	directory = fs.realpathSync(directory);

	return {
		build: function(destinationDirectory, opts){
			opts = opts || {};
			opts.onWarning = opts.onWarning || function(){};

			var plugins = [
				images(directory),
				favicon(directory + '/img/favicon.png'),
				scripts(directory),
				stylesheets(directory, { minify: true }),
				robots(directory),
				statics(directory),
				selfLinks(),
				base.warnAboutMissingBase(opts.onWarning),
				htaccess(directory)
			];
			plugins.push(pages(directory, plugins, {
				minify: true
			}));

			return build(server, directory, plugins)(destinationDirectory);
		},
		server: (function(){
			var plugins = [
				images(directory),
				favicon(directory + '/img/favicon.png'),
				scripts(directory, { debug: true }),
				stylesheets(directory, { sourcemaps: true }),
				robots(directory),
				statics(directory),
				base.addBase(),
				selfLinks()
			];
			plugins.push(pages(directory, plugins));
			return server(directory, plugins);
		})()
	};
};
