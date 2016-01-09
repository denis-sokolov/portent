'use strict';

var test = require('./lib');

test('adds .htaccess in build', '/.htaccess', {
	server: false,
	contains: 'ErrorDocument 404 /.404.html'
});
