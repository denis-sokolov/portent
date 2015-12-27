'use strict';

var test = require('./lib');

test('throws a proper error when a template import is invalid', '/', {
	status: 500,
	canBeDefault: true,
	build: false,
	fixture: 'invalid-import',
	contains: 'nonexisting.html',
	doesNotContain: 'Cannot GET'
});
