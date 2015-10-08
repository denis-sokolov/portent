'use strict';

var express = require('express');

var renderFactory = require('./render');

module.exports = function(directory, plugins){
	var app = express();
	var render = renderFactory(directory, plugins);

	plugins.forEach(function(plugin){
		if (plugin.middleware)
			app.use(plugin.middleware);
	});

	app.get(/.*/, function(req, res, next) {
		if (req.path.indexOf('/_') > -1)
			return next();
		render(req, res, req.path, next);
	});

	app.use(function(req, res, next) {
		res.status(404);
		render.error(req, res, 404, next);
	});

	return app;
};
