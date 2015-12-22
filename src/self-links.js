'use strict';

module.exports = function(){
	return {
		modifyHtml: function(req, $){
			var current = req.url.substr(1);
			$('a').filter(function(){
				return $(this).attr('href') === current;
			}).addClass('self-link').replaceWith(function(){
				var link = $(this);
				'href,target,ping,rel,media,hreflang,type'.split(',').forEach(function(attribute){
					link.attr('data-' + attribute, link.attr(attribute));
					link.removeAttr(attribute);
				});
				return $.html(link)
					.replace(/^<a/, '<span')
					.replace(/<\/a>$/, '</span>');
			});
		}
	};
};
