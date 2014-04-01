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

        // ask Require.js to load test files
        deps: getSpecFiles(karma.files),

        // start test run, once Require.js is done
        callback: karma.start

    });

}());
