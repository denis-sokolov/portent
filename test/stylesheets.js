'use strict';

var lib = require('./lib');

var getCss = function(env){
	return env.request('/').then(function(res){
		return env.request(res.$('[rel="stylesheet"]').attr('href'));
	}).then(function(res){
		env.test.equal(res.code, 200, 'css is served');
		if (res.type)
			env.test.equal(res.type, 'text/css', 'css is served with a correct type');
		return res.text;
	});
};

var test = function(name, check){
	lib('CSS ' + name, function(env){
		return getCss(env).then(function(css){
			return check(env.test, css);
		});
	});
};

var simple = function(name, stringToSearch){
	return test(name, function(t, css){
		t.ok(css.indexOf(stringToSearch) > -1);
	});
};

var negative = function(name, stringToNotFind){
	return test(name, function(t, css){
		t.equal(css.indexOf(stringToNotFind), -1);
	});
};

simple('CSS is combined and served', 'margin-bottom');
simple('compiles LESS', 'color: red');
negative('ignores _ prefixed files', 'color: brown');
negative('ignores _ prefixed directories', 'underscored-directory: true');
simple('includes LESS sourcemaps', 'sourceMappingURL');
simple('does not parse non-LESS files', 'no-less-here: @see');
negative('does not include non-LESS and non-CSS files', 'Custom-information');
simple('autoprefixes', ':-webkit-full-screen');
simple('includes predefined LESS', 'resize: vertical');

lib('CSS has far away Expires header', function(env){
	return env.request('/').then(function(res){
		return env.request(res.$('[rel="stylesheet"]').attr('href'));
	}).then(function(res){
		lib.hasExpires(env.test, res.response);
	});
}, {build: false});

test('only imports LESS with an explicit import, not always', function(t, css){
	t.ok(css.indexOf('padding-top: 13') < css.indexOf('resize: vertical'),
		'does not prepend base LESS');
	t.ok(css.indexOf('resize: vertical') < css.indexOf('color: red'),
		'does not append base LESS');
});

lib('injects the <link> tag not in <title>', '/title', {
	contains: '<title>Document</title>'
});
