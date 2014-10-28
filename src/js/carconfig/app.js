require([
    //'view/Widget',
    'view/vehicle/StyleConfigurator',
    'util/GoogleAnalytics'
], function (/*Widget, */VehicleStyleConfigurator, GoogleAnalytics) {

    EDM.VehicleStyleConfigurator = VehicleStyleConfigurator;

    var config = window.widgetConfig || {options: {}, style: {}},
        subscriber = window.widgetSubscriber || {};

    var widget;
    if (config.options.hasOwnProperty('apiKey')) {
        widget = new EDM.NVC(config.options.apiKey, config.options.apiKey, {root: 'nvcwidget', baseClass: 'nvcwidget'});
    } else {
        widget = new EDM.NVC(config.options.vehicleApiKey, config.options.dealerApiKey, {root: 'nvcwidget',baseClass: 'nvcwidget'});
    }

    function getLayoutType(width) {
        var size;
        if (width < 485) {
            size = 'narrow';
        } else if (width >= 485 && width < 720) {
            size = 'medium';
        } else if (width >= 720 && width < 955) {
            size = 'wide';
        } else {
            size = 'x-wide';
        }
        return size;
    }

    $(document.body).css({
        margin: 0,
        padding: 0
    });

    $(widget.getRootElement()).addClass('nvcwidget-' + getLayoutType(config.style.width));

    widget.init({
        includedMakes: config.options.includedMakes,
        zip: config.options.zipCode,
        dealerKeywords: config.options.dealerKeywords,
        tabs: config.options.tabs,
        colorScheme: config.style.color,
        isNarrowLayout: config.style.width < 485,
        layoutType: getLayoutType(config.style.width)
    });

    widget.render();

    GoogleAnalytics.init(config.debug);
    GoogleAnalytics.track(widget);

    if (config.debug) {
        window.widget = widget;
    }

    // apply deferred events
    _.each(subscriber._deferredEvents, function (event) {
        widget.on(event.name, event.callback, event.context);
    });
    delete subscriber._deferredEvents;

    // delegate events
    subscriber.on = function (name, callback, context) {
        widget.on(name, callback, context);
    };

});
