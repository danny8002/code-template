'use strict';

var Fs = require('fs');

module.exports = function (grunt) {
	
	grunt.log.debug('Read tsconfig.json from current project directory!');
	var tsConfig = grunt.file.readJSON('tsconfig.json');
	
	var cacheFile = '.gruntWatch.cache';
	
	
	var folders = (tsConfig['exclude'] || []).map(function (i) { return '!' + i + '/**/*.ts'; });
	folders.unshift('!**/*.d.ts');
	folders.unshift('**/*.ts');
	
	grunt.log.debug('TypeScript compile folders:' + folders);
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		ts: {
			default: {
				src: tsConfig['files'],
				options: tsConfig['compilerOptions']
			}
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
		}
	});
	
	grunt.loadNpmTasks("grunt-ts");
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	
	grunt.registerTask("default", ["ts", "less:prod"]);
}