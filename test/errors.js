'use strict';

var test = require('./lib');

test('uses code 404 for 404 page', '/404', {
	build: false,
	status: 404,
	contains: 'Sample 404'
});
