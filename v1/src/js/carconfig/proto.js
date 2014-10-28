    // NVC prototype shortcut
    var proto = NVC.prototype;

    $.extend(NVC.prototype, EDM.Widget.prototype);

    /**
     * This event fires when widget rendered.
     * @event render
     */

            /**
             * This event fires when value of make changed.
             * @event change:make
             * @param {String} makeId ID of make
             */

            /**
             * This event fires when value of model changed.
             * @event change:model
             * @param {String} modelId ID of model
             */

            /**
             * This event fires when value of year changed.
             * @event change:year
             * @param {String} year Value of year
             */

            /**
             * This event fires when value of style changed.
             * @event change:style
             * @param {String} styleId ID of style
             */

            /**
             * This event fires when zip code changed.
             * @event change:zip
             * @param {String} zip Value of Zip Code
             */

            /**
             * This event fires when list of makes reseted.
             * @event reset:make
             */

            /**
             * This event fires when list of makes reseted.
             * @event reset:model
             */

            /**
             * This event fires when list of models reseted.
             * @event reset:style
             */

            /**
             * This event fires when list of styles reseted.
             * @event reset:year
             */

            /**
             * This event fires when list of styles reseted.
             * @event reset:price
             */

            /**
             * This event fires on '_calculateButton'.
             * @event calculate
             */

    /**
     * This event fires when list of makes loaded.
     * @event load:makes
     * @param {Object} data JSON response
     */

    /**
     * This event fires when list of models loaded.
     * @event load:models
     * @param {Object} data JSON response
     */

    /**
     * This event fires when a price loaded.
     * @event load:price
     * @param {Object} data JSON response
     */

    /**
     * This event fires when list of styles loaded.
     * @event load:styles
     * @param {Object} data JSON response
     */

    /**
     * This event fires when list of years loaded.
     * @event load:years
     * @param {Object} data JSON response
     */

    /**
     * Bind events.
     *
     * @method bindEvents
     * @chainable
     */
    proto.bindEvents = function() {
        // unbind all events
        this.off();
        // render events
        this.on('tab:show', this.showTab, this);

        this.on('tab2:showed', this.resizeTMVTab, this);
        this.on('tab3:showed', this.resizePriceQuotesTab, this);

        this.vehicleDetails.on('render', this.resizeOptionsContainer, this);
        this.vehiclePhotos.on('render', this.resizeOptionsContainer, this);
        this.vehicleOptions.on('render', this.resizeOptionsContainer, this);
        //this.trackEvents();
        return this;
    };

    /**
     * Track Google Analytics Events.
     *
     * @method trackEvents
     * @param {String} category The name of category
     * @param {String} action The value of category
     * @param {String} opt_label The label
     * @param {String} opt_value The value
     * @param {String} opt_noninteraction The noninteraction
     */
    proto.trackEvents = function() {
        function _trackEvent(category, action, opt_label, opt_value, opt_noninteraction) {
            _gaq.push(['_trackEvent', category, action, opt_label, opt_value, opt_noninteraction]);
        }
        this.on('init', function() {
            _trackEvent('Widgets', 'TMV Simple', 'A simple TMV widget');
        });
        this.on('change:make', function(value) {
            if (value) _trackEvent('Makes', value, 'A make was selected');
        });
        this.on('change:model', function(value) {
            if (value) _trackEvent('Models', value, 'A model was selected');
        });
        this.on('change:year', function(value) {
            if (value) _trackEvent('Years', value, 'A year was selected');
        });
        this.on('change:style', function(value) {
            if (value) _trackEvent('Styles', value, 'A style was selected');
        });
        this.on('change:zip', function(value) {
            if (value) _trackEvent('ZIP', value, 'A ZIP code was changed');
        });
        this.on('calculate', function() {
            _trackEvent('TVM', 'Click', 'Pricing Info was requested');
            //_gaq.push(['_trackEvent', 'TVM', 'Click', 'Pricing Info was requested']);
        });
        this.on('load:price', function() {
            _trackEvent('TVM', 'Received', 'Pricing Info was received');
        });
    };

    /**
     * Initialisation of widget.
     * @method init
     * @param {Object} options
     * @example
     *      widget.init({"includedMakes":"acura,aston-martin,audi","price":"tmv-invoice-msrp","showVehicles":"ALL","zip":"90010"});
     * @chainable
     */
    proto.init = function(options) {
        options = options || {};
        this.setOptions(options);

        /**
         * Сreate new instance of the EDMUNDSAPI.Vehicle.
         * @property vehiclesApi
         * @type {EDMUNDSAPI.Vehicle}
         */
        this.vehiclesApi = new EDMUNDSAPI.Vehicle(this.getApiKey());
        this.zip = options.zip || '';
        this.trigger('init');
        return this;
    };

    proto.resizeOptionsContainer = function() {
        try {
            var tab = document.getElementById(this.getBaseId() + '_tab1'),
                childs = tab.children,
                filters = childs[0],
                options = childs[1],
                footer = childs[2];
            options.style.height = tab.offsetHeight - (filters.offsetHeight + footer.offsetHeight + 15) + 'px';
        } catch(e) {}
        return this;
    };

    proto.resizeListOptions = function() {
        try {
            var el = document.getElementById(this.getBaseId() + '_list_options'),
                childs = el.children,
                header = childs[0],
                list = childs[1],
                footer = childs[2];
            if (list && header && footer && el) {
                list.style.maxHeight = el.offsetHeight - (header.offsetHeight + footer.offsetHeight + 25) + 'px';
            }
        } catch(e) {}
        if (this.optionsList) {
            this.optionsList.resize();
        }
        return this;
    };

    proto.resizeTMVTab = function() {
        var tab = document.getElementById(this.getBaseId() + '_tab2'),
            childs = tab.children,
            header, footer, body;
        if (!tab || childs.length === 0) {
            return;
        }
        try {
            // layout
            header = childs[0];
            body = childs[1].children[0];
            footer = childs[2];
            body.style.height = tab.offsetHeight - (header.offsetHeight + footer.offsetHeight + 20) + 'px';
            // body section
            childs = body.children;
            var sum = 0;
            for (var i = 0, length = childs.length; i < length; i++) {
                if (i !== 1) {
                    sum += childs[i].offsetHeight;
                }
            }
            childs[1].style.height = body.offsetHeight - sum - 40 + 'px';
            // options list
            this.resizeListOptions();
        } catch(err) {}
        return this;
    };

    proto.resizePriceQuotesTab = function() {
        var tab = document.getElementById(this.getBaseId() + '_tab3'),
            childs = tab.children,
            header, footer, body, nav;
        if (!tab || childs.length === 0) {
            return;
        }
        try {
            // layout
            header = childs[0];
            body = childs[1].children[0];
            footer = childs[2];
            nav = childs[3];
            body.style.height = tab.offsetHeight - (header.offsetHeight + footer.offsetHeight + nav.offsetHeight + 20) + 'px';
            // body section
            childs = body.children;
            var sum = 0;
            for (var i = 0, length = childs.length; i < length; i++) {
                if (i !== 1) {
                    sum += childs[i].offsetHeight;
                }
            }
            childs[1].style.height = body.offsetHeight - sum - 20 + 'px';
            // dealers list
            childs[1].children[0].style.maxHeight = childs[1].offsetHeight + 'px';
        } catch(err) {}
        return this;
    };

    /**
     * Render a widget.
     * @method render
     * @example
     *      widget.render();
     * @chainable
     */
    proto.render = function() {
        this.htmlSetup();
        this.reset();
        this.trigger('render');
        return this;
    };

    proto.reset = function() {
        this.styleConfigurator.reset();
        return this;
    };