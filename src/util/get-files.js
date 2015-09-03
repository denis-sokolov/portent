'use strict';

var _ = require('lodash');
var glob = require('glob');
var Promise = require('promise');

var sortCallback = function(directories){
	var directoryIndex = function(filepath){
		return _.findIndex(directories, function(directory){
			return filepath.indexOf(directory) === 0;
		});
	};

	return function(a, b){
		if (directoryIndex(a) !== directoryIndex(b))
			return directoryIndex(a) - directoryIndex(b);
		if (a.split('/').length !== b.split('/').length)
			return b.split('/').length - a.split('/').length;
		return a.localeCompare(b);
	};
};

module.exports = function(directories, extensions){
	if (typeof directories === 'string')
		directories = [directories];
	if (typeof extensions === 'string')
		extensions = [extensions];

	return Promise.all(directories.map(function(directory){
		// {foo} in glob does not match "foo"
		var extensionsGlob = extensions.length > 1 ? '{' + extensions.join(',') + '}' : extensions[0];
		return Promise.denodeify(glob)(directory + '/**/*.' + extensionsGlob);
	})).then(function(filesDeep){
		return Array.prototype.concat.apply([], filesDeep);
	}).then(function(files){
		return files.filter(function(file){
			if (file.indexOf('/../') > -1)
				throw new Error('Internal assertion error, found /../ in a path: ' + file);
			var isIgnored = _.any(directories, function(directory){
				if (file.indexOf(directory) === 0)
					if (file.substring(directory.length).indexOf('/_') > -1)
						return true;
			});
			if (isIgnored)
					return false;
			return true;
		});
	}).then(function(files){
		files.sort(sortCallback(directories));
		return files;
	});
};

module.exports.sort = sortCallback;
