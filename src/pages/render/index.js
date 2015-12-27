'use strict';

var fs = require('fs');

var cheerio = require('cheerio');
var Promise = require('promise');
var nunjucks = require('nunjucks');

var renderNunjucks = function(dirs, requestPath){
	// Attempt to distinguish errors
	var clarifyError = function(err){
		if (err.message.indexOf('template not found') === -1)
			throw err;

		return Promise.all(dirs.map(function(dir){
			return Promise.denodeify(fs.stat)(dir + '/' + requestPath)
				.then(function(){ return true; }, function(){ return false; });
		})).then(function(results){
			if (results.filter(function(exists){ return exists; }).length > 0)
				throw err;
			err.templateNotFound = true;
			throw err;
		});
	};

	// Uses global state to pass settings.
	// .configure is supposed to return an env with env.render, but that did not work
	nunjucks.configure(dirs, {
		noCache: true
	});
	return Promise.denodeify(nunjucks.render)(requestPath).then(null, clarifyError);
};

module.exports = function(templates, plugins){
	var render = function(dirs, req, requestPath){
		return renderNunjucks(dirs, requestPath)
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
			});
	};

	var api = function(req, requestPath){
		return render(templates.defaultDirs(), req, templates.file(requestPath));
	};

	api.error = function(req, code){
		return templates.errorAvailable(code).then(function(isAvailable){
			if (!isAvailable) {
				var e = new Error('Template errors/' + code + '.html not found');
				e.templateNotFound = true;
				throw e;
			}
			return render(templates.errorDirs(), req, templates.errorPath(code))
				.then(function(html){
					if (html.length < 512) {
						var repeat = function(s, n){ return (new Array(n + 1)).join(s); };
						return html + '<!--!' + repeat('-', 512) + '-->';
					}
					return html;
				});
		});
	};

	return api;
};
