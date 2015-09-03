'use strict';

var test = require('./lib');

test('includes a simple file', '/static/hi.txt', {
	type: 'text/plain'
});
test('includes a simple file deeper in the tree', '/static/deeper/sample.mp4', {
	type: 'video/mp4'
});
test('includes a simple file with a space', '/static/with a space.txt', {
	type: 'text/plain'
});
