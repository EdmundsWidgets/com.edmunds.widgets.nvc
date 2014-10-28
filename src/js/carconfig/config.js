requirejs.config({

    baseUrl: 'src/js/carconfig/',

    paths: {
        // temporary
        jquery: 'empty:',
        underscore: 'empty:',
        backbone: 'empty:',
        'vehicle-style-configurator': 'components/vehicle-style-configurator',
        nvc:   '../../../public/js/carconfig/carconfig'
    },

    shim: {
        app: {
            deps: ['vehicle-style-configurator', 'nvc']
        },
        backbone: {
            exports: 'Backbone'
        },
        underscore: {
            exports: '_'
        }
    }

});
