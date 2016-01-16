'use strict';

var test = require('./lib');

test('simple html', '/', {
	contains: '<p>Hello, world!</p>'
});

test('portent/base works and has a title', '/', {
	contains: '<title>Fixture page</title>'
});

test('other pages work', '/about', {
	contains: '<p>About us</p>'
});

test('does not return _ pages', '/_base', 404);

test('subdir index works', '/subdir/', {
	contains: 'Subdirectory index'
});

test('index is not accessible as index', '/index', {
	build: false,
	status: 404
});
