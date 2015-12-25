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

	var f = function(req, requestPath, next){
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
			}).then(null, next);
	};

	var api = function(req, requestPath, next){
		registerDirs(templates.defaultDirs());
		return f(req, templates.file(requestPath), next);
	};

	api.error = function(req, code, next){
		return templates.errorAvailable(code).then(function(isAvailable){
			if (!isAvailable)
				return next();
			registerDirs(templates.errorDirs());
			return f(req, templates.errorPath(code), next);
		}).then(null, next);
	};

	api.errorAvailable = function(code){
		return templates.errorAvailable(code);
	};

	return api;
};
