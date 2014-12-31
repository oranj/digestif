/*
 * grunt-digestif
 * https://github.com/oranj/digestif
 *
 * Copyright (c) 2014 Ray Minge
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
	'use strict';

	grunt.registerMultiTask('digestif', 'Creates a heirarchical digest of a folder using AMD for uncompiled library loading.', function() {

		var path = this.data.path,
			outputName = this.target,
			postLoadLibraries = this.data.loadLibraries || [],
			skipFiles = this.data.ignore || [],
			prefix = this.data.prefix,
			outputFilePath = path + '/' + outputName + ".js";

		removeFile(outputFilePath);

		argIndex = 0;
		functionDefines = [];
		bodyString = "\treturn {";
		functionArgs = [];
		digestRecursive(path, prefix, "\n\t\t", postLoadLibraries, skipFiles);
		bodyString += "\n\t};";

		var str = "define([\""+functionDefines.join("\",\"")+"\"], function("+functionArgs.join(",")+"){\n\t\"use strict\";\n"+bodyString+"\n});\n";

		grunt.log.writeln("Writing file:" + outputFilePath);
		grunt.verbose.writeln(str);

		writeFile(outputFilePath, str);
	});


	grunt.registerTask('digestif-clean', "Removes the digest file", function(target) {

		var data = grunt.config('digestif')[target],
			outputFilePath = data.path + '/' + target + ".js";

		removeFile(outputFilePath);
	});


	var fs = require('fs'),
		argIndex,
		functionArgs,
		functionDefines,
		bodyString, digestRecursive, removeFile, writeFile, digest;

	digestRecursive = function(path, defNamePrefix, pathPrefix, postLoadLibraries, skipFiles) {
		var contents = fs.readdirSync(path),
			libName, modName, count = 0, argName,
			i, fullPath, packagePath, stats, dirs = [], files = [];

		for (i = 0; i < contents.length; i++) {
			if (contents[i].charAt(0) == '.') {
				continue;
			}
			stats = fs.statSync(path + '/' + contents[i]);
			if (stats.isDirectory()) {
				dirs.push(contents[i]);
			} else if (modName = contents[i].match(/^(.*?)\.js$/)) {
				files.push(modName[1]);
			}
		}

		for (i = 0; i < files.length; i++) {
			if (skipFiles.indexOf(files[i]) >= 0) {
				grunt.verbose.writeln("Skipping file: " + path + '/' + files[i]);
				continue;
			}
			if (count > 0) {
				bodyString += ",";
			}
			argName = "a"+String(argIndex);
			functionArgs.push(argName),
			functionDefines.push(defNamePrefix + "/" + files[i]);
			bodyString += pathPrefix + files[i] + ":"+argName;
			argIndex++;
			count ++;
		}
		for (i = 0; i < dirs.length; i++) {
			if (count > 0) {
				bodyString += ",";
			}
			bodyString += pathPrefix + dirs[i] + ": {";
			digestRecursive(path + "/" + dirs[i], defNamePrefix + "/" + dirs[i], pathPrefix + "\t", [], skipFiles);
			bodyString += pathPrefix + "}";
			count++;
		}

		for (var i = 0; i < postLoadLibraries.length; i++) {
			if (count > 0) {
				bodyString += ",";
			}

			argName = "a" +String(argIndex);
			libName = postLoadLibraries[i].split('/');
			libName = libName[libName.length - 1];
			functionArgs.push(argName);
			functionDefines.push(postLoadLibraries[i]);
			bodyString += pathPrefix + libName + ":" + argName;
			argIndex++;
			count++;
		}
	};

	removeFile = function(fileName) {
		if (fs.existsSync(fileName)) {
			grunt.log.writeln("Removing file:" + fileName);
			fs.unlinkSync(fileName);
		}
	};

	writeFile = function(fileName, contents) {
		fs.writeFileSync(fileName, contents);
	};

};
