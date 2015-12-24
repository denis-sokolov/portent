'use strict';

var getFiles = require('../util/get-files');

var renderFactory = require('./render');

module.exports = function(projectDirectory, plugins, opts){
	opts = opts || {};
	var render = renderFactory(projectDirectory, plugins);

	var pagesDirectory = projectDirectory + '/pages';
	var pages = getFiles(pagesDirectory, ['html']).then(function(paths){
		return paths
			// Make paths relative to /pages
			.map(function(path){ return path.substring(pagesDirectory.length); })

			// Remove .html extension
			.map(function(path){ return path.substring(0, path.length - 5); });
	}).then(function(paths){
		return paths.concat(['/']);
	});

	return {
		middleware: function(req, res, next){
			var path = decodeURI(req.path);
			pages.then(function(paths){
				if (paths.indexOf(path) > -1)
					return render(req, res, path, next);
				if (opts.serveErrors && path.match(/^\/\.\d{3}$/))
					return render.error(req, res, path.substr(2), next);
				res.status(404);
				render.error(req, res, 404, next);
			}).done();
		},
		paths: function(){
			return Promise.all([
				render.errorAvailable(404),
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
