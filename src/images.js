'use strict';

var getFiles = require('./util/get-files');

var extensions = [
	'jpg', 'jpeg',
	'png', 'webp',
	'svg', 'cgm',
	'gif'
];

module.exports = function(directory){
	return {
		middleware: function(req, res, next){
			if (!req.path.match(/^\/img\//))
				return next();
			var filepath = directory + decodeURIComponent(req.path);
			getFiles(directory + '/img', extensions).then(function(files){
				if (files.indexOf(filepath) === -1)
					return next();
				res.sendFile(filepath);
			});
		},
		paths: function(){
			return getFiles(directory + '/img', extensions).then(function(files){
				return files.map(function(file){
					return file.substring(directory.length);
				});
			});
		}
	};
};
