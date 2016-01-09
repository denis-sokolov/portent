'use strict';

var lib = require('./lib');

[404, 500].forEach(function(code){
	var test = function(name, opts){
		lib(name, '/.' + code, opts);

		if (code === 404)
			lib(name + ' (on non-specific server 404)', '/-nonexisting', Object.assign({}, opts, {
				build: false,
				status: 404
			}));
	};

	test('uses code ' + code + ' for ' + code + ' page', {
		contains: 'Sample ' + code
	});

	test('does not use a regular page for ' + code + ' page', {
		fixture: 'mixup',
		canBeDefault: true,
		doesNotContain: 'A regular page',
		status: 404
	});

	test('pads ' + code + ' error for IE friendly errors', {
		fixture: 'short',
		bodyLengthAtLeast: 512
	});
});
