'use strict';

var test = require('./lib');

test('removes comments in html in build', '/comments', {
	doesNotContain: 'evil',
	server: false
});

test('does not remove comments in html in dev', '/comments', {
	contains: 'evil',
	build: false
});
