'use strict';

var Fs = require('fs');

function tsc2Grunt(tsConfig) {
	var tscOptions = tsConfig.compilerOptions;

	// convert outDir option to Grunt-ts style options
	var gruntTSC = { options: tscOptions };
	if (tscOptions.outDir != null) {
		gruntTSC.files = {};
		gruntTSC.files[tscOptions.outDir] = tsConfig.files;
	} else {
		gruntTSC.src = tsConfig.files;
	}

	return gruntTSC;
}

module.exports = function (grunt) {

	var outDir = "dist/";
	grunt.log.debug("Output folder: " + outDir);

	grunt.log.debug('Read tsconfig.json from current project directory!');
	var tsConfig = grunt.file.readJSON('tsconfig.json');

	if (tsConfig.compilerOptions.outDir) {
		grunt.log.debug('[outDir] in tsconfig.json is ignored, use: ' + outDir);
		tsConfig.compilerOptions.outDir = outDir;
	}

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		ts: {
			default: tsc2Grunt(tsConfig)
		},

		less: {
			dev: {
				options: {
					paths: ['public/stylesheets']
				}
			},
			prod: {
				options: {
					paths: ['public/stylesheets'],
					compress: true
				}
			}
		},

		copy: {
			default: {
				files: [
					{
						expand: true,
						src: [
							"**",
							"!node_modules/**",
							"!" + outDir + "**"
						],
						dest: outDir,
						filter: 'isFile'
					}
				]
			}
		}
	});

	grunt.loadNpmTasks("grunt-ts");
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask("default", ["ts:default", "less:dev", "copy:default"]);
	grunt.registerTask("prod", ["ts:default", "less:prod", "copy:default"]);
}