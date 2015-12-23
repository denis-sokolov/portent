'use strict';

var lib = require('./lib');

var getJs = function(env, n){
	n = n || 0;
	return env.request('/').then(function(res){
		return env.request(res.$('script').eq(n).attr('src'));
	}).then(function(res){
		env.test.equal(res.code, 200, 'js is served');
		if (res.type)
			env.test.equal(res.type, 'application/javascript', 'js is served with a correct type');
		return res.text;
	});
};

var test = function(name, opts, check){
	if (!check) {
		check = opts;
		opts = { n: 1 };
	}
	lib('JS ' + name, function(env){
		return getJs(env, opts.n).then(function(js){
			return check(env.test, js);
		});
	});
};

var simple = function(name, stringToSearch){
	return test(name, { n: 1 }, function(t, js){
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


lib('JS has far away Expires header', function(env){
	return env.request('/').then(function(res){
		return env.request(res.$('script').attr('src'));
	}).then(function(res){
		lib.hasExpires(env.test, res.response);
	});
}, {build: false});


test('it adds library code', { n: 0 }, function(t, js){
	t.ok(js.indexOf('This is a library') > -1, 'contains string');
});

test('it adds second library code', { n: 0 }, function(t, js){
	t.ok(js.indexOf('This is a second library') > -1, 'contains string');
});

test('it does not add library code to the main bundle', { n: 1 }, function(t, js){
	t.ok(js.indexOf('This is a library') === -1, 'does not contain');
});

test('it does not add regular code to the library bundle', { n: 0 }, function(t, js){
	t.ok(js.indexOf('Hello, world!') === -1, '');
});
