'use strict';

var test = require('./lib');

test('includes a favicon link', '/', {
	contains: 'rel=icon'
});
