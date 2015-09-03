'use strict';

var test = require('./lib');

test('includes a simple image', '/img/siluette-tree.jpg', {
	type: 'image/jpeg'
});
test('includes an image deeper in the tree', '/img/deeper/pamukkale-terraces.jpg', {
	type: 'image/jpeg'
});
