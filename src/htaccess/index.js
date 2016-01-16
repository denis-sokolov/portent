'use strict';

module.exports = function(){
	return {
		middleware: function(req, res, next){
			if (req.path !== '/.htaccess')
				return next();
			res.type('application/octet-stream');
			res.send('ErrorDocument 404 /.404.html');
		},
		paths: function(){
			return ['/.htaccess'];
		}
	};
};
