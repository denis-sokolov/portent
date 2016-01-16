'use strict';

module.exports = function(){
	return {
		modifyHtml: function($, env){
			var current = decodeURIComponent(env.req.url.substr(1));
			$('a').filter(function(){
				return $(this).attr('href').localeCompare(current) === 0;
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
