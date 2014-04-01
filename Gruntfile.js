module.exports = function(grunt) {

    // config
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        // https://github.com/gruntjs/grunt-contrib-jshint
        jshint: {
            options: {
                jshintrc: true
            },
            grunt: {
                src: 'Gruntfile.js'
            },
            karma: {
                src: 'karma.conf.js'
            },
            source: {
                src: 'src/**/*.js'
            },
            unit: {
                src: 'test/unit/**/*.js'
            }
        },

        // https://github.com/brandonramirez/grunt-jsonlint
        jsonlint: {
            bower: {
                src: 'bower.json'
            },
            jshintrc: {
                src: '.jshintrc'
            },
            pkg: {
                src: 'package.json'
            }
        },

        // https://github.com/karma-runner/grunt-karma
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },

        // https://github.com/gruntjs/grunt-contrib-watch
        watch: {
            // js files
            grunt: {
                files: '<%= jshint.grunt.src %>',
                tasks: 'jshint:grunt'
            },
            karma: {
                files: '<%= jshint.karma.src %>',
                tasks: 'jshint:karma'
            },
            source: {
                files: '<%= jshint.source.src %>',
                tasks: ['jshint:source', 'karma:unit']
            },
            unit: {
                files: '<%= jshint.unit.src %>',
                tasks: ['jshint:unit', 'karma:unit']
            },
            // json files
            bower: {
                files: '<%= jsonlint.bower.src %>',
                tasks: 'jsonlint:bower'
            },
            jshintrc: {
                files: '<%= jsonlint.jshintrc.src %>',
                tasks: 'jsonlint:jshintrc'
            },
            pkg: {
                files: '<%= jsonlint.pkg.src %>',
                tasks: 'jsonlint:pkg'
            }
        }

    });

    // plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jsonlint');
    grunt.loadNpmTasks('grunt-karma');

    // tasks
    grunt.registerTask('default', 'watch');
    grunt.registerTask('test', ['jsonlint', 'jshint', 'karma']);

};
