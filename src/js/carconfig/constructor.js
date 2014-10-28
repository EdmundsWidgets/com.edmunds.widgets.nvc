    /**
     * True Market Value Widget
     * @class NVC
     * @namespace EDM
     * @param {String} apiKey The value of API Key
     * @param {Object} options Base options for Widget
     * @example
     *      var widget = new EDM.NVC(apikey, {root: 'nvcwidget', baseClass: 'nvcwidget'});
     * @constructor
     * @extends EDM.Widget
     */
    var NVC = EDM.NVC = function(vehicleApiKey, dealerApiKey, options) {

        var
            /**
             *
             * @property _tabContentElement
             * @type {HTMLDivElement}
             * @private
             */
            _tabContentElement,

            /**
             *
             * @property _tabsListElement
             * @type {HTMLDivElement}
             * @private
             */
            _tabsListElement,

            _dealerApiKey = dealerApiKey;

        this.getDealerApiKey = function() {
            return _dealerApiKey;
        };

        EDM.Widget.call(this, vehicleApiKey, options);
        _.extend(this, Backbone.Events);

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
                baseClass = me.getBaseClass(),
                rootElement = me.getRootElement(),
                options = this.getOptions(),
                VehicleApi = EDMUNDSAPI.Vehicle,
                apiKey = this.getApiKey(),
                dealerApiKey = this.getDealerApiKey(),
                //
                hasStyleId = false,
                isOptionsLoaded = false,
                //
                dealersOptions = {
                    radius: 100,
                    rows: 5,
                    isPublic: false,
                    //bookName: 'DealerLocatorRuleBook',
                    bookName: '',
                    apiKey: dealerApiKey,
                    premierOnly: true,
                    invalidTiers: 'T1',
                    keywords: options.dealerKeywords
                },
                defaultZipCode = this.zip = typeof options.zip === 'string' ? options.zip : '',
                hasZipCode = defaultZipCode ? true : false,
                nav = '';

            if (navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)) {
                nav = 'apple-device';
            }

            dealersOptions.zipcode = defaultZipCode;

            if (rootElement === null) {
                throw new Error('Root element was not found.');
            }

            // render from template
            rootElement.innerHTML = _.template(NVC.template, {
                titleTooltip: NVC.TOOLTIP_TITLE,
                baseId: baseId,
                nav: nav,
                baseClass: me.getBaseClass(),
                layoutType: options.layoutType
            });

            var button = document.getElementById(baseId + '_button'),
                button2 = document.getElementById(baseId + '_button2'),
                button3 = document.getElementById(baseId + '_button3'),
                //dealersRoot = document.getElementsByClassName()[0],
                dealersRoot = getElementsByClassName(baseClass + '-list-dealer', 'div', document)[0],
                rootList = document.getElementById(baseId + '_list_options'),
                rootPrice = document.getElementById(baseId + '_price'),
                zipLocationRoot = document.getElementById(baseId + '_zip_location'),
                zipMiRoot = document.getElementById(baseId + '_zip_mi'),
                vehicleFormRoot = document.getElementById(baseId + '_form'),
                tmvPriceSection = document.getElementById(baseId + '_tmvprice'),

                incentiveTurnedOn = false;

            // cache elements
            _tabsListElement   = $('#' + baseId + '_tabs').find('.tab');
            _tabContentElement = document.getElementById(baseId + '_tab_content');

            this.printEmailOptions = new Backbone.Model();

            // style configurator
            this.styleConfigurator = new EDM.VehicleStyleConfigurator({
                apiKey: apiKey,
                includedMakes: options.includedMakes
            });
            document.getElementById(baseId + '_filters').appendChild(this.styleConfigurator.render().el);

            // vehicle photos
            this.vehiclePhotos = new EDM.nvc.VehiclePhotos({
                vehicleApiKey: vehicleApiKey,
                colorScheme: options.colorScheme
            });
            document.getElementById(baseId + '_vehicle_details').appendChild(this.vehiclePhotos.render().el);
            // vehicle description
            this.vehicleDetails = new EDM.nvc.VehicleDetails();
            document.getElementById(baseId + '_vehicle_details').appendChild(this.vehicleDetails.el);
            this.vehicleDetails2 = new EDM.nvc.VehicleDetails();
            document.getElementById(baseId + '_vehicle_details2').appendChild(this.vehicleDetails2.el);
            this.vehicleDetails3 = new EDM.nvc.VehicleDetails();
            document.getElementById(baseId + '_vehicle_details3').appendChild(this.vehicleDetails3.el);
            // vehicle options
            this.vehicleFeaturesController = new EDM.controller.VehicleFeatures({
                vehicleApiKey: vehicleApiKey,
                baseId: baseId,
                zipCode: defaultZipCode
            });

            // zip field on first tab
            this.zipUpdate = new EDM.view.form.ZipUpdate({
                vehicleApiKey: vehicleApiKey,
                zipCode: defaultZipCode
            });
            $('#' + baseId + '_zip_configure').append(this.zipUpdate.render().el);

            // zip field on second tab
            this.zipLocation = new EDM.view.form.ZipLocation({
                vehicleApiKey: vehicleApiKey,
                zipCode: defaultZipCode
            });
            $(zipLocationRoot).html(this.zipLocation.render().el);

            // zip field on third tab
            this.zipMiField = new EDM.view.form.ZipMiField({
                el: $('#' + baseId + '_zip_mi'),
                vehicleApiKey: vehicleApiKey,
                zipCode: defaultZipCode,
                radius: dealersOptions.radius
            });
            this.zipMiField.render();

            // vehicle config for Lead Form
            this.configLeadForm = new EDM.nvc.ConfigLeadForm(apiKey);
            this.configLeadForm.setOption('zip', defaultZipCode);
            // vehicle price
            this.vehiclePrice = new EDM.nvc.VehiclePrice({
                el: rootPrice,
                vehicleApiKey: vehicleApiKey
            });
            // vehicle dealers
            //this.dealers = new EDM.nvc.VehicleDealers(dealersOptions.apiKey);

            this.dealers = new EDM.view.Dealers({
                el: $(dealersRoot)
            });
            this.dealers.searchCriteria.set({
                zipcode:    defaultZipCode,
                api_key:    dealerApiKey,
                keywords:   (options.dealerKeywords || []).join(',')
            }, { silent: true });
            this.dealers.render();

            // vehicle dialog
            this.messageDialog = new EDM.nvc.MessageDialog();

            // vehicle Form on third tab
            this.vehicleForm = new EDM.ui.VehicleForm();
            this.vehicleForm.render(vehicleFormRoot);
            this.vehicleApi = new VehicleApi(apiKey);

            function isEmpty(obj) {
                var key;
                for (key in obj){
                    return false;
                }
                return true;
            }

            function toggleButtonState() {
                if (hasStyleId && hasZipCode && isOptionsLoaded) {
                    button.removeAttribute('disabled');
                    return;
                }
                button.setAttribute('disabled', 'disabled');
            }

            button.onclick = function() {
                // show tab
                me.showTab(_tabsListElement[!options.tabs.tab2 ? 2 : 1]);
                me.vehiclePrice.updateGraph();
                me.trigger('nextbtn1.click');
            };

            button2.onclick = function() {
                me.showTab(_tabsListElement[2]);
                me.trigger('nextbtn2.click');
            };

            button3.onclick = function() {
                var config = me.configLeadForm.config,
                    options = {
                        isSuccess: true,
                        name: [config.year, config.makeName, config.model].join(' '),
                        dealers: []
                    },
                    queryParameters, xhr,
                    optdlr, opt,
                    dealersIds = [], optIds = [],
                    isEmptyDealer = isEmpty(config.dealers),
                    dealerApi = new EDMUNDSAPI.Vehicle(dealerApiKey);

                /** @override */
                dealerApi.submitLeadForm = function(queryParameters, successCallback, errorCallback) {
                    return $.ajax({
                        url: 'http://widgets.edmunds.com/dealer/sendlead',
                        data: _.defaults(queryParameters || {}, {
                            fmt:        'json',
                            'api_key':  dealerApiKey
                        }),
                        dataType: 'jsonp',
                        timeout: 7000,
                        traditional: true,
                        success: successCallback,
                        error: errorCallback
                    });
                };

                removeDealerMessageError();

                if (isEmptyDealer) {
                    $(button3).closest('.nvcwidget-nav-bottom-inner').prepend('<div class="msg-error">At least 1 dealer must be selected.</div>');
                    return;
                }

                config.dealers.each(function(dealer) {
                    dealersIds.push(dealer.get('id'));
                    options.dealers.push(dealer.get('name'));
                });

                queryParameters = {
                    // vehicle
                    'make':         config.make,
                    'model':        config.modelNiceName,
                    'year':         config.year,
                    'style':        config.styleid,
                    // options
                    'optIds':       config.options.join(','),
                    // dealers
                    'pqrf_sbmtdlr': dealersIds,
                    // zipcode
                    'zip':          config.zip,
                    // contacts
                    'firstname':    config.firstname,
                    'lastname':     config.lastname,
                    'email':        config.email,
                    // phone
                    'area_code':    config.phoneCode,
                    'phone_prefix': config.phonePrefix,
                    'phone_suffix': config.phoneSuffix,
                    // keys
                    'client_key':   EDM.util.ClientKeyGenerator.generate(16, 36)
                };

                function showMessage(options) {
                    rootElement.appendChild(me.messageDialog.render(options).el);
                    me.messageDialog.init();
                    me.messageDialog.on('reset', function() {
                        me.showTab(_tabsListElement[0]);
                        me.styleConfigurator.reset();

                        onZipUpdate.call(me, defaultZipCode);

                        me.vehicleForm.resetValues();
                        me.styleConfigurator.findMakes();
                        me.trigger('dialogbtn.click');
                        me.trigger('reset');
                    });
                }

                var btnText = button3.innerHTML;
                button3.setAttribute('disabled', 'disabled');
                button3.innerHTML = 'Getting dealer quotes...';

                function onSubmitSuccess(response) {
                    options.isSuccess = true;
                    showMessage(options);
                    button3.removeAttribute('disabled');
                    button3.innerHTML = btnText;
                    me.trigger('leadformsubmit');
                }

                function onSubmitError(response) {
                    options.isSuccess = false;
                    showMessage(options);
                    button3.removeAttribute('disabled');
                    button3.innerHTML = btnText;
                }

                dealerApi.submitLeadForm(queryParameters, onSubmitSuccess, onSubmitError);

                me.trigger('submitbtn.click');
            };

            this.styleConfigurator.on('complete', function(selection, options) {
                var make = selection.get('make'),
                    model = selection.get('model'),
                    year = selection.get('year'),
                    style = selection.get('style'),

                    makeName = make.get('name'),
                    makeNiceName = make.get('niceName'),
                    modelName = model.get('name'),
                    modelNiceName = model.get('niceName'),
                    styleId = style.get('id');
                // set dealer options
                dealersOptions.makeName = makeName;
                dealersOptions.model = modelName;
                dealersOptions.styleId = styleId;
                // set lead form options
                this.configLeadForm.setOption('make', makeNiceName);
                this.configLeadForm.setOption('makeName', makeName);
                this.configLeadForm.setOption('model', modelName);
                this.configLeadForm.setOption('modelNiceName', modelNiceName);
                this.configLeadForm.setOption('year', year.get('year'));
                this.configLeadForm.setOption('styleName', style.get('name'));
                this.configLeadForm.setOption('styleid', styleId);
                this.vehicleFeaturesController.setStyleId(styleId);

                if (this.zip) {
                    this.vehiclePhotos.loadPhotos(styleId); // wtf?? see below

                    //this.dealers.loadDealers(dealersRoot, dealersOptions);
                    this.dealers.searchCriteria.set({
                        makeName:   makeName,
                        model:      modelName,
                        styleid:    styleId
                    });

                    this.zipLocation.loadLocation();
                    this.vehiclePrice.loadPrice(styleId, this.zip, []);
                }

                this.resizeOptionsContainer();

                me.vehiclePhotos.loadPhotos(styleId); // wtf??

                isOptionsLoaded = false;
                hasStyleId = true;
                toggleButtonState();
                $(rootElement).find('.get-started').hide();
            }, this);

            this.styleConfigurator.on('error', function(errorText) {
                rootElement.appendChild(me.messageDialog.render({
                    isSuccess: false,
                    text: _.isString(errorText) ? errorText : '<p>Something went wrong!</p><p>Please return and try again or <a href="Mailto:api@edmunds.com">contact</a> us directly.</p>'
                }).el);
                me.messageDialog.init();
            });

            this.styleConfigurator.on('reset', function(options) {
                this.vehiclePhotos.reset();
                this.vehicleDetails.reset();
                this.vehicleFeaturesController.reset();
                this.configLeadForm.reset({
                    contacts: true,
                    zip: true
                });
                this.vehicleForm.resetValues();

                var dealerMsgError = getElementsByClassName('msg-error', 'div', button3.parentNode)[0];
                if (dealerMsgError) {
                    button3.parentNode.removeChild(dealerMsgError);
                }

                this.dealers.reset();

                hasStyleId = false;
                incentiveTurnedOn = false;
                setInitialTabsState();
                $(rootElement).find('.get-started').show();
            }, this);

            this.vehicleFeaturesController.on('updatestatus', function(response) {
                var styleId = this.configLeadForm.config.styleid,
                    zipCode = this.configLeadForm.config.zip,
                    features = this.vehicleFeaturesController.getSelectedOptionsIds();
                this.vehiclePrice.loadPrice(styleId, zipCode, features);
                this.configLeadForm.setOption('options', features);
            }, this);

            this.vehicleFeaturesController.on('load loaderror', function(response) {
                isOptionsLoaded = true;
                toggleButtonState();
                $(_tabsListElement[1]).removeClass('disable');
                $(_tabsListElement[2]).removeClass('disable');
            }, this);

            this.vehiclePrice.on('load', function(totalPrice, response) {
                var leadForm = me.configLeadForm.config,
                    basePrice = {
                        tmv:            response.tmv.nationalBasePrice.tmv,
                        baseMSRP:       response.tmv.nationalBasePrice.baseMSRP,
                        baseInvoice:    response.tmv.nationalBasePrice.baseInvoice
                    },
                    vehicleDescription = {
                        name: [leadForm.year, leadForm.makeName, leadForm.model].join(' '),
                        description: leadForm.styleName,
                        price: basePrice.baseMSRP
                    },
                    featuresTotalPrice, calculatedTotalPrice;

                if (hasStyleId) {
                    this.vehicleDetails.render(vehicleDescription, true);
                    this.vehicleDetails2.render(vehicleDescription, false);
                    this.vehicleDetails3.render(vehicleDescription, false);
                }

                if (!isOptionsLoaded) {
                    this.vehicleFeaturesController.getDefaultConfig({ previous: hasStyleId }).done(_.bind(function() {
                        this.updatePrices(response);
                    }, this));
                } else {
                    this.updatePrices(response);
                }

                toggleButtonState();

            }, this);

            this.updatePrices = function(response) {
                var basePrice = {
                        tmv:            response.tmv.nationalBasePrice.tmv,
                        baseMSRP:       response.tmv.nationalBasePrice.baseMSRP,
                        baseInvoice:    response.tmv.nationalBasePrice.baseInvoice
                    },
                    leadForm = this.configLeadForm.config,
                    vehicleDescription = {
                        name: [leadForm.year, leadForm.makeName, leadForm.model].join(' '),
                        description: leadForm.styleName
                    },
                    featuresTotalPrice, calculatedTotalPrice;

                this.vehicleFeaturesController.selectedFeatures.collection.updatePrices(response.tmv);
                this.vehicleFeaturesController.selectedFeatures.setBasePrice(basePrice);

                featuresTotalPrice = this.vehicleFeaturesController.selectedFeatures.collection.getTotalPrice();
                calculatedTotalPrice = {
                    tmv:            basePrice.tmv + featuresTotalPrice.tmv,
                    baseMSRP:       basePrice.baseMSRP + featuresTotalPrice.baseMSRP,
                    baseInvoice:    basePrice.baseInvoice + featuresTotalPrice.baseInvoice
                };

                // incentives
                var $incentivesEl = $(rootElement).find('.incentives').hide();

                if (response.tmv.incentivesAndRebates > 0) {
                    var incentives = new EDM.view.IncentivesAndRebates({
                        el: $incentivesEl,
                        turnedOn: incentiveTurnedOn,
                        incentive: response.tmv.incentivesAndRebates
                    });
                    incentives.on('change', function(turnedOn) {
                        var value = response.tmv.incentivesAndRebates * (turnedOn ? -1 : 1);
                        incentiveTurnedOn = turnedOn;
                        calculatedTotalPrice.tmv += value;
                        $(tmvPriceSection).html('True Market Value<sub>&reg;</sub>:&nbsp;<sub class="currency">$</sub><span class="price">' + _.formatNumber(calculatedTotalPrice.tmv) + '</span>');
                        this.vehiclePrice.render({
                            tmv:        calculatedTotalPrice.tmv,
                            invoice:    calculatedTotalPrice.baseInvoice,
                            msrp:       calculatedTotalPrice.baseMSRP
                        });
                    }, this);
                    incentives.render();
                    $incentivesEl.show();
                    if (incentiveTurnedOn) {
                        calculatedTotalPrice.tmv -= response.tmv.incentivesAndRebates;
                    }
                }

                $rootElement.find('.tab-2')[response.tmv.incentivesAndRebates > 0 ? 'addClass' : 'removeClass']('with-insentive'); // temporary class

                $(tmvPriceSection).html('True Market Value<sub>&reg;</sub>:&nbsp;<sub class="currency">$</sub><span class="price">' + _.formatNumber(calculatedTotalPrice.tmv) + '</span>');
                this.vehiclePrice.render({
                    tmv:        calculatedTotalPrice.tmv,
                    invoice:    calculatedTotalPrice.baseInvoice,
                    msrp:       calculatedTotalPrice.baseMSRP
                });


                // print and email options
                this.printEmailOptions.set({
                    vehicleFullName:    vehicleDescription.name,
                    vehicleStyleName:   vehicleDescription.description,
                    totalPrice:         calculatedTotalPrice,
                    basePrice:          basePrice,
                    customerCashPrice:  response.tmv.incentivesAndRebates
                });

                this.configLeadForm.setOption('price', calculatedTotalPrice);
            };

            this.vehiclePrice.on('loaderror', function(totalPrice, response) {
                rootElement.appendChild(me.messageDialog.render({
                    isSuccess: false,
                    text: '<p>Something went wrong!</p><p>Please return and try again or <a href="Mailto:api@edmunds.com">contact</a> us directly.</p>'
                }).el);
                me.messageDialog.init();
            });

            function removeDealerMessageError() {
                $(button3).closest('.nvcwidget-nav-bottom-inner').find('.msg-error').remove();
            }

            function onZipUpdate(zipCode, radius) {
                hasZipCode = true;

                dealersOptions.zipcode = zipCode;
                this.configLeadForm.setOption('zip', zipCode);
                this.vehicleFeaturesController.setZipCode(zipCode);
                this.zipUpdate.updateZipCode(zipCode);
                this.zipLocation.updateZipCode(zipCode);
                this.zipMiField.updateZipCode(zipCode);

                //this.dealers.loadDealers(dealersRoot, dealersOptions);
                this.dealers.searchCriteria.unset('zipcode', { silent: true }).set('zipcode', zipCode);

                removeDealerMessageError();

                this.zip = zipCode;

                if (hasStyleId) {
                    this.vehiclePrice.loadPrice(this.configLeadForm.config.styleid, zipCode, this.vehicleFeaturesController.getSelectedOptionsIds());
                }
            }

            this.zipUpdate.on('update', onZipUpdate, this);
            this.zipLocation.on('update', onZipUpdate, this);
            this.zipMiField.on('update', function(zipCode, radius) {
                this.configLeadForm.setOption('radius', radius); // ???
                //dealersOptions.radius = radius;
                this.dealers.searchCriteria.set('radius', radius, { silent: true });
                onZipUpdate.call(this, zipCode);
            }, this);

            this.dealers.on('select', function() {
                this.configLeadForm.setOption('dealers', this.dealers.getSelected());
                button3.disabled = !this.configLeadForm.validate();
                removeDealerMessageError();
            }, this);

            this.dealers.on('deselect', function() {
                this.configLeadForm.setOption('dealers', this.dealers.getSelected());
            }, this);

            this.vehicleForm.on('update-request-form', function(field){
                this.configLeadForm.setOption(field.name, field.value);
            }, this);

            this.configLeadForm.on('readytosubmit', function(isValidLeadForm){
                button3.disabled = !isValidLeadForm;
            }, this);

            var $rootElement = $(rootElement);
            $rootElement.find('.tab-2 .email-print-icons [data-action]').click(function() {
                var action = $(this).data('action'),
                    tpl = new EDM.PrintEmailTemplate(),
                    options = {
                        vehicleFullName:    me.printEmailOptions.get('vehicleFullName'),
                        vehicleStyleName:   me.printEmailOptions.get('vehicleStyleName'),
                        features:           me.vehicleFeaturesController.selectedFeatures.collection,
                        basePrice:          me.printEmailOptions.get('basePrice'),
                        totalPrice:         me.printEmailOptions.get('totalPrice'),
                        customerCashPrice:  me.printEmailOptions.get('customerCashPrice')
                    },
                    email;
                switch (action) {
                    case 'email':
                        email = prompt('Please enter e-mail address:');
                        if (email) {
                            tpl.sendConfiguration(vehicleApiKey, email, options);
                        }
                        break;
                    case 'print':
                        options.print = true;
                        tpl.printConfiguration(options);
                        break;
                }
            });
            $rootElement.find('.tab-3 .email-print-icons [data-action]').click(function() {
                var action = $(this).data('action'),
                    tpl = new EDM.PrintEmailTemplate(),
                    options = {
                        vehicleFullName:    me.printEmailOptions.get('vehicleFullName'),
                        vehicleStyleName:   me.printEmailOptions.get('vehicleStyleName'),
                        premierDealers:     me.dealers.premierDealers.collection,
                        allDealers:         me.dealers.allDealers.collection,
                        basePrice:          me.printEmailOptions.get('basePrice'),
                        totalPrice:         me.printEmailOptions.get('totalPrice'),
                        customerCashPrice:  me.printEmailOptions.get('customerCashPrice')
                    },
                    email;
                switch (action) {
                    case 'email':
                        email = prompt('Please enter e-mail address:');
                        if (email) {
                            tpl.sendPriceQuotes(vehicleApiKey, email, options);
                        }
                        break;
                    case 'print':
                        options.print = true;
                        tpl.printPriceQuotes(options);
                        break;
                }
            });

            function setInitialTabsState() {
                toggleButtonState();
                _tabsListElement.eq(1).addClass('disable');
                _tabsListElement.eq(2).addClass('disable');
            }

            // TODO 'each' function
            _tabsListElement.eq(0).click(function() {
                if (!$(this).hasClass('disable')) {
                    me.trigger('tab:show', this, 'Configure Tab');
                    me.trigger('tab1.click');
                }
            });
            _tabsListElement.eq(1).click(function() {
                if (!$(this).hasClass('disable')) {
                    me.trigger('tab:show', this, 'TMV Tab');
                    me.trigger('tab2.click');
                }
            });
            _tabsListElement.eq(2).click(function() {
                if (!$(this).hasClass('disable')) {
                    me.trigger('tab:show', this, 'Price Quote Tab');
                    me.trigger('tab3.click');
                }
            });

            this.bindEvents();

            this.zipUpdate.disable();

            // configure tabs
            var tabsEl = $(rootElement).find('.nvcwidget-tabs');

            tabsEl.find('.tab1 .tab-text').html(options.tabs.tab1 ? options.tabs.tab1 : 'Configure');
            tabsEl.find('.tab2 .tab-text').html(options.tabs.tab2 ? options.tabs.tab2 : 'TMV&reg;');
            tabsEl.find('.tab3 .tab-text').html(options.tabs.tab3 ? options.tabs.tab3 : 'Price Quotes');

            if (_.isString(options.tabs.tab1) && _.isString(options.tabs.tab2) && _.isNull(options.tabs.tab3)) {
                tabsEl.addClass('tab-layout-2');
                tabsEl.find('.tab3').hide();
                $(button2).closest('.nvcwidget-top-footer').hide();
            }

            if (_.isString(options.tabs.tab1) && _.isNull(options.tabs.tab2) && _.isString(options.tabs.tab3)) {
                tabsEl.addClass('tab-layout-2');
                tabsEl.find('.tab2').hide();
                $(button).text('Get Price Quote');
            }

            if (apiKey && dealerApiKey && hasZipCode) {
                this.styleConfigurator.findMakes();
                this.zipUpdate.enable();
            }

            return this;
        };

        /**
         *
         * @method showTab
         * @chainable
         */
        this.showTab = function(element) {
            var id = element.id.split('-').pop(),
                baseId = this.getBaseId(),
                baseClass = this.getBaseClass(), i,
                listContentElement = getElementsByClassName(baseClass+'-tab-inner', '', _tabContentElement),
                length = listContentElement.length;
            for (i = 0; i < length; i = i + 1) {
                $(listContentElement[i]).addClass('hide');
            }
            _tabsListElement.removeClass('active');
            $(element).addClass('active');
            $('#' + baseId + '_' + id).removeClass('hide');
            this.trigger(id + ':showed');
            return this;
        };

    };
