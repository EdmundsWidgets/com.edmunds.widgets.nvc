    // NVC prototype shortcut
    var proto = NVC.prototype;

    $.extend(NVC.prototype, EDM.Widget.prototype);

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
        this.on('tab:show', function() {
            this.vehicleFeaturesController.closeCategory();
        }, this);

        this.on('tab1:showed', this.resizeOptionsContainer, this);
        this.on('tab2:showed', this.resizeTMVTab, this);
        this.on('tab3:showed', this.resizePriceQuotesTab, this);

        this.vehicleDetails.on('render', this.resizeOptionsContainer, this);
        this.vehiclePhotos.on('render', this.resizeOptionsContainer, this);
        return this;
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
            layoutType = this.getOptions().layoutType,
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
            childs[1].style.height = body.offsetHeight - sum - 20 + 'px';
            if (layoutType === 'narrow' || layoutType === 'medium') {
                var w1 = $('.tab-2 .w1'),
                    w2 = $('.tab-2 .w2');
                w1.find('.nvcwidget-list-options').outerHeight(w1.outerHeight() - w2.outerHeight());
            }
        } catch(err) {}
        this.vehicleFeaturesController.selectedFeatures.resize();
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
            childs[1].children[1].style.maxHeight = (childs[1].offsetHeight - childs[1].children[0].offsetHeight) + 'px';
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
        this.resizeOptionsContainer();
        return this;
    };

    /**
     * TODO
     * @param {Object} zipCode
     */
    proto.updateZipCode = function(zipCode) {
        //this.leadForm.set('zipCode', zipCode);
        //this.dealers.searchCriteria.set('zipCode', zipCode);
    };
