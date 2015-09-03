'use strict';

var fs = require('fs');

var portent = require('../../..');

var tmpEnv = require('./tmpEnv');

module.exports = function(fixtureDir){
	var diskEnv = tmpEnv();
	return portent(fixtureDir).build(diskEnv.dest).then(function(){
		var request = function(requestPath) {
			return new Promise(function(resolve){
				var filepath = diskEnv.dest + '/' + requestPath +
				(requestPath.substring(requestPath.length - 1) === '/' ? 'index' : '');

				var contents;
				try {
					contents = fs.readFileSync(filepath, 'utf-8');
				} catch (err) {
					try {
						contents = fs.readFileSync(filepath + '.html', 'utf-8');
					} catch (err2) {
						return resolve({
							text: '',
							code: 404
						});
					}
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
