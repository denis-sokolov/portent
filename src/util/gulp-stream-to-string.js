'use strict';

var Promise = require('promise');

module.exports = function(stream){
	// stream-to-promise did not work, don't know why,
	// did not bother to figure out.
	return new Promise(function(resolve, reject){
		var files = [];
		stream.on('data', function(file){
			files.push(file);
		});
		stream.on('end', function(){
			if (files.length === 0)
				return resolve('');
			if (files.length > 1)
				return reject(new Error('Internal error, too many files after concat'));
			resolve(files[0].contents);
		});
		stream.on('error', reject);
	});
};
