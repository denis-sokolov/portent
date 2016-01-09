'use strict';

module.exports = function(){
	return {
		modifyHtml: function($, env){
			if ($('base').length === 0) {
				var tag = $('<base>');
				if ($('head').length)
					$('head').append(tag);
				else if ($('title').length)
					$('title').after(tag);
				else $.root().append(tag);
			}
			var url = env.req.protocol + '://' + env.req.headers.host + '/';
			$('base').attr('href', url);
		}
	};
};
