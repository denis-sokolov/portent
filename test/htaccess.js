'use strict';

var test = require('./lib');

test('adds .htaccess in build', '/.htaccess', {
	server: false,
	contains: 'ErrorDocument 404 /.404'
});

test('adds .htaccess rewriting', '/.htaccess', {
	server: false,
	contains: 'RewriteCond %{REQUEST_FILENAME}.html -f\n'
});

test('adds .htaccess charset', '/.htaccess', {
	server: false,
	contains: 'AddDefaultCharset utf-8\n'
});

test('adds custom .htaccess', '/.htaccess', {
	server: false,
	contains: '# Custom htaccess content\n'
});
