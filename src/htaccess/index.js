'use strict';

module.exports = function(){
	return {
		middleware: function(req, res, next){
			if (req.path !== '/.htaccess')
				return next();
			res.sendFile(__dirname + '/htaccess');
		},
		paths: function(){
			return ['/.htaccess'];
		}
	};
};
