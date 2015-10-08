'use strict';

module.exports = {
	paths: function(directory){
		return [
			__dirname,
			directory + '/pages'
		];
	},

	file: function(path){
		if (path.substr(path.length - 1) === '/')
			path += 'index';

		// Remove leading slash
		path = path.substring(1);

		path += '.html';

		return path;
	}
};
