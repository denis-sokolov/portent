'use strict';

var fs = require('fs');
var Promise = require('promise');

var portent = require('../../..');

var tmpEnv = require('./tmpEnv');

var isHtmlRequest = function(path){
	return path.indexOf('.') === -1 ||
		path.match(/\/\.\d{3}$/);
};

module.exports = function(fixtureDir){
	var diskEnv = tmpEnv();
	var warnings = [];
	return portent(fixtureDir).build(diskEnv.dest, {
		onWarning: function(warning){
			warnings.push(warning);
		}
	}).then(function(){
		var request = function(requestPath) {
			return new Promise(function(resolve){
				var filepath = diskEnv.dest + '/' + requestPath +
				(requestPath.substring(requestPath.length - 1) === '/' ? 'index' : '') +

				// This is a cheap way to distinguish whether we need .html
				// Semantically this information belongs in individual tests,
				// but our naming pattern is clear and this allows for simpler test cases.
				// This also has no effect on production.
				(isHtmlRequest(requestPath) ? '.html' : '');

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

		request.warnings = warnings;

		return request;
	});
};
