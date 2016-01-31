'use strict';

var test = require('./lib');

test('simple html', '/robots.txt', {
	contains: 'Hi, robots!',
	type: 'text/plain'
});
