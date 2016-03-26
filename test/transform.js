'use strict';

var test = require('./lib');

test('transform', '/about', {
	contains: 'transform success',
	fixture: 'transform'
});
