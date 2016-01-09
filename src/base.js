'use strict';

module.exports = function(){
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
