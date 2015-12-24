'use strict';

var test = require('./lib');

/* eslint no-process-env: 0 */
if (process.env.TRAVIS) {
	// Does not work on Travis
	// The unicode feature is not fully supported in portent.
	test.skip('simple unicode');
} else {
	test('simple unicode', '/абжы-ąčšž', {
		contains: '<p>Добрый день!</p>'
	});
}
