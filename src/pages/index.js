'use strict';

var minify = require('./minify');
var renderFactory = require('./render');
var templatesFactory = require('./templates');

module.exports = function(projectDirectory, plugins, options){
	options = options || {}
	options.removeComments = Boolean(options.removeComments)

	var templates = templatesFactory(projectDirectory);
	var render = renderFactory(templates, plugins);

	var send = function(res){
		return function(html){
			html = minify(html, options.removeComments);

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
				templates.errors(),
				templates.pages()
			]).then(function(res){
				var foundErrors = res[0].map(code => '/.' + code);
				var foundPages = res[1];
				return foundErrors.concat(foundPages);
			});
		}
	};
};
