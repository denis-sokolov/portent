'use strict';

var test = require('./lib');

test('simple unicode', '/абжы-ąčšž', {
	contains: '<p>Добрый день!</p>'
});
