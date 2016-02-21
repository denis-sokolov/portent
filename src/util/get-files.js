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

var extensionsGlob = function(extensions){
	if (!extensions || extensions.length === 0)
		return '';
	if (typeof extensions === 'string')
		return '.' + extensions;
	// {foo} in glob does not match "foo"
	if (extensions.length === 1)
		return '.' + extensions[0];
	return '.{' + extensions.join(',') + '}';
};

module.exports = function(directories, extensions, opts){
	opts = opts || {};
	if (typeof directories === 'string')
		directories = [directories];
	return Promise.all(directories.map(function(directory){
		return Promise.denodeify(glob)(directory + '/**/*' + extensionsGlob(extensions), {
			nodir: true
		});
	})).then(function(filesDeep){
		return Array.prototype.concat.apply([], filesDeep);
	}).then(function(files){
		return files.filter(function(file){
			if (opts.include && !opts.include.exec(file))
				return false;
			if (opts.exclude && opts.exclude.exec(file))
				return false;
			if (file.indexOf('/../') > -1)
				throw new Error('Internal assertion error, found /../ in a path: ' + file);
			var isIgnored = _.some(directories, function(directory){
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
