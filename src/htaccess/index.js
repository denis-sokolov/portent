'use strict';

var fs = require('fs');

var Promise = require('promise');

var read = Promise.denodeify(fs.readFile);

module.exports = function(directory){
	return {
		middleware: function(req, res, next){
			if (req.path !== '/.htaccess')
				return next();

			read(__dirname + '/htaccess', 'utf8').then(function(core){
				return read(directory + '/htaccess', 'utf8').catch(function(err){
					if (err.code === 'ENOENT')
						return "";
					throw err;
				}).then(function(custom){
					res.set('Content-Type', 'application/octet-stream');
					res.send(core + '\n' + custom);
				});
			}).catch(next);
		},
		paths: function(){
			return ['.htaccess'];
		}
	};
};
