'use strict';

var minifier = require('html-minifier');

module.exports = function(html, minify){
	return minifier.minify(html, {
		removeComments: minify,
		ignoreCustomComments: [
			/^!/,
			/@license\b/
		],

		// These options are untested
		removeCommentsFromCDATA: true,
		removeCDATASectionsFromCDATA: true,
		collapseWhitespace: minify,
		conservativeCollapse: true,
		collapseInlineTagWhitespace: true,
		preserveLineBreaks: true,
		collapseBooleanAttributes: true,
		removeAttributeQuotes: true,
		removeRedundantAttributes: true,
		useShortDoctype: true,
		removeEmptyAttributes: true,
		removeScriptTypeAttributes: true,
		removeStyleLinkTypeAttributes: true,
		removeOptionalTags: true
	});
};
