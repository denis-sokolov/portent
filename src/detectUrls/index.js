'use strict';

var getFiles = require('../util/get-files');

module.exports = function(projectDirectory){
	var pagesDirectory = projectDirectory + '/pages';
	return getFiles(pagesDirectory, ['html']).then(function(paths){
		return paths
			// Make paths relative to /pages
			.map(function(path){ return path.substring(pagesDirectory.length); })

			// Remove .html extension
			.map(function(path){ return path.substring(0, path.length - 5); });
	});
};
