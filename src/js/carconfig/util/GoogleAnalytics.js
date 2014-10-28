define(function() {

    var _debug = false,
        console = window.console || {
            log: function() {}
        };

    window._gaq = window._gaq || [];

    (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();

    function _trackEvent(category, action, label) {
        _gaq.push(['_trackEvent', category, action, label]);
        if (_debug) {
            console.log('Track Event: ' + [category, action, label].join(' => '));
        }
    }

    return {

        init: function(debug) {
            _debug = !!debug;
            _gaq.push(['_setAccount', 'UA-24637375-3']);
            _gaq.push(['_trackPageview']);
            return this;
        },

        normalizeEvents: function(widget) {
            // vehicle configuration
            widget.styleConfigurator.makes.on('change', function(make) {
                if (!make) {
                    return widget.trigger('vehicle.style.deselect');
                }
                widget.trigger('vehicle.make.select', make.get('id'), make.get('name'));
            });
            widget.styleConfigurator.models.on('change', function(model) {
                if (!model) {
                    return widget.trigger('vehicle.model.deselect');
                }
                widget.trigger('vehicle.model.select', model.get('id'), model.get('name'));
            });
            widget.styleConfigurator.years.on('change', function(year) {
                if (!year) {
                    return widget.trigger('vehicle.year.deselect');
                }
                widget.trigger('vehicle.year.select', year.get('id'), year.get('year'));
            });
            widget.styleConfigurator.styles.on('change', function(style) {
                if (!style) {
                    return widget.trigger('vehicle.style.deselect');
                }
                widget.trigger('vehicle.style.select', style.get('id'), style.get('name'));
            });
            // vehicle features
            widget.vehicleFeaturesController.on('vehicle.feature.select', function(featureId) {
                widget.trigger('vehicle.feature.select', featureId);
            });
            widget.vehicleFeaturesController.on('vehicle.feature.deselect', function(featureId) {
                widget.trigger('vehicle.feature.deselect', featureId);
            });
            // dealers
            widget.dealers.on('select', function(dealer) {
                widget.trigger('dealer.select', dealer.get('id'));
            });
            widget.dealers.on('deselect', function(dealer) {
                widget.trigger('dealer.deselect', dealer.get('id'));
            });
            // zip code
            widget.zipUpdate.on('update', function(zipCode) {
                widget.trigger('zip.update', zipCode);
            });
            widget.zipLocation.on('update', function(zipCode) {
                widget.trigger('ziplocation.update', zipCode);
            });
            widget.zipMiField.on('update', function(zipCode, radius) {
                widget.trigger('zipmi.update', zipCode, radius);
            });
        },

        track: function(widget) {
            this.normalizeEvents(widget);
            // vehicle configuration
            widget.on('vehicle.make.select', function(makeId) {
                _trackEvent('Vehicle Configuration', 'Select a Make', makeId);
            });
            widget.on('vehicle.model.select', function(modelId) {
                _trackEvent('Vehicle Configuration', 'Select a Model', modelId);
            });
            widget.on('vehicle.year.select', function(yearId) {
                _trackEvent('Vehicle Configuration', 'Select a Year', yearId);
            });
            widget.on('vehicle.style.select', function(styleId) {
                _trackEvent('Vehicle Configuration', 'Select a Style', styleId);
            });
            widget.on('vehicle.make.deselect', function() {
                _trackEvent('Vehicle Configuration', 'Unselect a Make');
            });
            widget.on('vehicle.model.deselect', function() {
                _trackEvent('Vehicle Configuration', 'Deselect a Model');
            });
            widget.on('vehicle.year.deselect', function() {
                _trackEvent('Vehicle Configuration', 'Deselect a Year');
            });
            widget.on('vehicle.style.deselect', function() {
                _trackEvent('Vehicle Configuration', 'Deselect a Style');
            });
            // vehicle features
            widget.on('vehicle.feature.select', function(featureId) {
                _trackEvent('Vehicle Features', 'Select a vehicle feature', featureId);
            });
            widget.on('vehicle.feature.deselect', function(featureId) {
                _trackEvent('Vehicle Features', 'Deselect a vehicle feature', featureId);
            });
            // dealers
            widget.on('dealer.select', function(dealerId) {
                _trackEvent('Dealers', 'Select a dealer', dealerId);
            });
            widget.on('dealer.deselect', function(dealerId) {
                _trackEvent('Dealers', 'Deselect a dealer', dealerId);
            });
            // tabs
            widget.on('tab1.click', function() {
                _trackEvent('Tabs', 'Click', 'Tab1');
            });
            widget.on('tab2.click', function() {
                _trackEvent('Tabs', 'Click', 'Tab2');
            });
            widget.on('tab3.click', function() {
                _trackEvent('Tabs', 'Click', 'Tab3');
            });
            // zip code
            widget.on('zip.update', function(zipCode) {
                _trackEvent('Zip', 'Change Zip on the tab1', zipCode);
            });
            widget.on('ziplocation.update', function(zipCode) {
                _trackEvent('Zip', 'Change Zip on the tab2', zipCode);
            });
            widget.on('zipmi.update', function(zipCode, radius) {
                _trackEvent('Zip', 'Change Zip and Radius', 'Zip: ' + zipCode + '; Radius: ' + radius);
            });
            // buttons
            widget.on('nextbtn1.click', function() {
                _trackEvent('Buttons', 'Click', 'Next button on the first tab');
            });
            widget.on('nextbtn2.click', function() {
                _trackEvent('Buttons', 'Click', 'Next button on the second tab');
            });
            widget.on('submitbtn.click', function() {
                _trackEvent('Buttons', 'Click', 'Submit button on the third tab');
            });
            // success dialog
            widget.on('dialogbtn.click', function() {
                _trackEvent('Buttons', 'Click', 'Dialog button');
            });
        }

    };
});
