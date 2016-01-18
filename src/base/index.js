'use strict';

var api = {};

api.addBase = function(){
	return {
		modifyHtml: function($, env){
			if ($('base').length === 0) {
				var tag = $('<base>');
				env.appendToHead(tag);
			}
			var url = env.req.protocol + '://' + env.req.headers.host + '/';
			$('base').attr('href', url);
		}
	};
};

api.warnAboutMissingBase = function(onWarning){
	return {
		modifyHtml: function($){
			if ($('base').length === 0) {
				onWarning('Missing <base>.');
			}
		}
	};
};

module.exports = api;
