'use strict';

var cleanup = require('./cleanup');
var renderFactory = require('./render');
var templatesFactory = require('./templates');

module.exports = function(projectDirectory, plugins, options){
	options = options || {};
	options.minify = Boolean(options.minify);

	var templates = templatesFactory(projectDirectory);
	var render = renderFactory(templates, plugins);

	var send = function(res){
		return function(html){
			html = cleanup(html, options.minify);

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
				if (path.match(/\/index$/))
					return next();
				if (path.match(/\/$/))
					path += 'index';
				render(req, path)
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
				templates.errors(),
				templates.pages()
			]).then(function(res){
				var foundErrors = res[0].map(code => '/.' + code);
				var foundPages = res[1];
				return foundErrors.concat(foundPages)
					.map(p => [p.normalize('NFC'), p.normalize('NFD')])
					.reduce((a, b) => a.concat(b));
			});
		}
	};
};
