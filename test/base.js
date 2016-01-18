'use strict';

var test = require('./lib');

test('adds <base> in development', '/baseless', {
	build: false,
	contains: '<base href="http://127.0.0.1:'
});

test('rewrites <base> in development', '/', {
	build: false,
	contains: '<base href="http://127.0.0.1:'
});

test('does not leave old <base> in development', '/', {
	build: false,
	doesNotContain: '<base href="http://example.com/'
});

test('keeps <base> in production', '/', {
	server: false,
	contains: '<base href="http://example.com/'
});

test.buildWarning('warns about a missing <base>', 'Missing <base>.');
