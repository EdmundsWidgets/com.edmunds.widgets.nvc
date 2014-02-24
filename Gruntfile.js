module.exports = function(grunt) {
    'use strict';

    // config
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        dir: {
            build: 'dist/'
        },

        // https://github.com/gruntjs/grunt-contrib-clean
        clean: {
            build: ['<%= dir.build %>']
        },

        // https://github.com/gruntjs/grunt-contrib-copy
        copy: {
            build: {
                files: [
                    { expand: true, src: ['img/**', 'less/**/*.less'], dest: '<%= dir.build %>/' }
                ]
            }
        },

        // https://github.com/karma-runner/grunt-karma
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        }

    });

    // plugins
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-karma');

    // tasks
    grunt.registerTask('test', [
        'karma:unit'
    ]);

    grunt.registerTask('build', [
        'clean:build',
        'copy:build'
    ]);

};
