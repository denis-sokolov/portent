'use strict';

var fs = require('fs');

var Promise = require('promise');

module.exports = function(directory){
	var path = directory + '/robots.txt';

	return {
		middleware: function(req, res, next){
			if (req.path !== '/robots.txt')
				return next();
			res.sendFile(path);
		},
		paths: function(){
			return Promise.denodeify(fs.readFile)(path)
				.then(function(){
					return ['robots.txt'];
				})
				.catch(function(){
					return [];
				});
		}
	};
};
