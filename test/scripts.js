'use strict';

var lib = require('./lib');

var getJs = function(env){
	return env.request('/').then(function(res){
		return env.request(res.$('script').eq(0).attr('src'));
	}).then(function(res){
		env.test.equal(res.code, 200, 'js is served');
		if (res.type)
			env.test.equal(res.type, 'application/javascript', 'js is served with a correct type');
		return res.text;
	});
};

var test = function(name, check, opts){
	lib('JS ' + name, function(env){
		return getJs(env).then(function(js){
			return check(env.test, js);
		});
	}, opts);
};

var simple = function(name, stringToSearch){
	return test(name, function(t, js){
		t.ok(js.indexOf(stringToSearch) > -1, 'contains string');
	});
};

simple('JS is combined and served', 'Hello, world!');
simple('CommonJS is combined and served', 'Inside a submodule!');
simple('Licenses are preserved', '@license something');
test('Simple modules should not be browserified', function(t, js){
	t.equal(js.indexOf('window.a&&a()'), 0, 'begins with a pure script');
});
test('files are sorted by name', function(t, js){
	t.ok(js.indexOf('window.a&&a()') < js.indexOf('I am jQuery'), 'order 1');
	t.ok(js.indexOf('I am jQuery') < js.indexOf('Inside a submodule!'), 'order 2');
	t.ok(js.indexOf('Inside a submodule!') < js.indexOf('Hello, world!'), 'order 3');
});


test('JS is minified in build', function(t, js){
	t.equal(js.indexOf('just a comment'), -1, 'does not have a comment inside');
}, { server: false });
test('JS is not minified in dev', function(t, js){
	t.ok(js.indexOf('just a comment') > -1, 'does have a comment inside');
}, { build: false });

lib('JS has far away Expires header', function(env){
	return env.request('/').then(function(res){
		return env.request(res.$('script').attr('src'));
	}).then(function(res){
		lib.hasExpires(env.test, res.response);
	});
}, {build: false});


test('it adds library code', function(t, js){
	t.ok(js.indexOf('This is a library') > -1, 'contains string');
});

test('it adds second library code', function(t, js){
	t.ok(js.indexOf('This is a second library') > -1, 'contains string');
});
