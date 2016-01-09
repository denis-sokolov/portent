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

var test = function(name, check, opts){
	lib('CSS ' + name, function(env){
		return getCss(env).then(function(css){
			return check(env.test, css);
		});
	}, opts);
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
simple('compiles LESS', '#abc');
negative('ignores _ prefixed files', '#def');
negative('ignores _ prefixed directories', 'underscored-directory:');
simple('includes LESS sourcemaps', 'sourceMappingURL');
simple('does not parse non-LESS files', 'no-less-here:');
negative('does not include non-LESS and non-CSS files', 'Custom-information');
simple('autoprefixes', ':-webkit-full-screen');
simple('includes predefined LESS', 'resize:');

lib('CSS has far away Expires header', function(env){
	return env.request('/').then(function(res){
		return env.request(res.$('[rel="stylesheet"]').attr('href'));
	}).then(function(res){
		lib.hasExpires(env.test, res.response);
	});
}, {build: false});

test('only imports LESS with an explicit import, not always', function(t, css){
	t.ok(css.indexOf('padding-top:') < css.indexOf('resize:'),
		'does not prepend base LESS');
	t.ok(css.indexOf('resize:') < css.indexOf('#abc'),
		'does not append base LESS');
});

lib('injects the <link> tag not in <title>', '/title', {
	contains: '<title>Document</title>'
});

test('removes comments in production', function(t, css){
	t.equal(css.indexOf('an inline comment'), -1, 'removes inline coments');
	t.equal(css.indexOf('a multiline comment'), -1, 'removes multiline coments');
}, { server: false });

test('does not remove comments in development', function(t, css){
	// The following is at the moment not applicable,
	// as LESS always removes inline comments itself
	// t.ok(css.indexOf('an inline comment') > -1, 'has inline coments');
	t.ok(css.indexOf('a multiline comment') > -1, 'has multiline coments');
}, { build: false });
