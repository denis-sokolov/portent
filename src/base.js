'use strict';

module.exports = function(){
	return {
		modifyHtml: function(req, $){
			if ($('base').length === 0) {
				var tag = $('<base>');
				if ($('head').length)
					$('head').append(tag);
				else if ($('title').length)
					$('title').after(tag);
				else $.root().append(tag);
			}
			var url = req.protocol + '://' + req.headers.host + '/';
			$('base').attr('href', url);
		}
	};
};
