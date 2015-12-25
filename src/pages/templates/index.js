'use strict';

var fs = require('fs');
var path = require('path');

var Promise = require('promise');

var getFiles = require('../../util/get-files');

var filepath = function(p){
	if (p.substr(p.length - 1) === '/')
		p += 'index';

	// Remove leading slash
	p = p.substring(1);

	p += '.html';

	return p;
};

module.exports = function(directory){
	var pagesDirectory = directory + '/pages';
	var dirs = [__dirname, pagesDirectory];
	var errorDirectory = path.join(directory, 'errors');

	return {
		defaultDirs: function(){ return dirs; },

		errorAvailable: function(code){
			var possiblePath = path.join(errorDirectory, String(code) + '.html');
			return Promise.denodeify(fs.stat)(possiblePath)
				.then(function(){ return true; }, function(){ return false; });
		},

		errorDirs: function(){ return [errorDirectory].concat(dirs); },

		errorPath: function(code){
			return filepath('/' + String(code));
		},

		file: filepath,

		pages: function(){
			return getFiles(pagesDirectory, ['html']).then(function(paths){
				return paths
					// Make paths relative to /pages
					.map(function(p){ return p.substring(pagesDirectory.length); })

					// Remove .html extension
					.map(function(p){ return p.substring(0, p.length - 5); });
			}).then(function(paths){
				return paths.map(function(p){
					return p.replace(/\/index$/, '/');
				});
			});
		}
	};
};
