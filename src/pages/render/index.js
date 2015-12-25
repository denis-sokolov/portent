'use strict';

var cheerio = require('cheerio');
var Promise = require('promise');
var nunjucks = require('nunjucks');

module.exports = function(templates, plugins){
	var registerDirs = function(paths){
		nunjucks.configure(paths, {
			noCache: true
		});
	};

	var f = function(req, requestPath){
		return Promise.denodeify(nunjucks.render)(requestPath)
			.then(null, function(err){
				if (err.message.indexOf('template not found') > -1) {
					err.templateNotFound = true;
					throw err;
				}
				throw err;
			}).then(function(html){
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
			});
	};

	var api = function(req, requestPath){
		registerDirs(templates.defaultDirs());
		return f(req, templates.file(requestPath));
	};

	api.error = function(req, code){
		return templates.errorAvailable(code).then(function(isAvailable){
			if (!isAvailable) {
				var e = new Error('Template errors/' + code + '.html not found');
				e.templateNotFound = true;
				throw e;
			}
			registerDirs(templates.errorDirs());
			return f(req, templates.errorPath(code));
		});
	};

	return api;
};
