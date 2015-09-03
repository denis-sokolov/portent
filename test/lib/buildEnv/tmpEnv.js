'use strict';

var fse = require('fs-extra');
var tmp = require('tmp');

module.exports = function(){
	var dest = tmp.dirSync();
	return {
		dest: dest.name,
		cleanup: function(){
			fse.removeSync(dest.name);
		}
	};
};
