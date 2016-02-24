'use strict';

var getFiles = require('./util/get-files');

module.exports = function(directory){
	return {
		middleware: function(req, res, next){
			if (!req.path.match(/^\/static\//))
				return next();
			res.sendFile(directory + decodeURIComponent(req.path));
		},
		paths: function(){
			return getFiles(directory + '/static').then(function(files){
				return files.map(function(file){
					return file.substring(directory.length + 1);
				});
			});
		}
	};
};
