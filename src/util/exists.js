'use strict';

var fs = require('fs');

var Promise = require('promise');

module.exports = function(path){
	return Promise.denodeify(fs.stat)(path)
		.then(() => true)
		.then(null, function(error){
			if (error.code === 'ENOENT')
				return false;
			throw error;
		});
};
