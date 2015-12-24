'use strict';

var fs = require('fs');
var path = require('path');

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
			}).then(res.send.bind(res), function(err){
				if (err.message.indexOf('not found') > -1)
					return next();
				next(err);
			});
	};

	var api = function(req, res, requestPath, next){
		registerDirs(templates.defaultDirs());
		f(req, res, templates.file(requestPath), next);
	};

	api.error = function(req, res, code, next){
		var errorTemplateDirectory = path.join(directory, 'errors');
		fs.stat(path.join(errorTemplateDirectory, String(code) + '.html'), function(err){
			if (err)
				return next();
			registerDirs([errorTemplateDirectory].concat(templates.defaultDirs()));
			f(req, res, templates.file('/' + String(code)), next);
		});
	};

	return api;
};
