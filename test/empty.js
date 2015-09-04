'use strict';

var test = require('./lib');

test('does not inject script if no js exists', '/', {
	fixture: 'empty',
	doesNotContain: '<script'
});

test('does not inject styles if no css exists', '/', {
	fixture: 'empty',
	doesNotContain: '<link'
});
