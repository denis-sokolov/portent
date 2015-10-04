'use strict';

var path = require('path');

var cheerio = require('cheerio');
var Promise = require('promise');
var nunjucks = require('nunjucks');

var templates = require('./templates');

module.exports = function(app, directory, plugins){
	var defaultDirs = templates.paths(directory);

	var registerDirs = function(paths){
		nunjucks.configure(paths, {
			express: app,
			noCache: true
		});
	};

	var f = function(req, res, requestPath, next){

		// Allegedly there may be cases where IE disregards
		// the meta tag on non-standard ports, which is exactly where
		// development happens.
		res.set('X-UA-Compatible', 'IE=edge');

		return Promise.denodeify(res.render.bind(res))(requestPath)
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
	};

	var api = function(req, res, requestPath, next){
		registerDirs(defaultDirs);
		f(req, res, templates.file(requestPath), next);
	};

	api.error = function(req, res, code, next){
		registerDirs([path.join(directory, 'errors')].concat(defaultDirs));
		f(req, res, templates.file('/' + String(code)), next);
	};

	return api;
};
