'use strict';

var fileExists = require('./util/exists');

module.exports = function(imgpath){
	return {
		middleware: function(req, res, next){
			if (req.path !== '/favicon.png')
				return next();
			fileExists(imgpath)
				.then(function(exists){
					if (exists)
						return res.sendFile(imgpath);
					next();
				})
				.then(null, next);
		},
		paths: function(){
			return fileExists(imgpath)
				.then(exists => exists ? ['/favicon.png'] : []);
		},
		modifyHtml: function($, env){
			return fileExists(imgpath)
				.then(function(exists){
					if (exists && $('link[rel="icon"]').length === 0) {
						var tag = $('<link rel=icon>').attr('href', 'favicon.png');
						env.appendToHead(tag);
					}
				});
		}
	};
};
