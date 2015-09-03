'use strict';

var getFiles = require('./util/get-files');

module.exports = function(directory){
	var filesPromise = getFiles(directory + '/static');

	return {
		middleware: function(req, res, next){
			if (!req.path.match(/^\/static\//))
				return next();
			var filepath = directory + decodeURIComponent(req.path);
			filesPromise.then(function(files){
				if (files.indexOf(filepath) === -1)
					return next();
				res.sendFile(filepath);
			});
		},
		paths: function(){
			return filesPromise.then(function(files){
				return files.map(function(file){
					return file.substring(directory.length);
				});
			});
		}
	};
};
