'use strict';

var lib = require('./lib');

var test = function(name, imagePath, imageType, staticPath, staticType){
	lib(name.replace('file', 'image'), imagePath, {type: imageType});
	lib(name, staticPath, {type: staticType});
};

test('includes a simple file',
	'/img/siluette-tree.jpg', 'image/jpeg',
	'/static/hi.txt', 'text/plain');

test('includes a file deeper in the tree',
	'/img/deeper/pamukkale-terraces.jpg', 'image/jpeg',
	'/static/deeper/sample.mp4', 'video/mp4');

test('includes an image with a space',
	'/img/circle maze.jpg', 'image/jpeg',
	'/static/with a space.txt', 'text/plain');
