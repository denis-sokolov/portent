'use strict';

var childProcess = require('child_process');
var fs = require('fs');

var Promise = require('promise');

module.exports = function(directory, destination){
	directory += (directory.endsWith('/') ? '' : '/');
	destination += (destination.endsWith('/') ? '' : '/');

	return Promise.denodeify(fs.stat)(directory)
		.then(function(stats){
			if (!stats.isDirectory())
				throw new Error('Directory to deploy does not seem to exist, point to build/.');
		}, function(error){
			if (error.code === 'ENOENT')
				throw new Error('Directory to deploy does not seem to exist, point to build/.');
			throw error;
		}).then(function(){ return new Promise(function(resolve, reject){
			var rsync = childProcess.spawn('rsync', [
				'--recursive',
				'--delete',
				'--progress',
				directory,
				destination
			], { stdio: [0, 1, 2] });
			rsync.on('close', function(code){
				if (code === 0)
					return resolve();
				reject(new Error('rsync failed'));
			});
		}); });
};
