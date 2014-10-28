/**
 * Created by Ivan_Kauryshchanka on 10/28/2014.
 */
module.exports = function(grunt) {
    // config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            carconfig: {
                src: [
                    'src/js/carconfig/_intro',
                    'src/js/carconfig/polyfills.js',
                    'src/js/carconfig/constructor.js',
                    'src/js/carconfig/proto.js',
                    'src/js/carconfig/template.js',

                    'src/js/carconfig/util/ClientKeyGenerator.js',
                    'src/js/carconfig/util/PrintEmailTemplate.js',

                    'src/js/carconfig/ui/View.js',
                    'src/js/carconfig/ui/Validator.js',
                    'src/js/carconfig/ui/Tooltip.js',               /* @deprecated */
                    'src/js/carconfig/ui/form/Button.js',           /* @deprecated */

                    'src/js/carconfig/ui/form/TextField.js',
                    'src/js/carconfig/ui/form/PhoneFieldGroup.js',
                    'src/js/carconfig/ui/form/VehicleForm.js',

                    'src/js/carconfig/ui/ConfigLeadForm.js',
                    'src/js/carconfig/ui/VehicleDetails.js',
                    'src/js/carconfig/ui/VehiclePhotos.js',
                    'src/js/carconfig/ui/VehiclePrice.js',

                    'src/js/carconfig/ui/MessageDialog.js',


                    /* Common Views */
                    'src/js/carconfig/view/Tooltip.js',

                    /* Form Views */
                    'src/js/carconfig/view/form/Button.js',
                    'src/js/carconfig/view/form/ZipField.js',
                    'src/js/carconfig/view/form/MiField.js',
                    'src/js/carconfig/view/form/ZipUpdate.js',
                    'src/js/carconfig/view/form/ZipLocation.js',
                    'src/js/carconfig/view/form/ZipMiField.js',

                    'src/js/carconfig/view/IncentivesAndRebates.js',

                    /* Features */

                    // models
                    'src/js/carconfig/model/Feature.js',
                    'src/js/carconfig/model/feature/Color.js',
                    'src/js/carconfig/model/feature/Option.js',
                    // collections
                    'src/js/carconfig/collection/Features.js',
                    // views
                    'src/js/carconfig/view/features/Category.js',
                    'src/js/carconfig/view/features/category/ColorCategory.js',
                    'src/js/carconfig/view/features/Categories.js',
                    'src/js/carconfig/view/features/ListItem.js',
                    'src/js/carconfig/view/features/List.js',
                    'src/js/carconfig/view/features/SelectedListItem.js',
                    'src/js/carconfig/view/features/SelectedList.js',
                    'src/js/carconfig/view/features/SelectedFeatures.js',
                    'src/js/carconfig/view/features/Notification.js',
                    'src/js/carconfig/view/features/CategoryList.js',
                    // controllers
                    'src/js/carconfig/controller/VehicleFeatures.js',

                    /* Dealers */

                    // models
                    'src/js/carconfig/model/dealers/SearchCriteria.js',
                    'src/js/carconfig/model/dealers/Dealer.js',
                    // collections
                    'src/js/carconfig/collection/Dealers.js',
                    // views
                    'src/js/carconfig/view/dealers/ListItem.js',
                    'src/js/carconfig/view/dealers/List.js',
                    'src/js/carconfig/view/Dealers.js',

                    /* outro */
                    'src/js/carconfig/_outro'
                ],
                dest: 'public/js/carconfig/carconfig.js'
            }
        },

        less: {
            // carconfig
            'carconfig-simple-light': {
                src: ['src/less/carconfig/themes/simple-light.less'],
                options: {
                    compress: true,
                    yuicompress: true
                },
                dest: 'public/css/carconfig/simple-light.css'
            },
            'carconfig-simple-dark': {
                src: ['src/less/carconfig/themes/simple-dark.less'],
                options: {
                    compress: true,
                    yuicompress: true
                },
                dest: 'public/css/carconfig/simple-dark.css'
            },
            'carconfig-green-light': {
                src: ['src/less/carconfig/themes/green-light.less'],
                options: {
                    compress: true,
                    yuicompress: true
                },
                dest: 'public/css/carconfig/green-light.css'
            },
            'carconfig-green-dark': {
                src: ['src/less/carconfig/themes/green-dark.less'],
                options: {
                    compress: true,
                    yuicompress: true
                },
                dest: 'public/css/carconfig/green-dark.css'
            },
            'carconfig-red-light': {
                src: ['src/less/carconfig/themes/red-light.less'],
                options: {
                    compress: true,
                    yuicompress: true
                },
                dest: 'public/css/carconfig/red-light.css'
            },
            'carconfig-red-dark': {
                src: ['src/less/carconfig/themes/red-dark.less'],
                options: {
                    compress: true,
                    yuicompress: true
                },
                dest: 'public/css/carconfig/red-dark.css'
            }
        },

        jshint: {
            carconfig: {
                src: 'src/js/carconfig/**/*.js',
                options: {}
            }
        },

        watch: {
            carconfig: {
                files: ['src/js/carconfig/**/*.js', 'src/less/carconfig/**/*.less'],
                //tasks: ['jshint:carconfig', 'concat:carconfig']
                tasks: ['build:carconfig']
            }
        },

        uglify: {
            carconfig: {
                files: {
                    'public/js/carconfig/carconfig.min.js': 'public/js/carconfig/carconfig.js'
                }
            }
        },

        build: {
            carconfig: [
                'jshint:carconfig',
                'concat:carconfig',
                'uglify:carconfig',
                'less:carconfig-simple-light',
                'less:carconfig-simple-dark',
                'less:carconfig-green-light',
                'less:carconfig-green-dark',
                'less:carconfig-red-light',
                'less:carconfig-red-dark',
                'requirejs:build'
            ]
        },

        requirejs: {
            build: {
                options: {
                    name: 'app',
                    baseUrl: 'src/js/carconfig/',
                    mainConfigFile: 'src/js/carconfig/config.js',
                    out: 'edmunds/widgets/nvc/dist/js/nvc.min.js',
                    skipModuleInsertion: true
                }
            }
        }

    });

    // plugins
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    // tasks
    grunt.registerTask('default', 'watch');

    grunt.registerMultiTask('build', 'Build task', function() {
        grunt.task.run(this.data);
    });

};
