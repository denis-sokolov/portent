'use strict';

var fs = require('fs');

var Promise = require('promise');

module.exports = function(imgpath){
	var fileExists = function(){
		return Promise.denodeify(fs.stat)(imgpath)
			.then(() => true)
			.then(null, function(error){
				if (error.code === 'ENOENT')
					return false;
				throw error;
			});
	};

	return {
		middleware: function(req, res, next){
			if (req.path !== '/favicon.png')
				return next();
			fileExists()
				.then(function(exists){
					if (exists)
						return res.sendFile(imgpath);
					next();
				})
				.then(null, next);
		},
		paths: function(){
			return fileExists()
				.then(exists => exists ? ['/favicon.png'] : []);
		},
		modifyHtml: function($){
			return fileExists()
				.then(function(exists){
					if (exists && $('link[rel="icon"]').length === 0) {
						var tag = $('<link rel=icon>').attr('href', 'favicon.png');
						if ($('head').length)
							$('head').append(tag);
						else if ($('title').length)
							$('title').after(tag);
						else $.root().append(tag);
					}
				});
		}
	};
};
