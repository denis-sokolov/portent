'use strict';

var yearInMs = 365 * 24 * 3600 * 1000;

module.exports = function(){
	return (new Date(Date.now() + yearInMs)).toUTCString();
};
