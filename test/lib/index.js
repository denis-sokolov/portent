'use strict';

var assert = require('assert');

var cheerio = require('cheerio');
var memoize = require('memoizee');
var tape = require('tape');

var portent = require('../..');

var buildEnv = require('./buildEnv');
var serverEnv = require('./serverEnv');

// The path includes "/../" and a directory is named with an underscore
// to make sure these things do not interfere with the code behavior.
// In other words, it's part of the test.
var fixtureDir = __dirname + '/../_fixture';

var server = serverEnv(fixtureDir).then(memoize);
var build = buildEnv(fixtureDir).then(memoize);

var api = function(name, testPath, opts){
	if (typeof testPath === 'string') {
		opts = opts || {};
		if (opts === 404) opts = {status: 404};
		opts.status = opts.status || 200;
		opts.type = opts.type || 'text/html';
		return api(name, function(env){
			return env.request(testPath).then(function(res){
				if (opts.status)
					env.test.equal(res.code, opts.status, 'correct status code');
				if (res.type)
					env.test.equal(res.type, opts.type, 'correct type');
				if (opts.contains)
					env.test.ok(res.text.indexOf(opts.contains) > -1, 'contains correct body');
				if (opts.doesNotContain)
					env.test.equal(res.text.indexOf(opts.contains), -1, 'contains correct body');
			});
		}, opts);
	}

	assert.equal(typeof testPath, 'function');
	opts = opts || {};
	opts.server = 'server' in opts ? opts.server : true;
	opts.build = 'build' in opts ? opts.build : true;
	var callback = testPath;

	var commonTest = function(requestPromise, t, testCallback){
		return requestPromise.then(function(request){
			var env = {
				request: function(path){
					if (!path)
						throw new Error('Asked to request an empty path');
					return request(path).then(function(res){
						if (res.text)
							res.$ = cheerio.load(res.text);
						return res;
					});
				},
				test: t
			};
			return testCallback(env);
		}).then(t.end, t.end);
	};

	if (opts.server)
		tape(name + ' (server)', function(t){
			return commonTest(server, t, callback);
		});

	if (opts.build)
		tape(name + ' (build)', function(t){
			return commonTest(build, t, callback);
		});
};

api.hasExpires = function(test, response){
	var expiresTimestamp = Date.parse(response.headers.expires);
	test.ok(expiresTimestamp, 'has Expires header');
	if (expiresTimestamp)
		test.ok(
			expiresTimestamp - Date.now() > 300 * 24 * 3600 * 1000,
			'Expires is roughly a year in the future');
};

api.skip = tape.skip;

api.raw = function(name, cb){
	tape(name, function(t){
		cb(t, portent(fixtureDir));
	});
};

module.exports = api;