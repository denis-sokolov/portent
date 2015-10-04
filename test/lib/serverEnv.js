'use strict';

var Promise = require('promise');
var supertest = require('supertest');

var portent = require('../..');

module.exports = function(fixtureDir){
	var server = portent(fixtureDir).server;
	var request = function(requestPath){
		return new Promise(function(resolve, reject){
			supertest(server)
				.get(requestPath)
				.end(function(err, res){
					if (err)
						return reject(err);
					resolve({
						code: res.status,
						headers: res.headers,
						text: res.text,
						response: res,
						type: res.type
					});
				});
		});
	};

	return Promise.resolve(request);
};
