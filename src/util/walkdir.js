'use strict';

var Promise = require('promise');
var walkdir = require('walkdir');

module.exports = function(directory){
	return new Promise(function(resolve, reject){
		var ee = walkdir(directory);

		var files = [];

		ee.on('file', function(path){
			files.push(path);
		});

		ee.on('error', function(path, error){
			reject(error);
		});

		ee.on('fail', function(path, error){
			reject(error);
		});

		ee.on('end', function(){
			resolve(files);
		});
	});
};
