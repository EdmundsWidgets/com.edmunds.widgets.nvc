requirejs.config({

    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        underscore: '../bower_components/underscore/underscore',
        backbone: '../bower_components/backbone/backbone'
    },

    deps: ['backbone']

});

require([
    'dealers/view/list'
], function(DealersListView) {

    var dealersListView = new DealersListView({
        api_key:    'axr2rtmnj63qsth3ume3tv5f',
        makeName:   'BMW',
        model:      '1 Series',
        styleid:    200428725,
        zipcode:    90404,
        radius:     100
    });

    dealersListView.on('change', function(selectedIds) {
        console.log(selectedIds);
    });

    document.body.appendChild(dealersListView.el);

    dealersListView.load();

});
