'use strict';

var getFiles = require('./util/get-files');

var extensions = [
	'jpg', 'jpeg',
	'png', 'webp',
	'svg', 'cgm',
	'gif'
];

module.exports = function(directory){
	var filesPromise = getFiles(directory + '/img', extensions);

	return {
		middleware: function(req, res, next){
			if (!req.path.match(/^\/img\//))
				return next();
			var filepath = directory + req.path;
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
