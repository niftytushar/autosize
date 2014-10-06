var pkg = require('./package.json');
var fs = require('fs');
var ugly = require("uglify-js");
var jshint = require("jshint").JSHINT;

function syncBower() {
	// Sync package.json properties with bower.json
	var bower = {
		name: pkg.config.bowerName,
		description: pkg.description,
		version: pkg.version,
		dependencies: pkg.dependencies,
		keywords: pkg.keywords,
		authors: [pkg.author],
		licenses: pkg.licenses,
		homepage: pkg.homepage,
		main: 'dest/'+pkg.config.fileName+'.js'
	};
	fs.writeFile('bower.json', JSON.stringify(bower, null, '\t'));
	return true;
}

function syncManifest() {
	// Sync package.json properties with jQuery plugins manifest
	var manifest = {
		name: pkg.config.jqueryName,
		title: pkg.title,
		description: pkg.description,
		version: pkg.version,
		dependencies: pkg.dependencies,
		keywords: pkg.keywords,
		author: pkg.author,
		licenses: pkg.licenses,
		homepage: pkg.homepage,
		demo: pkg.homepage
	};
	fs.writeFile(pkg.config.jqueryName+'.jquery.json', JSON.stringify(manifest, null, '\t'));
	return true;
}

function build(full) {
	var mini = ugly.minify(full, {fromString: true}).code;
	var header = [
		"/*!",
		"	"+pkg.title+" "+pkg.version,
		"	license: MIT",
		"	"+pkg.homepage,
		"*/",
		""
	].join("\n");

	fs.writeFile('dest/'+pkg.config.fileName+'.js', header+full);
	fs.writeFile('dest/'+pkg.config.fileName+'.min.js', header+mini);

	return true;
}

function lint(full) {
	jshint(full.toString(), {
		browser: true,
		undef: true,
		unused: true,
		immed: true,
		eqeqeq: true,
		eqnull: true,
		noarg: true,
		predef: ['define', 'require']
	});

	if (jshint.errors.length) {
		jshint.errors.forEach(function (err) {
			console.log(err.line+':'+err.character+' '+err.reason);
		});
	} else {
		return true;
	}
}

fs.readFile('src/'+pkg.config.fileName+'.js', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  } else {
  	lint(data) && build(data) && syncBower() && syncManifest();
  }
});