'use strict';

var minifier = require('html-minifier');

module.exports = function(html, removeComments){
	return minifier.minify(html, {
		removeComments: removeComments,
		ignoreCustomComments: [
			/@license\b/
		]
	});
};
