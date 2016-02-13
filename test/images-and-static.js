'use strict';

var lib = require('./lib');

var test = function(name, imagePath, imageType, staticPath, staticType){
	lib(name.replace('file', 'image'), imagePath, {type: imageType});
	lib(name, staticPath, {type: staticType});
};

test.negative = function(name, imagePath, staticPath, opts){
	opts.status = 404;
	lib(name.replace('file', 'image'), imagePath, opts);
	lib(name, staticPath, opts);
};


test('includes a simple file',
	'/img/siluette-tree.jpg', 'image/jpeg',
	'/static/hi.txt', 'text/plain');

test('includes a file deeper in the tree',
	'/img/deeper/pamukkale-terraces.jpg', 'image/jpeg',
	'/static/deeper/sample.mp4', 'video/mp4');

test('includes an file with a space',
	'/img/circle maze.jpg', 'image/jpeg',
	'/static/with a space.txt', 'text/plain');

test.negative('respect _ in the file name',
	'/img/_red-phone-box.jpg', '/static/_my-internal-notes.txt', {
		server: false
	});
