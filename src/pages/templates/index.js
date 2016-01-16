'use strict';

var fs = require('fs');
var path = require('path');

var Promise = require('promise');

var getFiles = require('../../util/get-files');

var filepath = function(p){
	// Remove leading slash
	p = p.substring(1);

	p += '.html';

	return p;
};

var scanDirAndIgnoreMissing = function(directoryPath){
	return Promise.denodeify(fs.readdir)(directoryPath)
		.then(null, function(error){
			if (error.code === 'ENOENT')
				return [];
			throw error;
		});
};

module.exports = function(directory){
	var pagesDirectory = directory + '/pages';
	var dirs = [__dirname, pagesDirectory];
	var errorDirectory = path.join(directory, 'errors');

	var getAllErrorTemplates = function(){
		return scanDirAndIgnoreMissing(errorDirectory)
			.then(function(listing){
				return listing
					.filter(name => name.match(/^\d{3}\.html/))
					.map(name => Number(name.substr(0, 3)));
			});
	};

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

		errors: getAllErrorTemplates,

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
