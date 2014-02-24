module.exports = function(grunt) {
    'use strict';

    // config
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        // https://github.com/karma-runner/grunt-karma
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        }

    });

    // plugins
    grunt.loadNpmTasks('grunt-karma');

    // tasks
    grunt.registerTask('test', [
        'karma:unit'
    ]);

};
