'use strict';

var extend = require('util')._extend;

var lib = require('./lib');

var test = function(name, opts){
	lib(name + ' on server 404', '/-nonexisting', extend({
		build: false,
		status: 404
	}, opts));
	lib(name + ' on built 404', '/.404', extend({
		server: false,
		status: 'any'
	}, opts));
};

test('uses code 404 for 404 page', {
	contains: 'Sample 404'
});

test('does not use a regular page for 404 page', {
	fixture: 'mixup',
	canBeDefault: true,
	doesNotContain: 'A regular page'
});

test('pads 404 error for IE friendly errors', {
	fixture: 'short',
	bodyLengthAtLeast: 512
});
