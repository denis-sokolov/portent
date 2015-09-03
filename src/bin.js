#!/usr/bin/env node
'use strict';
/* eslint no-console: 0 */

var argparse = require('argparse');

var portent = require('.');

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

var args = argparser.parseArgs();

if (args.command === 'run') {
	portent(args.directory).server.listen(args.port);
	console.log('Development server listening on port ' + args.port + '...');
}

if (args.command === 'build') {
	if (!args.dest)
		args.dest = args.directory + '/build';
	portent(args.directory).build(args.dest).then(function(){
		console.log('Build completed.');
	}, function(err){
		console.log('Portent error');
		console.log(err.message);
	});
}
