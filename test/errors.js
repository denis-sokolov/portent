'use strict';

var test = require('./lib');

test('uses code 404 for 404 page', '/404', {
	build: false,
	status: 404,
	contains: 'Sample 404'
});

test('uses proper page 404 for building', '/.404', {
	server: false,
	contains: 'Sample 404'
});

test('does not use a regular page for 404 page', '/-nonexisting', {
	build: false,
	fixture: 'mixup',
	status: 404,
	canBeDefault: true,
	doesNotContain: 'A regular page'
});
