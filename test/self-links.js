'use strict';

var test = require('./lib');

test('does not destroy all links', '/link', {
	contains: '<a '
});

test('does not include links to itself', '/self-link', {
	doesNotContain: '<a'
});

test('keeps link text', '/self-link', {
	contains: 'Relative link'
});

test('keeps class names', '/self-link', {
	contains: 'foobar'
});

test('marks self links with a class', '/self-link', {
	contains: 'self-link'
});

'href,target,ping,rel,media,hreflang,type'.split(',').forEach(function(attribute){
	test('does not keep attribute ' + attribute + ' on the self-link span', '/self-link', {
		assert: function($){
			return $('span[' + attribute + ']').length === 0;
		}
	});

	test('adds data attribute ' + attribute + ' on the self-link span', '/self-link', {
		assert: function($){
			return $('span[data-' + attribute + ']').length > 0;
		}
	});
});
