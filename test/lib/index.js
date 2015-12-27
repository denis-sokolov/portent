'use strict';

var assert = require('assert');
var fs = require('fs');

var _ = require('lodash');
var cheerio = require('cheerio');
var memoize = require('memoizee');
var tape = require('tape');

var buildEnv = require('./buildEnv');
var serverEnv = require('./serverEnv');

// The path includes "/../" and a directory is named with an underscore
// to make sure these things do not interfere with the code behavior.
// In other words, it's part of the test.
var fixturesDir = __dirname + '/../_fixtures';

var fixturesIgnoredInBuild = ['invalid-import'];

var fixtures = _.object(fs.readdirSync(fixturesDir).map(function(name){
	var dir = fixturesDir + '/' + name;
	return [name, {
		server: serverEnv(dir).then(memoize),
		build: fixturesIgnoredInBuild.indexOf(name) === -1 ? buildEnv(dir).then(memoize) : null
	}];
}));

var api = function(name, testPath, opts){
	if (typeof testPath === 'string') {
		opts = opts || {};
		if (opts === 404) opts = {status: 404};
		opts.status = opts.status || 200;
		opts.type = opts.type || 'text/html';
		return api(name, function(env){
			return env.request(testPath).then(function(res){
				if (opts.status && opts.status !== 'any')
					env.test.equal(res.code, opts.status, 'correct status code');
				if (res.type)
					env.test.equal(res.type, opts.type, 'correct type');
				if (opts.type === 'text/html' && res.headers && !opts.canBeDefault)
					env.test.equal(res.headers['x-ua-compatible'], 'IE=edge', 'Has IE header');
				if (opts.assert)
					env.test.ok(opts.assert(res.$), 'custom check passes');
				if (opts.bodyLengthAtLeast)
					env.test.ok(res.text.length >= opts.bodyLengthAtLeast, 'body of correct length');
				if (opts.contains)
					env.test.ok(res.text.indexOf(opts.contains) > -1, 'contains correct body');
				if (opts.doesNotContain)
					env.test.equal(res.text.indexOf(opts.doesNotContain), -1, 'contains correct body');
			});
		}, opts);
	}

	assert.equal(typeof testPath, 'function');
	opts = opts || {};
	opts.fixture = opts.fixture || 'main';
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
			return commonTest(fixtures[opts.fixture].server, t, callback);
		});

	if (opts.build)
		tape(name + ' (build)', function(t){
			return commonTest(fixtures[opts.fixture].build, t, callback);
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

module.exports = api;
