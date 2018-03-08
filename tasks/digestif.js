/*
 * grunt-digestif
 * https://github.com/oranj/digestif
 *
 * Copyright (c) 2014 Ray Minge
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
	'use strict';

	var fs = require('fs');

	grunt.registerMultiTask('digestif', 'Creates a heirarchical digest of a folder using AMD for uncompiled library loading.', function() {

		var outputFilePath = this.data.path + '/' + this.target + ".js";

		let digestif = new Digestif( this.data, this.target );
		var str = digestif.build();

		removeFile(outputFilePath);

		grunt.log.writeln("Writing file:" + outputFilePath);
		grunt.verbose.writeln(str);

		writeFile(outputFilePath, str);
	});

	grunt.registerTask('digestif-clean', "Removes the digest file", function(target) {
		var data = grunt.config('digestif')[target],
			outputFilePath = data.path + '/' + target + ".js";

		removeFile(outputFilePath);
	});

	function Digestif( config, target ) {
		if ( config.ignore === undefined ) {
			config.ignore = [];
		}
		if ( config.loadLibraries === undefined ) {
			config.loadLibraries = [];
		}
		config.ignore.push( target );

		this.build = function() {
			return 'define(function( require ) {\n\t"use strict";\n\treturn {' +
				buildRecursive( config.path, config.prefix, "\n\t\t" ) +
				'\n\t};\n});\n';
		};

		function getPathContents( path ) {
			let contents = fs.readdirSync( path );
			let dirs = [];
			let modName;
			let stats;
			let files = [];
			for( let i = 0; i < contents.length; i++ ) {
				if ( contents[ i ].charAt( 0 ) == '.' ) {
					continue; // skip hidden
				}
				stats = fs.statSync( path + '/' + contents[ i ]);
				if ( stats.isDirectory() ) {
					dirs.push( contents[ i ] );
				} else if ( modName = contents[ i ].match(/^(.*?)\.js$/)) {
					files.push( modName[ 1 ]);
				}
			}
			return { dirs, files };
		}

		function buildLoadLibraries( pathPrefix ) {
			var parts = [];
			for (var i = 0; i < config.loadLibraries.length; i++) {
				argName = 'require( "' + config.loadLibraries[i] + '" )';
				libName = config.loadLibraries[i].split('/').pop();
				parts.push( pathPrefix + libName + ":" + argName );
			}
			return parts.join(',');
		}

		function buildLoadFiles( files, defNamePrefix, pathPrefix ) {
			var parts = [];
			var argName;
			for ( var i = 0; i < files.length; i++ ) {
				if ( config.ignore.indexOf( files[ i ]) >= 0 ) {
					grunt.verbose.writeln("Skipping file: " + pathPrefix + '/' + files[i]);
					continue;
				}
				parts.push( pathPrefix + files[i] + ":" + 'require( "' + defNamePrefix + "/" + files[i] + '" )' );
			}
			return parts.join(',');
		}

		function buildRecursive( path, defNamePrefix, pathPrefix, depth = 1 ) {
			let contents = fs.readdirSync(path);
			let parts = [];
			let i;


			if ( depth === 1 && config.loadLibraries.length > 0 ) {
				parts.push( buildLoadLibraries( pathPrefix ) );
			}

			let { dirs, files } = getPathContents( path );

			if ( files.length > 0 ) {
				parts.push( buildLoadFiles( files, defNamePrefix, pathPrefix ));
			}

			for (i = 0; i < dirs.length; i++) {
				parts.push( pathPrefix + dirs[i] + ": {" + buildRecursive(path + "/" + dirs[i], defNamePrefix + "/" + dirs[i], pathPrefix + "\t", depth++) + pathPrefix + '}' );
			}
			return parts.filter(function( v ) { return !!v; }).join(',');
		}
	}


	function removeFile(fileName) {
		if (fs.existsSync(fileName)) {
			grunt.log.writeln("Removing file:" + fileName);
			fs.unlinkSync(fileName);
		}
	};

	function writeFile(fileName, contents) {
		fs.writeFileSync(fileName, contents);
	};

};
