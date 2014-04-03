(function() {

    var karma = window.__karma__;

    function getSpecFiles(karmaFiles) {
        var files = [],
            reg = /\.spec\.js$/,    // file name should end with '.spec.js'
            file;
        for (file in karmaFiles) {
            if (karmaFiles.hasOwnProperty(file) && reg.test(file)) {
                files.push(file);
            }
        }
        return files;
    }

    requirejs.config({

        // Karma serves files from '/base'
        baseUrl: '/base/src',

        paths: {
            jquery: '../bower_components/jquery/dist/jquery',
            underscore: '../bower_components/underscore/underscore',
            backbone: '../bower_components/backbone/backbone'
        },

        deps: ['backbone']

    });

    // first we need to load Backbone, Underscore and jQuery
    require(['backbone'], function() {
        // then load spec files and start Karma
        require(getSpecFiles(karma.files), karma.start);
    });

}());
