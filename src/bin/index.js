#!/usr/bin/env node
'use strict';
/* eslint no-console: 0 */

var argparse = require('argparse');

var portent = require('..');

var deploy = require('./deploy');

var argparser = new argparse.ArgumentParser({
	description: 'Simple best-practices static website generator'
});
var subparsers = argparser.addSubparsers({title: 'Command', dest: 'command'});

var run = subparsers.addParser('run');
run.addArgument(['directory'], {action: 'store', help: 'Directory of your website files'});
run.addArgument(['--port'], {action: 'store', help: 'Port to listen on', defaultValue: 50213});

var build = subparsers.addParser('build');
build.addArgument(['directory'], {action: 'store', help: 'Directory of your website files'});
build.addArgument(['--dest'], {action: 'store', help: 'Destination to place build files'});

var deployParser = subparsers.addParser('deploy');
deployParser.addArgument(['directory'], {action: 'store', help: 'Directory with your built files'});
deployParser.addArgument(['destination'], {action: 'store',
	help: 'Destination where to deploy. Similar to rsync format: hostname:path/to/dir'});

var args = argparser.parseArgs();

if (args.command === 'run') {
	portent(args.directory).server.listen(args.port);
	console.log('Development server listening on port ' + args.port + '...');
}

if (args.command === 'build') {
	if (!args.dest)
		args.dest = args.directory + '/build';
	portent(args.directory).build(args.dest, {
		onWarning: warning => console.log('Warning!', warning)
	}).then(function(){
		console.log('Build completed.');
	}, function(err){
		console.log('Portent error');
		console.log(err.message);
	});
}

if (args.command === 'deploy') {
	deploy(args.directory, args.destination).then(null, function(err){
		console.log('Failed', err.message);
	});
}
