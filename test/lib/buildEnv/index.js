'use strict';

var fs = require('fs');
var Promise = require('promise');

var portent = require('../../..');

var tmpEnv = require('./tmpEnv');

module.exports = function(fixtureDir){
	var diskEnv = tmpEnv();
	return portent(fixtureDir).build(diskEnv.dest).then(function(){
		var request = function(requestPath) {
			return new Promise(function(resolve){
				var filepath = diskEnv.dest + '/' + requestPath +
				(requestPath.substring(requestPath.length - 1) === '/' ? 'index' : '') +

				// This is a cheap way to distinguish whether we need .html
				// Semantically this information belongs in individual tests,
				// but our naming pattern is clear and this allows for simpler test cases.
				// This also has no effect on production.
				(requestPath.match(/[^\/]\.[a-z0-9]+$/) ? '' : '.html');

				var contents;
				try {
					contents = fs.readFileSync(filepath, 'utf-8');
				} catch (err) {
					return resolve({
						text: '',
						code: 404
					});
				}

				resolve({
					text: contents,
					code: 200
				});
			});
		};

		process.on('beforeExit', diskEnv.cleanup);

		return request;
	});
};
