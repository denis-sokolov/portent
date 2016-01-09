'use strict';

var test = require('./lib');

test('removes comments in html in build', '/comments', {
	doesNotContain: 'evil',
	server: false
});

test('does not remove important comments in html', '/comments', {
	contains: 'license',
	server: false
});

test('does not remove comments with @license in html', '/comments', {
	contains: '@license Something',
	server: false
});

test('does not remove comments in html in dev', '/comments', {
	contains: 'evil',
	build: false
});
