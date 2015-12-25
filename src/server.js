'use strict';

var express = require('express');

module.exports = function(directory, plugins){
	var app = express();

	plugins.forEach(function(plugin){
		if (plugin.middleware)
			app.use(plugin.middleware);
		if (plugin.middlewares)
			plugin.middlewares.forEach(function(middleware){
				app.use(middleware);
			});
	});

	return app;
};
