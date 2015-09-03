'use strict';

var cheerio = require('cheerio');
var nunjucks = require('nunjucks');
var express = require('express');
var Promise = require('promise');

var templates = require('./templates');

module.exports = function(directory, plugins){
	var app = express();

	nunjucks.configure(templates.paths(directory), {
		express: app,
		noCache: true
	});

	plugins.forEach(function(plugin){
		if (plugin.middleware)
			app.use(plugin.middleware);
	});

	app.get(/.*/, function(req, res, next) {
		if (req.path.indexOf('/_') > -1)
			return next();

		// Allegedly there may be cases where IE disregards
		// the meta tag on non-standard ports, which is exactly where
		// development happens.
		res.set('X-UA-Compatible', 'IE=edge');

		Promise.denodeify(res.render.bind(res))(templates.file(req.path))
			.then(function(html){
				return cheerio.load(html);
			}).then(function($){
				return Promise.all(plugins.map(function(plugin){
					if (plugin.modifyHtml)
						return plugin.modifyHtml(req, $);
				})).then(function(){
					return $.html();
				});
			}).then(res.send.bind(res), function(err){
				if (err.message.indexOf('not found') > -1)
					return next();
				next();
			});
	});

	return app;
};
