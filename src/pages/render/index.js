'use strict';

var cheerio = require('cheerio');
var Promise = require('promise');
var nunjucks = require('nunjucks');

var templatesFactory = require('./templates');

module.exports = function(directory, plugins){
	var templates = templatesFactory(directory);

	var registerDirs = function(paths){
		nunjucks.configure(paths, {
			noCache: true
		});
	};

	var f = function(req, res, requestPath, next){
		// Allegedly there may be cases where IE disregards
		// the meta tag on non-standard ports, which is exactly where
		// development happens.
		res.set('X-UA-Compatible', 'IE=edge');

		return Promise.denodeify(nunjucks.render)(requestPath)
			.then(function(html){
				return cheerio.load(html, {
					decodeEntities: false
				});
			}).then(function($){
				return Promise.all(plugins.map(function(plugin){
					if (plugin.modifyHtml)
						return plugin.modifyHtml(req, $);
				})).then(function(){
					return $.html();
				});
			}).then(res.send.bind(res), next);
	};

	var api = function(req, res, requestPath, next){
		registerDirs(templates.defaultDirs());
		f(req, res, templates.file(requestPath), next);
	};

	api.error = function(req, res, code, next){
		templates.errorAvailable(code).then(function(isAvailable){
			if (!isAvailable)
				return next();
			registerDirs(templates.errorDirs());
			f(req, res, templates.errorPath(code), next);
		}).then(null, next);
	};

	api.errorAvailable = function(code){
		return templates.errorAvailable(code);
	};

	return api;
};
