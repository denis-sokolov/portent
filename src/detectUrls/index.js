'use strict';

var walkdir = require('../util/walkdir');

module.exports = function(projectDirectory){
	var pagesDirectory = projectDirectory + '/pages';
	return walkdir(pagesDirectory).then(function(files){
		return files
			// Make paths relative to /pages
			.map(function(path){ return path.substring(pagesDirectory.length); })

			// Skip _pages
			.filter(function(path){ return path.indexOf('/_') === -1; })

			// Skip non html files
			.filter(function(path){ return path.match(/\.html$/); })

			// Remove .html extension
			.map(function(path){ return path.substring(0, path.length - 5); });
	});
};
