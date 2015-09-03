'use strict';

var test = require('./lib');

test.raw('returns a server', function(t, app){
	t.equal(typeof app.server.listen, 'function');
	t.end();
});

test('simple html', '/', {
	contains: '<p>Hello, world!</p>'
});

test('portent/base works and has a title', '/', {
	contains: '<title>Fixture page</title>'
});

test('other pages work', '/about', {
	contains: '<p>About us</p>'
});

test('does not return _ pages', '/_base', 404);


