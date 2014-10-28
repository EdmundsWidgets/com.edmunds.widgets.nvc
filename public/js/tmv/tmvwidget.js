(function(EDM) {
    'use strict';
    
    // utils shortcut
    var $ = EDM.Util;

    /**
     * True Market Value Widget
     * @class TMV
     * @namespace EDM
     * @param {String} apiKey The value of API Key
     * @param {Object} options Base options for Widget
     * @example
     *      var widget = new EDM.TMV(apikey, {root: 'tmvwidget', baseClass: 'tmvwidget'});
     * @constructor
     * @extends EDM.Widget
     */
    var TMV = EDM.TMV = function(apiKey, options) {

        var
            /**
             * Button element for price calculate.
             * @property _calculateButton
             * @type {HTMLButtonElement}
             * @private
             */
            _calculateButton,

            /**
             * Select element with list of makes.
             * @property _makesElement
             * @type {HTMLSelectElement}
             * @private
             */
            _makesElement,

            /**
             * Select element with list of models.
             * @property _modelsElement
             * @type {HTMLSelectElement}
             * @private
             */
            _modelsElement,

            /**
             * Div root element for price view.
             * @property _priceRootElement
             * @type {HTMLDivElement}
             * @private
             */
            _priceRootElement,

            /**
             * Div inner element for price view.
             * @property _priceInnerElement
             * @type {HTMLDivElement}
             * @private
             */
            _priceInnerElement,

            /**
             * Select element with list of styles.
             * @property _stylesElement
             * @type {HTMLSelectElement}
             * @private
             */
            _stylesElement,

            /**
             * Select element with list of years.
             * @property _yearsElement
             * @type {HTMLSelectElement}
             * @private
             */
            _yearsElement,

            /**
             * Input element with value of zip code.
             * @property _zipElement
             * @type {HTMLInputElement}
             * @private
             */
            _zipElement,

            /**
             * Div element with tooltip of zip code.
             * @property _zipTooltipElement
             * @type {HTMLDivElement}
             * @private
             */
            _zipTooltipElement;

        EDM.Widget.apply(this, arguments);

        /**
         * Render widget html.
         * Bind events and caching elements after render.
         *
         * @method htmlSetup
         * @chainable
         */
        this.htmlSetup = function() {
            var me = this,
                baseId = me.getBaseId(),
                rootElement = me.getRootElement(),
                options = this.getOptions();
            if (rootElement === null) {
                throw new Error('Root element was not found.');
            }
            /**
             * Returns callback function for events of change.
             * @method bindOnChangeEvent
             * @param {Object} name The name of event
             * @return {Function}
             */
            function bindOnChangeEvent(name) {
                return function() {
                    var text = this.options ? this.options[this.selectedIndex].innerHTML : null;
                    me.trigger('change:' + name, this.value, text);
                };
            }

            // render from template
            rootElement.innerHTML = $.renderTemplate(TMV.template, {
                tmvTooltip: TMV.TOOLTIP_TMV,
                baseId: baseId,
                baseClass: me.getBaseClass(),
                zip: this.zip || ''
            });

            // cache elements
            _makesElement      = document.getElementById(baseId + '_make');
            _modelsElement     = document.getElementById(baseId + '_model');
            _yearsElement      = document.getElementById(baseId + '_year');
            _stylesElement     = document.getElementById(baseId + '_style');
            _zipElement        = document.getElementById(baseId + '_zip');
            _zipTooltipElement = document.getElementById(baseId + '_zip_tooltip');
            _priceRootElement  = document.getElementById(baseId + '_price');
            _priceInnerElement = document.getElementById(baseId + '_price_inner');
            _calculateButton   = document.getElementById(baseId + '_button');
            // bind events
            _makesElement.onchange  = bindOnChangeEvent('make');
            _modelsElement.onchange = bindOnChangeEvent('model');
            _yearsElement.onchange  = bindOnChangeEvent('year');
            _stylesElement.onchange = bindOnChangeEvent('style');
            _zipElement.onchange    = bindOnChangeEvent('zip');
            _zipElement.onkeyup     = bindOnChangeEvent('zip');
            _zipElement.onkeydown   = function(event) {
                var systemKeys = [8, 27, 35, 36, 37, 38, 39, 40, 45, 46,
                        112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123],
                    numKey = [96, 97, 98, 99, 100, 101, 102, 103, 104, 105],
                    key = (event = event || window.event).keyCode,
                    val = String.fromCharCode(key),
                    isNum = (/^\d+$/).test(val),
                    isNumLock = isNum || key == 8 || $.contains(numKey, key);

                if ((event.ctrlKey && key == 86) || key == 86) {
                    return isNum;
                }
                if (event.shiftKey && key == 45) {
                    return isNum;
                }
                if ($.contains(systemKeys, key)) {
                    return;
                }
                if (!isNumLock) {
                    return isNum;
                }

            };
            _calculateButton.onclick = function() {
                me.trigger('calculate');
            };
            this.bindEvents();
            return this;
        };

        /**
         * Disabled button calculation of price.
         *
         * @method disableButton
         * @chainable
         */
        this.disableButton = function() {
            _calculateButton.disabled = true;
            return this;
        };

        /**
         * Enable button calculation of price.
         *
         * @method enableButton
         * @chainable
         */
        this.enableButton = function() {
            _calculateButton.disabled = false;
            return this;
        };

        /**
         * Enables makes select
         * @method enableMakes
         * @chainable
         */
        this.enableMakes = function() {
            _makesElement.removeAttribute('disabled');
            return this;
        };

        /**
         * Enables models select
         * @method enableModels
         * @chainable
         */
        this.enableModels = function() {
            _modelsElement.removeAttribute('disabled');
            return this;
        };

        /**
         * Enables years select
         * @method enableYears
         * @chainable
         */
        this.enableYears = function() {
            _yearsElement.removeAttribute('disabled');
            return this;
        };

        /**
         * Enables styles select
         * @method enableStyles
         * @chainable
         */
        this.enableStyles = function() {
            _stylesElement.removeAttribute('disabled');
            return this;
        };

        /**
         * Disables makes select
         * @method disableMakes
         * @chainable
         */
        this.disableMakes = function() {
            _makesElement.setAttribute('disabled', 'disabled');
            return this;
        };

        /**
         * Disables models select
         * @method disableModels
         * @chainable
         */
        this.disableModels = function() {
            _modelsElement.setAttribute('disabled', 'disabled');
            return this;
        };

        /**
         * Disables years select
         * @method disableYears
         * @chainable
         */
        this.disableYears = function() {
            _yearsElement.setAttribute('disabled', 'disabled');
            return this;
        };

        /**
         * Disables styles select
         * @method disableStyles
         * @chainable
         */
        this.disableStyles = function() {
            _stylesElement.setAttribute('disabled', 'disabled');
            return this;
        };

        /**
         * Disabled a tooltip for zip code element.
         *
         * @method disableZipTooltip
         * @chainable
         */
        this.disableZipTooltip = function() {
            _zipTooltipElement.style.display = 'none';
            return this;
        };

        /**
         * Enable a tooltip for zip code element.
         *
         * @method enableZipTooltip
         * @chainable
         */
        this.enableZipTooltip = function() {
            _zipTooltipElement.style.display = 'block';
            return this;
        };
        /**
         * Reset a list of makes.
         *
         * @method resetMakes
         * @param {String} defaultText
         * @chainable
         */
        this.resetMakes = function(defaultText) {
            defaultText = defaultText || 'List of Makes';
            $.renderSelectOptions(_makesElement, {}, defaultText);
            _makesElement.disabled = true;
            this.make = null;
            this.trigger('reset:make');
            return this;
        };

        /**
         * Reset a list of models.
         *
         * @method resetModels
         * @param {String} defaultText
         * @chainable
         */
        this.resetModels = function(defaultText) {
            defaultText = defaultText || 'List of Models';
            $.renderSelectOptions(_modelsElement, {}, defaultText);
            _modelsElement.disabled = true;
            this.model = null;
            this.models = {};
            this.trigger('reset:model');
            return this;
        };

        /**
         * Reset a price.
         *
         * @method resetPrice
         * @chainable
         */
        this.resetPrice = function() {
            var baseClass = this.getBaseClass(),
                options = this.getOptions(),
                price = options.price,
                showVehicles = this.showVehicles,
                priceClass,
                isUsed = this.getOptions().showVehicles === 'USED' || showVehicles === 'USED',
                lessLabel = (isUsed) ? 'Dealer Retail' : 'Invoice',
                moreLabel = (isUsed) ? 'Private Party' : 'MSRP',
                tmvLabel = (isUsed) ? 'Trade-in' : 'TMV<sup>&reg;</sup>';

            this.price = null;

            if (!price) {
                price = 'tmv-invoice-msrp';
            }
            switch (price) {
                case 'tmv_invoice':
                    priceClass = 'price-tmv-invoice';
                    break;
                case 'tmv':
                    priceClass = 'price-tmv';
                    break;
                default:
                    priceClass = 'price-tmv-invoice-msrp';
            }
            if (!isUsed) {
                _priceRootElement.className = baseClass + '-price' + (this.getApiKey() ? '' : ' disabled');
                _priceInnerElement.innerHTML = $.renderTemplate(TMV.textPriceTemplate, {
                    priceClass: priceClass,
                    baseClass: baseClass,
                    showVehicles: this.getOptions().showVehicles,
                    less: '---',
                    more: '---',
                    tmv: '---',
                    isLess: 'invalid',
                    isMore: 'invalid',
                    isTmv: 'invalid',
                    lessLabel: lessLabel,
                    moreLabel: moreLabel,
                    tmvLabel: tmvLabel,
                    lessTooltip: TMV.TOOLTIP_INVOICE,
                    moreTooltip: TMV.TOOLTIP_MSRP,
                    tmvTooltip: ''
                });
            } else {
                _priceRootElement.className = baseClass + '-price' + (this.getApiKey() ? '' : ' disabled');
                _priceInnerElement.innerHTML = $.renderTemplate(TMV.graphPriceTemplate, {
                    priceClass: priceClass,
                    baseClass: baseClass,
                    showVehicles: this.getOptions().showVehicles,
                    less: '---',
                    more: '---',
                    tmvMin: '---',
                    tmvMax: '---',
                    isLess: 'invalid',
                    isMore: 'invalid',
                    isTmv: 'invalid',
                    isRangeMin: 'invalid',
                    isRangeMax: 'invalid',
                    lessLabel: lessLabel,
                    moreLabel: moreLabel,
                    tmvLabel: tmvLabel,
                    lessTooltip: TMV.TOOLTIP_INVOICE,
                    moreTooltip: TMV.TOOLTIP_MSRP,
                    tmvTooltip: ''
                });
            }


            this.trigger('reset:price');


            return this;
        };

        /**
         * Reset a list of styles.
         *
         * @method resetStyles
         * @param {String} defaultText
         * @chainable
         */
        this.resetStyles = function(defaultText) {
            defaultText = defaultText || 'List of Styles';
            $.renderSelectOptions(_stylesElement, {}, defaultText);
            _stylesElement.disabled = true;
            this.disableButton();
            this.style = null;
            this.trigger('reset:style');
            return this;
        };

        /**
         * Reset a list of years.
         *
         * @method resetYears
         * @param {String} defaultText
         * @chainable
         */
        this.resetYears = function(defaultText) {
            defaultText = defaultText || 'Year';
            $.renderSelectOptions(_yearsElement, {}, defaultText);
            _yearsElement.disabled = true;
            this.year = null;
            this.trigger('reset:year');
            return this;
        };

        /**
         * Set a make.
         *
         * @method setMakes
         * @param {Object} records
         * @chainable
         */
        this.setMakes = function(records) {
            if ($.isEmpty(records)) {
                return this.resetMakes('Makes not found');
            }
            $.renderSelectOptions(_makesElement, records, 'Select a Make');
            _makesElement.disabled = false;
            return this;
        };

        /**
         * Set a model.
         *
         * @method setModels
         * @param {Object} records
         * @chainable
         */
        this.setModels = function(records) {
            if ($.isEmpty(records)) {
                return this.resetModels('Models not found');
            }
            $.renderSelectOptions(_modelsElement, records, 'Select a Model', false, true);
            _modelsElement.disabled = false;
            return this;
        };

        /**
         * Set a price.
         *
         * @method setPrice
         * @param {Object} price
         * @chainable
         */
        this.setPrice = function(price) {
            var options = this.getOptions(),
                priceType = options.price,
                expr = /(?=(?:\d{3})+(?:\.|$))/g,
                priceClass,
                less = price.less,
                more = price.more,
                tmvStrMin = (price.rangeMin) ? price.rangeMin.toString().split(expr).join(',') : 'N/A',
                tmvStrMax = (price.rangeMax) ? price.rangeMax.toString().split(expr).join(',') : 'N/A',
                showVehicles = this.showVehicles,
                isUsed = this.getOptions().showVehicles === 'USED' || showVehicles === 'USED',
                tmv = price.tmv,
                lessStr = (less) ? less.toString().split(expr).join(',') : 'N/A',
                moreStr = (more) ? more.toString().split(expr).join(',') : 'N/A',
                tmvStr = (tmv) ? tmv.toString().split(expr).join(',') : 'N/A';

            if (!priceType) {
                priceType = 'tmv-invoice-msrp';
            }
            switch (priceType) {
                case 'tmv_invoice':
                    priceClass = 'price-tmv-invoice';
                    break;
                case 'tmv':
                    priceClass = 'price-tmv';
                    break;
                default:
                    priceClass = 'price-tmv-invoice-msrp';
            }

            if (!isUsed) {
                _priceRootElement.className = this.getBaseClass() + '-price';
                _priceInnerElement.innerHTML = $.renderTemplate(TMV.textPriceTemplate, {
                    priceClass: priceClass,
                    baseClass: this.getBaseClass(),
                    showVehicles:   price.showVehicles,
                    less:           lessStr,       //low
                    more:           moreStr,       //big
                    tmv:            tmvStr,        //mid
                    isLess:         (less) ? 'valid' : 'invalid',
                    isMore:         (more) ? 'valid' : 'invalid',
                    isTmv:          (tmv) ? 'valid' : 'invalid',
                    lessLabel:      price.lessLabel,
                    moreLabel:      price.moreLabel,
                    tmvLabel:       price.tmvLabel,
                    headerToolTip:  price.headerToolTip,
                    lessTooltip:    price.lessTooltip,
                    moreTooltip:    price.moreTooltip,
                    tmvTooltip:     price.tmvTooltip
                });
            } else {
                _priceRootElement.className = this.getBaseClass() + '-price';
                _priceInnerElement.innerHTML = $.renderTemplate(TMV.graphPriceTemplate, {
                    priceClass: priceClass,
                    baseClass: this.getBaseClass(),
                    showVehicles: this.getOptions().showVehicles,
                    less:           lessStr,       //low
                    more:           moreStr,       //big
                    tmvMin:         tmvStrMin,
                    tmvMax:         tmvStrMax,
                    isLess:         (less) ? 'valid' : 'invalid',
                    isMore:         (more) ? 'valid' : 'invalid',
                    isTmv:          (tmv) ? 'valid' : 'invalid',
                    isRangeMin:     (price.rangeMin) ? 'valid' : 'invalid',
                    isRangeMax:     (price.rangeMax) ? 'valid' : 'invalid',
                    lessLabel:      price.lessLabel,
                    moreLabel:      price.moreLabel,
                    tmvLabel:       price.tmvLabel,
                    headerToolTip:  price.headerToolTip,
                    lessTooltip:    price.lessTooltip,
                    moreTooltip:    price.moreTooltip,
                    tmvTooltipMin:  price.tmvTooltipMin,
                    tmvTooltipMax:  price.tmvTooltipMax
                });
            }
        };

        /**
         * Set a style.
         *
         * @method setStyles
         * @param {Object} records
         * @chainable
         */
        this.setStyles = function(records) {
            if ($.isEmpty(records)) {
                return this.resetStyles('Styles not found');
            }
            $.renderSelectOptions(_stylesElement, records, 'Select a Style', false, true);
            _stylesElement.disabled = false;
            return this;
        };

        /**
         * Set a year.
         *
         * @method setYears
         * @param {Object} records
         * @chainable
         */
        this.setYears = function(records) {
            var type = this.getOptions().showVehicles,
                hasOptGroups = !type || type === 'ALL';
            if (hasOptGroups && records.length > 0 || !hasOptGroups && $.isEmpty(records)) {
                return this.resetYears('Years not found');
            }
            $.renderSelectOptions(_yearsElement, records, 'Year', hasOptGroups);
            _yearsElement.disabled = false;
            return this;
        };

        this.showError = function(text) {
            var root = this.getRootElement(),
                error = new EDM.nvc.MessageDialog();
            root.appendChild(error.render({
                isSuccess: false,
                text: text || [
                    '<p>Something went wrong!</p>',
                    '<p>Please return and try again or <a href="Mailto:api@edmunds.com">contact us</a> directly.</p>'
                ].join('')
            }).el);
            error.init();
        };

    };

    // TMV prototype shortcut
    var proto = TMV.prototype;

    $.extend(TMV.prototype, EDM.Widget.prototype);

    /**
     * This event fires when widget rendered.
     * @event render
     */

    /**
     * This event fires when value of make changed.
     * @event change:make
     * @param {String} makeId ID of make
     * @param {String} makeName The make name
     */

    /**
     * This event fires when value of model changed.
     * @event change:model
     * @param {String} modelId ID of model
     * @param {String} modelName The model name
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
     * @param {String} styleName The style name
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
        // change events
        this.on('change:make', this.onMakeChange, this);
        this.on('change:model', this.onModelChange, this);
        this.on('change:year', this.onYearChange, this);
        this.on('change:style', this.onStyleChange, this);
        this.on('change:zip', this.onZipChange, this);
        // reset events
        this.on('reset:make', this.resetModels, this);
        this.on('reset:model', this.resetYears, this);
        this.on('reset:year', this.resetStyles, this);
        this.on('reset:style', this.resetPrice, this);
        // calculate price
        this.on('calculate', this.loadPrice, this);
        this.trackEvents();
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

    /**
     * Render a widget.
     * @method render
     * @example
     *      widget.render();
     * @chainable
     */
    proto.render = function() {
        var options = this.getOptions();
        this.htmlSetup();
        this.trigger('render');
        if (!this.getApiKey()) {
            return this.resetMakes();
        }
        this.loadMakes(String(options.showVehicles).toLowerCase());
        return this;
    };

    // Data load methods

    /**
     * Request to load list of makes.
     * @method loadMakes
     * @chainable
     */
    proto.loadMakes = function(publicationState) {
        var successCallback = $.bind(this.onMakesLoad, this),
            errorCallback = $.bind(this.onMakesLoadError, this);
        this.resetMakes('Loading Makes...');
        this.vehiclesApi.getListOfMakes(publicationState, successCallback, errorCallback);
        return this;
    };
    /**
     * Request to load a zip code.
     * @method loadZip
     * @param {String} zip Zip Code
     * @chainable
     */
    proto.loadZip = function(zip) {
        var successCallback = $.bind(this.onZipLoad, this),
            errorCallback = $.bind(this.onZipLoadError, this);
        this.vehiclesApi.getValidZip(zip, successCallback, errorCallback);
        return this;
    };

    /**
     * Request to load list of models.
     * @method loadModels
     * @param {String} makeId
     * @chainable
     */
    proto.loadModels = function(makeId) {
        var successCallback = $.bind(this.onModelsLoad, this),
            errorCallback = $.bind(this.onModelsLoadError, this);
        this.disableMakes();
        this.vehiclesApi.getListOfModelsByMake(makeId, successCallback, errorCallback);
        return this;
    };

    /**
     * Request to load a price.
     * @method loadPrice
     * @chainable
     */
    proto.loadPrice = function() {
        var isNew = this.showVehicles === 'NEW',
            st = isNew ? 'calculatenewtmv' : 'calculatetypicallyequippedusedtmv',
            url = '/api/tmv/tmvservice/' + st,
            successCallback = isNew ? $.bind(this.onPriceLoad, this) : $.bind(this.loadRangeMin, this),
            errorCallback = $.bind(this.onPriceLoadError, this),
            options = {
                alg:        'rethink',
                styleid:    this.style,
                zip:        this.zip
            };
        this.disableButton();
        this.resetPrice();
        this.vehiclesApi.invoke(url, options, successCallback, errorCallback);
        return this;
    };

    /**
     * Request to load min price for range .
     * @method loadRangeMin
     * @chainable
     */
    proto.loadRangeMin = function(data) {
        var url = '/api/tmv/tmvservice/calculateusedtmv',
            callback = $.bind(this.loadRangeMax, this),
            options = {
                alg:        'rethink',
                styleid:    this.style,
                zip:        this.zip,
                condition:  'ROUGH',
                mileage:    50000
            };
        this.price = this.parsePrice(data);
        this.vehiclesApi.invoke(url, options, callback);
        return this;
    };

    /**
     * Request to load max price for range.
     * @method loadRangeMax
     * @chainable
     */
    proto.loadRangeMax = function(data) {
        var url = '/api/tmv/tmvservice/calculateusedtmv',
            callback = $.bind(this.onPriceLoad, this),
            options = {
                alg:        'rethink',
                styleid:    this.style,
                zip:        this.zip,
                condition:  'OUTSTANDING',
                mileage:    15000
            };
        this.price.rangeMin = this.parsePriceRangeMin(data);
        this.vehiclesApi.invoke(url, options, callback);
        return this;
    };

    //http://api.edmunds.com/v1/api/tmv/tmvservice/calculateusedtmv?styleid=101381665&zip=12345&mileage=15000&condition=OUTSTANDING&api_key=g2dgxhfatcspkunbb7m33zv6&fmt=json&callback=EDMUNDSAPI.cb1369142284181
    //http://api.edmunds.com/v1/api/tmv/tmvservice/calculateusedtmv?styleid=101381665&zip=12345&mileage=50000&condition=ROUGH&api_key=g2dgxhfatcspkunbb7m33zv6&fmt=json&callback=EDMUNDSAPI.cb1369142284181

    /**
     * Request to load list of styles.
     * @method loadStyles
     * @param {String} make
     * @param {String} model
     * @param {String} year
     * @chainable
     */
    proto.loadStyles = function(make, model, year, submodel, view) {
        var successCallback = $.bind(this.onStylesLoad, this),
            errorCallback = $.bind(this.onStylesLoadError, this);
        this.disableMakes();
        this.disableModels();
        this.disableYears();
        this.vehiclesApi.getVehicle(make, model, year, submodel, view, successCallback, errorCallback);
        return this;
    };

    // Change callbacks

    /**
     * Changed a year.
     * @method onMakeChange
     * @param {String} makeId
     * @chainable
     */
    proto.onMakeChange = function(makeId) {
        this.make = makeId;
        if (!makeId) {
            this.resetModels();
            return;
        }
        this.resetModels('Loading Models...');
        this.loadModels(makeId);
        return this;
    };

    /**
     * Changed a model.
     * @method onModelChange
     * @param {String} modelId
     * @chainable
     */
    proto.onModelChange = function(modelId) {
        var model, years;
        if (!modelId) {
            this.resetYears();
            return;
        }
        model = modelId.substring(0, modelId.indexOf(':'));
        years = this.parseYears(this.models[modelId], this.getOptions().showVehicles);
        this.model = model;
        this.submodel = modelId.substring(modelId.indexOf(':') + 1);
        this.resetYears();
        this.setYears(years);
        return this;
    };

    /**
     * Changed a style.
     * @method onStyleChange
     * @param {String} styleId
     * @chainable
     */
    proto.onStyleChange = function (styleId) {
        this.style = styleId;
        if (!styleId) {
            this.resetPrice();
            this.disableButton();
            return;
        }
        this.resetPrice();

        var isValid = (/[0-9]{5}/).test(this.zip);

        if (isValid) {
            this.enableButton();
        }

        return this;
    };

    /**
     * Changed a year.
     * @method onYearChange
     * @param {String} year
     * @chainable
     */
    proto.onYearChange = function(year) {
        this.year = year;
        this.showVehicles = year && year.substr && year.substr(4) || null;
        if (!year) {
            this.resetStyles();
            return;
        }
        this.resetStyles('Loading Styles...');
        this.loadStyles(this.make, this.model, this.submodel, parseInt(year, 10), this.showVehicles);
        return this;
    };

    /**
     * Changed zip code.
     * @method onZipChange
     * @param {String} zip Zip code
     * @chainable
     */
    proto.onZipChange = function(zip) {
        var isValid = (/[0-9]{5}/).test(zip);

        this.zip = zip;

        if (isValid){
            this.loadZip(zip);
        } else {
            this.disableButton();
            this.enableZipTooltip();
        }

        return this;
    };

    // Load callbacks

    /**
     * Loaded a zip code.
     * @method onZipLoad
     * @param {Object} data
     * @chainable
     */
    proto.onZipLoad = function(data) {
        var zip = this.zip,
            isValid = (data[zip] === 'true') ? true : false;

        this[isValid ? 'disableZipTooltip' : 'enableZipTooltip']();
        this[isValid && this.style ? 'enableButton' : 'disableButton']();
        return this;
    };

    /**
     * Loaded list of makes.
     * @method onMakesLoad
     * @param {Object} data
     * @chainable
     */
    proto.onMakesLoad = function(data) {
        var records = this.parseMakes(data);
        if (data.error) {
            this.resetMakes('Makes not found');
            this.showError();
            return this;
        }
        this.setMakes(records);
        this.trigger('load:makes', data);
        return this;
    };

    /**
     * Loaded list of models.
     * @method onModelsLoad
     * @param {Object} data
     * @chainable
     */
    proto.onModelsLoad = function(data) {
        var records = this.parseModels(data);
        this.enableMakes();
        if (data.error) {
            this.resetModels('Models not found');
            this.showError();
            return this;
        }
        this.models = data.models;
        this.setModels(records);
        this.trigger('load:models', data);
        return this;
    };

    /**
     * Loaded a price.
     * @method onPriceLoad
     * @param {Object} data
     * @chainable
     */
    proto.onPriceLoad = function(data) {
        var isNew = this.showVehicles === 'NEW';
        if (isNew) {
            this.price = this.parsePrice(data);
        } else {
            this.price.rangeMax = this.parsePriceRangeMax(data);
        }
        this.setPrice(this.price);
        this.enableButton();
        this.trigger('load:price', data, this.price);
        return this;
    };

    /**
     * Loaded list of styles.
     * @method onStylesLoad
     * @param {Object} data
     * @chainable
     */
    proto.onStylesLoad = function(data) {
        var records = this.parseStyles(data);
        this.enableMakes();
        this.enableModels();
        this.enableYears();
        if (data.error) {
            this.resetStyles('Styles not found');
            this.showError();
            return this;
        }
        this.setStyles(records);
        this.trigger('load:styles', data);
        return this;
    };

    /**
     * Loaded list of years.
     * @method onYearsLoad
     * @param {Object} data
     * @chainable
     */
    proto.onYearsLoad = function(data) {
        var records = this.parseYears(data);
        this.setYears(records);
        this.trigger('load:years', data);
        return this;
    };

    // Error handlers

    proto.onMakesLoadError = function() {
        this.resetMakes('Makes not found');
        this.showError();
    };

    proto.onModelsLoadError = function() {
        this.resetModels('Models not found');
        this.showError();
    };

    proto.onStylesLoadError = function() {
        this.resetStyles('Styles not found');
        this.showError();
    };

    proto.onZipLoadError = function() {
        this.showError();
    };

    proto.onPriceLoadError = function() {
        this.onPriceLoad({});
    };

    // Parsers

    /**
     * Parsing list of makes.
     * @method parseMakes
     * @param {Object} data
     * @return {Object}
     */
    proto.parseMakes = function(data) {
        var result = {},
            records = data.makes,
            includedMakes = this.getOptions().includedMakes,
            makes = (typeof includedMakes === 'string') ? includedMakes.split(',') : [],
            includeAll = includedMakes === 'all',
            key, record;

        for (key in records) {
            record = records[key];
            if (includeAll || $.contains(makes, record.niceName)) {
                result[record.niceName] = record.name;
            }
        }

        return result;
    };

    /**
     * Parsing list of models.
     * @method parseModels
     * @param {Object} data
     * @return {Object}
     */
    proto.parseModels = function(data) {
        var records = data.models,
            showVehicles = this.getOptions().showVehicles;

        /**
         * Checking list of years.
         * @method hasYears
         * @param {Array} years List of years
         * @param {String} type
         * @return {Object}
         */
        function hasYears(years, type) {
            var result = false,
                hasNewYears = !!years.NEW,
                hasUsedYears = !!years.USED;
            switch (type) {
                case 'NEW':
                    result = hasNewYears;
                    break;
                case 'USED':
                    result = hasUsedYears;
                    break;
                default:
                    result = hasNewYears || hasUsedYears;
            }
            return result;
        }

        function sortObgectByValue(data) {
            var arr = [];
            for (var key in data) {
                arr.push([key, data[key]]);
            }
            arr.sort(function (a, b) {
                if (a[1] < b[1]) {
                    return -1;
                } else if (a[1] > b[1]) {
                    return 1;
                } else {
                    return 0;
                }
            });
            return arr;
        }

        /**
         * Mapping for list of models.
         * @method mapModels
         * @param {Array} records List of models
         * @param {String} type
         * @return {Object}
         */
        function mapModels(records, type) {
            var result = {},
                key, record;
            for (key in records) {
                record = records[key];
                if (hasYears(record.years, type)) {
                    result[key] = record.name;
                }
            }
            return result;
        }

        // used or new
        if (showVehicles === 'USED' || showVehicles === 'NEW') {
            return sortObgectByValue(mapModels(records, showVehicles));
        }

        return sortObgectByValue(mapModels(records));

    };

    /**
     * Return object with options for render price.
     * @method parsePrice
     * @param {Object} data
     * @return {Object}
     */
    proto.parsePrice = function(data) {
        var result = {},
            totalWithOptions,
            invoice, msrp, tmv;
        totalWithOptions = ((data || {}).tmv || {}).totalWithOptions || {};

        if (this.showVehicles === 'USED') {
            return {
                showVehicles: this.showVehicles,
                less: totalWithOptions.usedTmvRetail,
                more: totalWithOptions.usedPrivateParty,
                tmv: totalWithOptions.usedTradeIn,
                lessLabel: 'Dealer Retail',
                moreLabel: 'Private Party',
                tmvLabel: 'Trade-in',
                lessTooltip: TMV.TOOLTIP_TMVRETAIL,
                moreTooltip: TMV.TOOLTIP_PRIVATEPARTY,
                tmvTooltipMin: TMV.TOOLTIP_TRADEIN_MIN,
				tmvTooltipMax: TMV.TOOLTIP_TRADEIN_MAX
            };
        }
        return {
            showVehicles: this.showVehicles,
            less: totalWithOptions.baseInvoice,
            more: totalWithOptions.baseMSRP,
            tmv: totalWithOptions.tmv,
            lessLabel: 'Invoice',
            moreLabel: 'MSRP',
            tmvLabel: 'TMV<sup>&reg;</sup>',
            lessTooltip: TMV.TOOLTIP_INVOICE,
            moreTooltip: TMV.TOOLTIP_MSRP,
            tmvTooltip: ''
        };
    };

    /**
     * Return value for min range price.
     * @method parsePriceRangeMin
     * @param {Object} data
     * @return {String}
     */
    proto.parsePriceRangeMin = function(data){
        var totalWithOptions,
            priceRangeMin;
        totalWithOptions = ((data || {}).tmv || {}).totalWithOptions || {};
        priceRangeMin = totalWithOptions.usedTradeIn;
        return priceRangeMin;
    };

    /**
     * Return value for max range price.
     * @method parsePriceRangeMax
     * @param {Object} data
     * @return {String}
     */
    proto.parsePriceRangeMax = function(data){
        var totalWithOptions,
            priceRangeMax;
        totalWithOptions = ((data || {}).tmv || {}).totalWithOptions || {};
        priceRangeMax = totalWithOptions.usedTradeIn;
        return priceRangeMax;
    };

    /**
     * Parsing list of styles.
     * @method parseStyles
     * @param {Object} data
     * @return {Object}
     */
    proto.parseStyles = function(data) {
        var result = {},
            records = data.styles,
            length = records.length,
            i, record;
        for (i = 0; i < length; i++) {
            record = records[i];
            result[record.id] = record.name;
        }
        function sortObgectByValue(data) {
            var arr = [];
            for (var key in data) {
                arr.push([key, data[key]]);
            }
            arr.sort(function(a, b) {
                if (a[1] < b[1]) {
                    return -1;
                } else if (a[1] > b[1]) {
                    return 1;
                } else {
                    return 0;
                }
            });
            return arr;
        }
        return sortObgectByValue(result);
    };

    /**
     * Parsing list of years.
     * @method parseYears
     * @param {Object} data
     * @param {String} type The vehicle type (ALL, NEW or USED)
     * @return {Object}
     */
    proto.parseYears = function(data, type) {
        var result = {},
            records = data.years;
        /**
         * Mapping for list of years.
         * @method mapYears
         * @param {Array} years List of years
         * @param {String} type
         * @return {Object}
         */
        function mapYears(years, type) {
            var result = {},
                length, i, year;
            years = $.isArray(years) ? years : [];
            length = years.length;
            for (i = 0; i < length; i++) {
                year = years[i];
                result[year + type] = year;
            }
            return result;
        }
        // used or new
        if (type === 'USED' || type === 'NEW') {
            return mapYears(records[type], type);
        }
        // all (NEW, USED)
        for (type in records) {
            if (type === 'USED' || type === 'NEW') {
                result[type] = mapYears(records[type], type);
            }
        }
        return result;
    };

    /**
     * `template` HTML template - widget view
     * @property template
     * @static
     * @type {HTMLDivElement}
     */
    TMV.template = [
        '<div class="<%= baseClass %>-inner">',
            '<div class="<%= baseClass %>-header">',
                '<span class="title">True Market Value<sup>&reg;</sup></span><span class="question" onclick=""><sup>?</sup><div class="tmvwidget-tooltip"><div class="arrow-left"></div><%= tmvTooltip %></div></span>',
            '</div>',
            '<div class="<%= baseClass %>-body">',
                '<select class="<%= baseClass %>-make" id="<%= baseId %>_make" title="List of Makes"></select>',
                '<select class="<%= baseClass %>-model" id="<%= baseId %>_model" title="List of Models"></select>',
                '<select class="<%= baseClass %>-year" id="<%= baseId %>_year" title="List of Years"></select>',
                '<select class="<%= baseClass %>-style" id="<%= baseId %>_style" title="List of Styles"></select>',
                '<div class="<%= baseClass %>-row">',
                    '<div class="zip-code"><input type="text" class="<%= baseClass %>-zip" id="<%= baseId %>_zip" value="<%= zip %>" placeholder="ZIP" title="ZIP Code" maxlength="5"><div id="<%= baseId %>_zip_tooltip" class="tmvwidget-tooltip"><div class="arrow-left"></div>Please enter a valid Zip Code</div></div>',
                    '<button type="button" id="<%= baseId %>_button">Get Price</button>',
                    '',
                '</div>',
            '</div>',
            '<div class="<%= baseClass %>-price" id="<%= baseId %>_price">',
                '<div>',
                    '<div class="" id="<%= baseId %>_price_inner"></div>',
                '</div>',
            '</div>',
            '<div class="<%= baseClass %>-footer">',
                '<a href="http://developer.edmunds.com/tmv_widget_terms" class="copy" target="_blank">Legal Notice</a>',
                '<div class="logo">Built by<a href="http://www.edmunds.com/" target="_blank"></a></div>',
            '</div>',
        '</div>'
    ].join('');

    /**
     * `graphPriceTemplate` HTML template - view values of price in graph format
     * @property graphPriceTemplate
     * @static
     * @type {HTMLDivElement}
     */
    TMV.graphPriceTemplate = [
        '<div class="<%= baseClass %>-price-range">',
            '<div class="top">',
                '<div class="left">',
                    '<div class="label">Trade-in</div>',
                '</div>',
                '<div class="right">',
                    // prices
                    '<div class="values">',
                        '<span class="left value <%= isRangeMin %>" onclick=""><sup>$</sup><%= tmvMin %><div class="tmvwidget-tooltip"><div class="arrow-left"></div><%= tmvTooltipMin %></div></span>',
                        '<span class="right value <%= isRangeMax %>" onclick=""><sup>$</sup><%= tmvMax %><div class="tmvwidget-tooltip"><div class="arrow-left"></div><%= tmvTooltipMax %></div></span>',
                    '</div>',
                    // graph
                    '<div class="pointers">',
                        '<div class="graph">',
                            '<div class="left-part"></div>',
                            '<div class="right-part"></div>',
                        '</div>',
                        '<div class="left"></div>',
                        '<div class="right"></div>',
                    '</div>',
                    '<div class="note">based on mileage & condition adjustments</div>',
                '</div>',
            '</div>',
            // labels
            '<div class="bottom">',
                '<div class="left">',
                    '<span class="label"><%= lessLabel %></span>',
                    '<span class="value <%= isLess %>" onclick=""><sup>$</sup><%= less %><div class="tmvwidget-tooltip"><div class="arrow-left"></div><%= lessTooltip %></div></span>',
                '</div>',
                '<div class="right">',
                    '<span class="label"><%= moreLabel %></span>',
                    '<span class="value <%= isMore %>" onclick=""><sup>$</sup><%= more %><div class="tmvwidget-tooltip"><div class="arrow-left"></div><%= moreTooltip %></div></span>',
                '</div>',
            '</div>',
        '</div>'
    ].join('');

    /**
     * `textPriceTemplate` HTML template - view values of price in text format
     * @property textPriceTemplate
     * @static
     * @type {HTMLDivElement}
     */
    TMV.textPriceTemplate = [
        '<div class="<%= baseClass %>-price-text <%= showVehicles %> <%= priceClass %>">',
            // labels & prices
            '<div class="labels">',
                '<div class="top">',
                    '<span class="label"><%= tmvLabel %></span>',
                    '<span class="value <%= isTmv %>" onclick=""><sup>$</sup><%= tmv %><div class="tmvwidget-tooltip"><div class="arrow-left"></div><%= tmvTooltip %></div></span>',
                '</div>',
                '<div class="bottom">',
                    '<div class="right">',
                        '<span class="label"><%= moreLabel %></span>',
                        '<span class="value <%= isMore %>" onclick=""><sup>$</sup><%= more %><div class="tmvwidget-tooltip"><div class="arrow-left"></div><%= moreTooltip %></div></span>',
                    '</div>',
                    '<div class="left">',
                        '<span class="label"><%= lessLabel %></span>',
                        '<span class="value <%= isLess %>" onclick=""><sup>$</sup><%= less %><div class="tmvwidget-tooltip"><div class="arrow-left"></div><%= lessTooltip %></div></span>',
                    '</div>',
                '</div>',
            '</div>',
        '</div>'
    ].join('');

    /**
     * @property TOOLTIP_TMV
     * @static
     * @final
     * @type {String}
     */
    TMV.TOOLTIP_TMV          = 'The Edmunds.com TMV® (Edmunds.com True Market Value®) price is Edmunds.com’s determination of the current average base dealer price in the area indicated by the Zip Code provided, unadjusted for vehicle color or any options. (Or, for used vehicles, condition and mileage.)';

    /**
     * @property TOOLTIP_INVOICE
     * @static
     * @final
     * @type {String}
     */
    TMV.TOOLTIP_INVOICE      = 'This is the price the dealer paid the manufacturer for the car, including destination charges.';

    /**
     * @property TOOLTIP_MSRP
     * @static
     * @final
     * @type {String}
     */
    TMV.TOOLTIP_MSRP         = 'Also known as Manufacturer’s Suggested Retail Price, this is the price the manufacturer recommends selling the car for – and often the starting point for negotiations with the dealer. Most consumers end up purchasing their car for less than MSRP.';

    /**
     * @property TOOLTIP_TRADEIN_MIN
     * @static
     * @final
     * @type {String}
     */
    TMV.TOOLTIP_TRADEIN_MIN      = 'This is the amount you can expect to receive when you trade in this vehicle and purchase a new one. This trade-in price is adjusted for 50,000 miles and a ROUGH condition. Vehicle color and options are unadjusted for.';

	/**
     * @property TOOLTIP_TRADEIN_MAX
     * @static
     * @final
     * @type {String}
     */
    TMV.TOOLTIP_TRADEIN_MAX     = 'This is the amount you can expect to receive when you trade in this vehicle and purchase a new one. This trade-in price is adjusted for 15,000 miles and an OUTSTANDING condition. Vehicle color and options are unadjusted for.';

    /**
     * @property TOOLTIP_PRIVATEPARTY
     * @static
     * @final
     * @type {String}
     */
    TMV.TOOLTIP_PRIVATEPARTY = 'This is the amount at which the car is sold to or purchased by a private party, not a car dealer. This price is adjusted to CLEAN condition plus typically equipped options.';

    /**
     * @property TOOLTIP_TMVRETAIL
     * @static
     * @final
     * @type {String}
     */
    TMV.TOOLTIP_TMVRETAIL    = 'This is what other customers have paid for a similar car in your area. This dealer price is adjusted to CLEAN condition plus typically equipped options.';

    // Add Google Analytics
    window._gaq = window._gaq || [];
    _gaq.push(['_setAccount', 'UA-24637375-1']);
    _gaq.push(['_setDomainName', window.location.host]);
    _gaq.push(['_trackPageview']);
		
    (function() { 
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();

}(window.EDM));
EDM.namespace('nvc').MessageDialog = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        template = EDM.template;

    function MessageDialog() {
        Observable.call(this);
        this.el = document.createElement('div');
        this.el.className = 'nvcwidget-overlay';
        this.template = template(this.template);
    }

    MessageDialog.prototype = {

        render: function(options) {
            options = options || {};
            if (!options.text) {
                options.text = [
                    '<p>Something went wrong when sending your form!</p>',
                    '<p>Please return to the form and try again or <a href="Mailto:api@edmunds.com">contact</a> us directly.</p>'
                ].join('');
            }
            this.el.innerHTML = '<div class="overlay-bg"></div>';
            this.isSuccess = options.isSuccess;
            this.message = document.createElement('div');
            this.message.className = 'nvcwidget-message';
            this.message.innerHTML = this.template({ options: options });
            this.message.className += options.isSuccess ? " success-message" : " failure-message";
            this.el.appendChild(this.message);

            return this;
        },

        setMargin: function() {
            var height = this.message.offsetHeight;
            this.message.style.marginTop = (-height/2) + 'px';
        },

        init: function() {
            var button = this.el.getElementsByTagName('button')[0];

            this.setMargin();
            button.onclick = function(me) {
                return function() {
                    if(me.isSuccess === true) {
                        me.trigger('reset');
                    }
                    me.el.parentNode.removeChild(me.el);
                };
            }(this);
        },

        template: [
            '<% if (options.isSuccess === true) { %>',
                '<div class="message-header">Thank you!</div>',
                '<div class="message-body">',
                    '<p>We have sent your request for a price quote on the</p>',
                    '<p class="name"><%= options.name%></p>',
                    '<p>to the following dealer(s)</p>',
                    '<ul>',
                        '<% for (var i = 0, length = options.dealers.length; i < length; i++) { %>',
                            '<li>-&nbsp;<%= options.dealers[i] %></li>',
                        '<% } %>',
                    '</ul>',
                '</div>',
                '<div class="message-bottom">',
                    '<button type="reset" id="continue_button">Configure another vehicle</button>',
                '</div>',
            '<% } else { %>',
                '<div class="message-header">Oh no...</div>',
                '<div class="message-body">',
                    '<%= options.text %>',
                    //'<p>Something went wrong when sending your form!</p>',
                    //'<p>Please return to the form and try again or <a href="Mailto:api@edmunds.com">contact</a> us directly.</p>',
                '</div>',
                '<div class="message-bottom">',
                    '<button type="button">Return and try again</button>',
                '</div>',
            '<% } %>'
        ].join('')

    };

    return MessageDialog;

}());