'use strict';

var getFiles = require('../util/get-files');

var renderFactory = require('./render');
var templatesFactory = require('./templates');

module.exports = function(projectDirectory, plugins, opts){
	opts = opts || {};
	var templates = templatesFactory(projectDirectory);
	var render = renderFactory(templates, plugins);

	var pagesDirectory = projectDirectory + '/pages';
	var pages = getFiles(pagesDirectory, ['html']).then(function(paths){
		return paths
			// Make paths relative to /pages
			.map(function(path){ return path.substring(pagesDirectory.length); })

			// Remove .html extension
			.map(function(path){ return path.substring(0, path.length - 5); });
	}).then(function(paths){
		return paths.map(function(path){
			return path.replace(/\/index$/, '/');
		});
	});

	var send = function(res){
		return function(html){
			// Allegedly there may be cases where IE disregards
			// the meta tag on non-standard ports, which is exactly where
			// development happens.
			res.set('X-UA-Compatible', 'IE=edge');

			res.send(html);
		};
	};

	var fail = function(next){
		return function(err){
			if (err.templateNotFound)
				return next();
			next(err);
		};
	};

	return {
		middlewares: [
			function(req, res, next){
				var path = decodeURI(req.path);
				if (path.indexOf('/_') > -1)
					return next();
				render(req, decodeURI(req.path))
					.then(send(res), fail(next));
			},
			function(req, res, next){
				var path = decodeURI(req.path);
				if (!path.match(/^\/\.\d{3}$/))
					return next();
				render.error(req, path.substr(2))
					.then(send(res), fail(next));
			},
			function(req, res, next){
				res.status(404);
				render.error(req, 404)
					.then(send(res), fail(next));
			}
		],
		paths: function(){
			return Promise.all([
				templates.errorAvailable(404),
				pages
			]).then(function(res){
				var isError404Available = res[0];
				var foundPages = res[1];
				if (isError404Available)
					return ['/.404'].concat(foundPages);
				return foundPages;
			});
		}
	};
};
