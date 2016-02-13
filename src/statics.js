'use strict';

var getFiles = require('./util/get-files');

module.exports = function(directory){
	return {
		middleware: function(req, res, next){
			if (!req.path.match(/^\/static\//))
				return next();
			var filepath = directory + decodeURIComponent(req.path);
			getFiles(directory + '/static').then(function(files){
				if (files.indexOf(filepath) === -1)
					return next();
				res.sendFile(filepath);
			});
		},
		paths: function(){
			return getFiles(directory + '/static').then(function(files){
				return files.map(function(file){
					return file.substring(directory.length);
				});
			});
		}
	};
};
