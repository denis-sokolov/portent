'use strict';

var test = require('./lib');

// On different operating systems the actual file on disk might be normalized differently
// depending on system behavior and git precomposeunicode.
test('normalized NFC request is served', '/абжы-ąčšž', {
	contains: '<p>Добрый день!</p>'
});
test('normalized NFD request is served', '/абжы-ąčšž', {
	contains: '<p>Добрый день!</p>'
});
