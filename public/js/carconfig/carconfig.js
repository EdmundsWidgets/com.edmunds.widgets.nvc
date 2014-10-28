(function(EDM, $, _, Backbone) {
    'use strict';

var isIE = navigator.appName === 'Microsoft Internet Explorer' ? true : false;
/*
    Developed by Robert Nyman, http://www.robertnyman.com
    Code/licensing: http://code.google.com/p/getelementsbyclassname/
*/
var getElementsByClassName = function (className, tag, elm){
    if (document.getElementsByClassName) {
        getElementsByClassName = function (className, tag, elm) {
            elm = elm || document;
            var elements = elm.getElementsByClassName(className),
                nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
                returnElements = [],
                current;
            for(var i=0, il=elements.length; i<il; i+=1){
                current = elements[i];
                if(!nodeName || nodeName.test(current.nodeName)) {
                    returnElements.push(current);
                }
            }
            return returnElements;
        };
    }
    else if (document.evaluate) {
        getElementsByClassName = function (className, tag, elm) {
            tag = tag || "*";
            elm = elm || document;
            var classes = className.split(" "),
                classesToCheck = "",
                xhtmlNamespace = "http://www.w3.org/1999/xhtml",
                namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
                returnElements = [],
                elements,
                node;
            for(var j=0, jl=classes.length; j<jl; j+=1){
                classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
            }
            try {
                elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
            }
            catch (e) {
                elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
            }
            while ((node = elements.iterateNext())) {
                returnElements.push(node);
            }
            return returnElements;
        };
    }
    else {
        getElementsByClassName = function (className, tag, elm) {
            tag = tag || "*";
            elm = elm || document;
            var classes = className.split(" "),
                classesToCheck = [],
                elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
                current,
                returnElements = [],
                match;
            for(var k=0, kl=classes.length; k<kl; k+=1){
                classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
            }
            for(var l=0, ll=elements.length; l<ll; l+=1){
                current = elements[l];
                match = false;
                for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
                    match = classesToCheck[m].test(current.className);
                    if (!match) {
                        break;
                    }
                }
                if (match) {
                    returnElements.push(current);
                }
            }
            return returnElements;
        };
    }
    return getElementsByClassName(className, tag, elm);
};


/* This function makes a div scrollable with android and iphone */

function isTouchDevice(){
    /* Added Android 3.0 honeycomb detection because touchscroll.js breaks
        the built in div scrolling of android 3.0 mobile safari browser */
    if((navigator.userAgent.match(/android 3/i)) ||
        (navigator.userAgent.match(/honeycomb/i)))
        return false;
    try{
        document.createEvent("TouchEvent");
        return true;
    }catch(e){
        return false;
    }
}

_.mixin({
    currency: function(value) {
        if (value < 0) {
            value *= -1;
            return '($' + _.formatNumber(value) + ')';
        }
        return '$' + _.formatNumber(value);
    },
    formatNumber: function(value) {
        return (Number(value) || 0).toString().split(/(?=(?:\d{3})+(?:\.|$))/g).join(',');
    },
    rgb2hex: function(obj) {
        function hex(value) {
            return Number(value).toString(16).replace(/^(.)$/,'0$1');
        }
        return '#' + hex(obj.r) + hex(obj.g) + hex(obj.b);
    }
});
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

    /**
     * `template` HTML template - widget view
     * @property template
     * @static
     * @type {HTMLDivElement}
     */
    NVC.template = [
        '<div class="<%= baseClass %>-inner <%= nav %>">',
            '<div class="<%= baseClass %>-header noise-bg">',
                '<div>',
                    '<span class="title">NEW VEHICLE CONFIGURATOR</span>',
                    '<span class="question" onclick="">',
                        '<sup>?</sup>',
                        '<div class="nvcwidget-tooltip"><div class="arrow-left"></div><%= titleTooltip %></div>',
                    '</span>',
                '</div>',
                // new widget header
                /*
                '<div class="widget-header">',
                    '<i class="icon-about"></i>',
                    '<h1>New Vehicle Configurator</h1>',
                '</div>',
                */
            '</div>',
            '<div class="<%= baseClass %>-tabs" id="<%= baseId %>_tabs">',
                '<div class="tab tab1 active" id="<%= baseId %>-tab1"><span class="tab-text">Configure</span></div>',
                '<div class="tab tab2 disable" id="<%= baseId %>-tab2"><span class="tab-text">TMV&reg;</span></div>',
                '<div class="tab tab3 disable" id="<%= baseId %>-tab3"><span class="tab-text">Price Quotes</span></div>',
            '</div>',
            '<div class="<%= baseClass %>-tab-content" id="<%= baseId %>_tab_content">',
                // tab 1
                '<div class="<%= baseClass %>-tab-inner tab-1" id="<%= baseId %>_tab1">',
                    '<div class="noise-bg"><div class="bottom-shadow clearfix">',
                        '<% if (layoutType === "narrow") { %>',
                            '<div class="<%= baseClass %>-filters">',
                                '<div class="filters" id="<%= baseId %>_filters"></div>',
                                '<div class="zip-code" id="<%= baseId %>_zip_configure"></div>',
                            '</div>',
                            '<div class="<%= baseClass %>-image" id="<%= baseId %>_vehicle_details"></div>',
                        '<% } else { %>',
                            '<div class="<%= baseClass %>-image" id="<%= baseId %>_vehicle_details"></div>',
                            '<div class="<%= baseClass %>-filters">',
                                '<div class="filters" id="<%= baseId %>_filters"></div>',
                                '<div class="zip-code" id="<%= baseId %>_zip_configure"></div>',
                            '</div>',
                        '<% } %>',
                    '</div></div>',
                    '<div class="<%= baseClass %>-options-outer">',
                        '<div class="get-started">',
                            '<h1>Get Started</h1>',
                            '<p>Select <strong>Make</strong>, <strong>Model</strong>, <strong>Year</strong> and <strong>Style</strong> to get full list of available options</p>',
                            '<div class="arrow"></div>',
                        '</div>',
                        '<div class="<%= baseClass %>-options" id="<%= baseId %>_options"></div>',
                        '<div class="category-features-list" id="<%= baseId %>_category_features_list"></div>',
                    '</div>',
                    '<div class="<%= baseClass %>-nav-bottom">',
                        '<button type="button" disabled="disabled" id="<%= baseId %>_button" class="button-block">Get Price</button>',
                    '</div>',
                '</div>',
                // tab 2
                '<div class="<%= baseClass %>-tab-inner tab-2 hide" id="<%= baseId %>_tab2">',
                    '<div class="<%= baseClass %>-inner-header">',
                        '<div class="<%= baseClass %>-image" id="<%= baseId %>_vehicle_details3"></div>',
                    '</div>',
                    '<div class="shadow-top noise-bg">',
                        '<div class="<%= baseClass %>-body">',

                            '<div class="<%= baseClass %>-inner-zip zip-location" id="<%= baseId %>_zip_location"></div>',

                            '<div class="w1">',
                                '<% if (layoutType === "narrow" || layoutType === "medium") { %>',
                                '<div class="<%= baseClass %>-list-options" id=<%= baseId %>_list_options></div>',
                                '<div class="w2">',
                                    '<div class="<%= baseClass %>-price" id="<%= baseId %>_price"></div>',
                                    '<div class="incentives"></div>',
                                '</div>',
                                '<% } else { %>',
                                '<div class="w2">',
                                    '<div class="<%= baseClass %>-price" id="<%= baseId %>_price"></div>',
                                    '<div class="incentives"></div>',
                                '</div>',
                                '<div class="<%= baseClass %>-list-options" id=<%= baseId %>_list_options></div>',
                                '<% } %>',
                            '</div>',

                            '<ul class="email-print-icons">',
                                '<li data-action="email"><i class="icon-email"></i>e-mail</li>',
                                '<li data-action="print"><i class="icon-print"></i>print</li>',
                            '</ul>',

                        '</div>',
                    '</div>',
                    '<div class="<%= baseClass %>-top-footer"><button type="button" id="<%= baseId %>_button2">GET PRICE QUOTE</button><span>Next Step</span></div>',
                '</div>',
                // tab 3
                '<div class="<%= baseClass %>-tab-inner tab-3 hide" id="<%= baseId %>_tab3">',
                    '<div class="<%= baseClass %>-inner-header">',
                    '<% if (layoutType === "narrow") { %>',
                        '<div class="<%= baseClass %>-image" id="<%= baseId %>_vehicle_details2"></div>',
                        '<div class="tmvprice" id="<%= baseId %>_tmvprice"></div>',
                    '<% } else { %>',
                        '<div class="tmvprice" id="<%= baseId %>_tmvprice"></div>',
                        '<div class="<%= baseClass %>-image" id="<%= baseId %>_vehicle_details2"></div>',
                    '<% } %>',
                    '</div>',
                    '<div class="shadow-top noise-bg">',
                        '<div class="<%= baseClass %>-body">',
                            '<div class="<%= baseClass %>-inner-zip" id="<%= baseId %>_zip_mi"></div>',
                            '<div class="<%= baseClass %>-list-dealer">',
                                '<div class="tab-bar">',
                                    '<ul class="navbar">',
                                        '<li class="tab tab-premier active" data-tab-id="premier"><div><div><span>Premier Dealers</span></div></div></li>',
                                        '<li class="tab" data-tab-id="all"><div><div><span>All Dealers</span></div></div></li>',
                                    '</ul>',
                                    '<div class="tab-strip"></div>',
                                '</div>',
                                '<div class="tab-content">',
                                    '<div class="tab-panel tab-panel-premier active"></div>',
                                    '<div class="tab-panel tab-panel-all"></div>',
                                '</div>',
                            '</div>',
                            '<ul class="email-print-icons">',
                                '<li data-action="email"><i class="icon-email"></i>e-mail</li>',
                                '<li data-action="print"><i class="icon-print"></i>print</li>',
                            '</ul>',
                        '</div>',
                    '</div>',
                    '<div class="<%= baseClass %>-top-footer" id="<%= baseId %>_form">',
                    '</div>',
                    '<div class="<%= baseClass %>-nav-bottom">',
                        '<div class="<%= baseClass %>-nav-bottom-inner">',
                            '<div class="button-wrapper">',
                                '<button type="button" disabled class="button-green" id="<%= baseId %>_button3">GET DEALER QUOTE</button>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',

            '</div>',
            '<div class="<%= baseClass %>-footer">',
                '<a href="http://developer.edmunds.com/tmv_widget_terms" class="copy" target="_blank">Legal Notice</a>',
                '<div class="logo">Built by<a href="http://www.edmunds.com/" target="_blank"></a></div>',
            '</div>',
        '</div>'
    ].join('');

    /**
     * @property TOOLTIP_TITLE
     * @static
     * @final
     * @type {String}
     */
    NVC.TOOLTIP_TITLE        = 'The New Vehicle Configurator is a tool that helps you customize a new vehicle, see what others in your area are paying for it on average, and get a FREE price quote from a dealership near you.';

    /**
     * @property TOOLTIP_TMV
     * @static
     * @final
     * @type {String}
     */
    NVC.TOOLTIP_TMV          = 'The Edmunds.com TMV® (Edmunds.com True Market Value®) price is the average price that others have paid for this car in the zip code provided.';

    /**
     * @property TOOLTIP_INVOICE
     * @static
     * @final
     * @type {String}
     */
    NVC.TOOLTIP_INVOICE      = 'This is the price the dealer paid for this car, including destination charges.';

    /**
     * @property TOOLTIP_MSRP
     * @static
     * @final
     * @type {String}
     */
    NVC.TOOLTIP_MSRP         = 'This is the price the manufacturer recommends selling the car for. Most consumers end up purchasing their car for less than MSRP.';

    /**
     * @property TOOLTIP_TRADEIN
     * @static
     * @final
     * @type {String}
     */
    NVC.TOOLTIP_TRADEIN      = 'This is the amount you can expect to receive when you trade in your used car and purchase a new car. The trade-in price is usually credited as a down payment on the new car.';

    /**
     * @property TOOLTIP_PRIVATEPARTY
     * @static
     * @final
     * @type {String}
     */
    NVC.TOOLTIP_PRIVATEPARTY = 'This is the amount at which the car is sold to or purchased by a private party, not a car dealer. This amount is usually more than the trade-in price but less than the dealer retail price.';

    /**
     * @property TOOLTIP_TMVRETAIL
     * @static
     * @final
     * @type {String}
     */
    NVC.TOOLTIP_TMVRETAIL    = 'This is the average price that others have paid for this car in the zip code provided. Dealer retail will usually be higher than private party prices and much higher than trade-in prices.';


    /**
     * @property TOOLTIP_CUSTOMERCASH
     * @static
     * @final
     * @type {String}
     */
    NVC.TOOLTIP_CUSTOMERCASH    =  'Rebates provided by the manufacturer directly to the customer at the time the vehicle is purchased to lower the final price of the vehicle. Consumers usually may elect to either receive this amount in cash or to credit the rebate as part of the vehicle\'s down payment.';

EDM.namespace('util').ClientKeyGenerator = (function() {

    var math = Math;

    function randomNumber(from, to) {
        return math.floor(math.random() * (to - from + 1) + from);
    }

    function randomCharacters(length, radix) {
        var str = [],
            i = 0,
            c;
        for ( ; i < length; i++) {
            c = randomNumber(0, radix - 1);
            str[i] = c.toString(radix);
        }
        return str;
    }

    function generateKey(length, radix) {
        var tokenChars = randomCharacters(length, radix),
            sum = 0,
            i = 0,
            index = 1,
            next = 2,
            prev;
        while (next < length) {
            sum += parseInt(tokenChars[index], radix) ^ ++i;
            prev = index;
            index = next;
            next = prev + index;
        }
        tokenChars[index] = (sum % radix).toString(radix);
        return tokenChars.join('');
    }

    return {

        generate: generateKey

    };

}());

EDM.PrintEmailTemplate = function(options) {
    var documentBody = document.body,
        iframeElement, iframeWindow, iframeDocument,

        SEND_EMAIL_ADDRESS      = 'http://api.edmunds.com/api/emp/esp/sendEmail',
        EMAIL_FROM_ADDRESS      = 'api@edmunds.com',
        EMAIL_FROM_NICE_NAME    = 'Edmunds.com',
        EMAIL_REPLY_ADDRESS     = 'api@edmunds.com',
        EMAIL_SUBJECT           = 'Your New Vehicle Configuration Details';

    function createIframe() {
        iframeElement = document.createElement('iframe');
        iframeElement.style.display = 'none';
        documentBody.appendChild(iframeElement);
        iframeWindow = iframeElement.contentWindow;
        iframeDocument = iframeElement.contentDocument || iframeWindow.document;
    }

    function writeIframeContent(content) {
        if (iframeDocument) {
            iframeDocument.open();
            iframeDocument.write(content);
            iframeDocument.close();
        }
    }

    function removeIframe() {
        documentBody.removeChild(iframeElement);
        iframeElement = iframeWindow = iframeDocument = undefined;
    }

    this.printConfiguration = function(options) {
        var iframeContent = this.getConfigurationHTML(options);
        createIframe();
        writeIframeContent(iframeContent);
        iframeWindow.print();
        removeIframe();
    };

    this.printPriceQuotes = function(options) {
        var iframeContent = this.getPriceQuotesHTML(options);
        createIframe();
        writeIframeContent(iframeContent);
        iframeWindow.print();
        removeIframe();
    };

    this.sendConfiguration = function(vehicleApiKey, email, options) {
        $.ajax({
            url:    SEND_EMAIL_ADDRESS,
            type:   'POST',
            data: {
                api_key:        vehicleApiKey,
                fromAddress:    EMAIL_FROM_ADDRESS,
                fromNiceName:   EMAIL_FROM_NICE_NAME,
                toAddress:      email,
                replyToAddress: EMAIL_REPLY_ADDRESS,
                emailSubject:   EMAIL_SUBJECT,
                emailBody:      this.getConfigurationBodyHTML(options)
            }
        });
    };

    this.sendPriceQuotes = function(vehicleApiKey, email, options) {
        $.ajax({
            url:    SEND_EMAIL_ADDRESS,
            type:   'POST',
            data: {
                api_key:        vehicleApiKey,
                fromAddress:    EMAIL_FROM_ADDRESS,
                fromNiceName:   EMAIL_FROM_NICE_NAME,
                toAddress:      email,
                replyToAddress: EMAIL_REPLY_ADDRESS,
                emailSubject:   EMAIL_SUBJECT,
                emailBody:      this.getPriceQuotesBodyHTML(options)
            }
        });
    };

};

EDM.PrintEmailTemplate.prototype = {

    getLogoSection: function(useData) {
        var data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG0AAAAgCAYAAAAYPvbkAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAACPVJREFUeNrsmn2wFlUdxz/3ci8XuIj4grwoxWUg7thihI0PJEpLiu4kCEMqvqdSITM2S4VmE4b5gqFOa1A5VqPmpOTgoDd1IZMFQmvJFG2VQEAEEVHeFC5wLy/2x/Pdy+HwvF0cFeX5zew8e3bPnt3z+57f2/c8FZTlo4sXVAO1ee52Airz3KsAOgLLCP3mUl9XUdZ4QTAuBG4CTjKuHlUAhEOV94FJhP7vjXffAFyg1oWE/qoyaMUBmwRMA/YALwI7dTRZPfcC24z2MGAF8KbAyCdNGu9EYDRwHHAjoX8HXvA94Ab1+zvQm9A/O32wqoxOTsBGC7AI+A6hv6ZI/zHAb4EaucnjgIHAJuBMQn9dked/BDwMTMULVgDHAFuM4wApg3awAk8EHgDmAiNLjDWnASfk0OvRQHe8YANwusBIpQOwG4gI/Y1aKLOBPwCnAKcCq4CzgF9+bmNa5GSqgO5AG6DZTeK3DwG0BmAAMIDQ34wXnANMN0DpAFQDzcAcYKzeN0LuzpQNhP4/8YIngW/leeNGoJ7Q34QXdAZeBl4h9EfgBacCW8x4dsiWFjmZmUA3Nce5SbziMMHtFOA/On8F+EorARsu5Z9H6G/W1ZuBvjl6twVGAkMJ/TnAIwVGHlLg3vGAAywg9LfiBeOBp/GCcxUbp+EFNbLKrcDsQ3WPg4Av6rzjYWRs+4zzo1sJWCVwFzCX0H/KuNOuyJPtSnzDWmAGsFAW2Q+4Qha43+OFfogXzAHuBJYAY6xxLq6kLLSk1dAf+EWO7LCQfFjC2I8B52mxz1M2eiPwIHA58IHV/+eyvstyLZJyIrJffgLEhP7zhuV1A1YqE8wnU/CCiUYN10bnaXmQpvbzrURkAPCostSNil/rgXcI/cV4waI8bnVVGbQsQMMU/xbgBbO0ynsr4SgmAz7i26/XkcoevGCdAf48udT3gUZg7qGCtvNTzBDbuEm817rWTkVwoed6AJ2BN90kbjQAawP8TK2hh8ESqjLyBYA64Aqz1qvShCqBi1QTVACPu0ncYEz4JNE5XYF7LFagJnIy04yU+CZlVZcCG4Brpay7gD7ADDeJp0dO5j61K4FxckW3aoxFwLPAr9R+QXVTAHSLnMx0N4n9yMlUAL8DvitW4rYcYJ0O3AecnMaoyMnMBi5xk3g3MAVwS1DmarmzLdLVAMW7vwCx5ngxUK/+D+qZzsD3gbuB14CJsuqpmtcPpPd8Ugf8ETi3pU7TxB9WvWFK4CbxRAH6slwGwC6Zale1XRWj6ep4SME1lQZgMNDFCOwnKBinz3wV6KXiEuAJjZm21wA9rBKlJ3Am8Gfj2i4jm3tPQK0kS9qa8ribxKPxgi7K6mqKAPY3YBShv1PWOQWYrNIgNKy2rZF0uIT+fLygF/A1Qn+W+vRRe6bavYA3Slg0gwn9f6FV/m0DsJdU3wD4kZMZCAw3AEs5s64FBr/cao80AEO++uQiWZnttr+Qo08fWXMqS7RyzTrKNQBbCpwhy5yka2NLAKxZVNZOvKBalFUfYGYLYF5Qjxd0EnsyXjVVmsKvFn+YtlcAi7QzkN7fXgJol6QnlcBVRo0zXEpOZYwmmsocrfh3rAEbjfOphlsDeBv4MrDZqqFMktUuPeza7w0pf6VxrbMsNJUfAlcWiL3dgE5uEk8wyICzSlDWPwj99UYqPkuLpUGAVQPPAbcIhHXAYsP62gPr8QKTEXnVSudLAW2YqayM4VqGSBFpUO9NloVucRNuEu/QR5qy23IlC432624Svwb8z7hmZ2WdinzwGjeJdwJv5WATUkncJF4F7DCuzVdcRen2U5GTmacYbWd+ywX8VQImFfO7z7EWUhpzjhX/mMoyY441ctldrPl2s7wXSvmvlmc7X54vlfrUOqv0wpRTm52DqmlvtLcY1lNIdpd4rZA0lZhp2eM3ai64Sbw9cjLfFMXU34jBjwJfNxbkEmAIoZ96jAe0n3WHZQXtLbdpfkN7y8Jri3y77ZZ3Ad8g9Je3WKMXRPq23gor3YE1lZaSbraOh3K4tdQ1FZLGEvjNfa0oKzoWIFtT6R45mbbGIkTAvSrvcZ0Z1McPvrLOqIWmGoClcre4PnMD9CXL3ab01D5rIXcpMrdc5ckzBmBp/NsmDMyQQCVZ+j9NEG4Dbleqmh5rLc7R/C0FwHwK32QlGj0LWFlVHmtdapxfppS7jTEfIiczQiGgwbAOjtnXVJ0H/FRhewSaK3YEUU/3quAdbCj2duDXimEVln5Sqc2zqIvRYXtsXVYCTxuK+TEwAbhfRz9ggfHQ2MjJxHlY72KyrYDC71cNlsq/S7DgSsAkdn+qMqFlgpGT6aKxnyO7k9xW91ZOPXbQu0bfUTlYkrQM6aE4A6H/FqF/LfBXYJy2UiD0J4vpRzVcrmy3GLsyHC+os76hg0jlA1xylbivSxWobzc6vCel7FBg7afrp8kSaoqYOwWI11ox3tco/phu+l3gN8b78kknFc0TDVf1urWgBosPtGPrBGsRXaeNynu0MIZaC2C6tkf+pLnWCcxnteu8WKFjjPQJ4OAFWw1P0x8vGGUAWK92+ueedqLRrtd4fUVe97UXbZWbxGsjJ+NKiSlB+V/gGjeJt8vFXKAitl7uoZbszmqzXMsiI2DvYP8GYZORZcXGy9e7Sbw8cjKDVDN9SaC+ANzpJvH6yMnUSokAKYUzU4EZYImbxFsjJ3OGsr5m9T/fiGcNkZOpUy3aW4nUI24SLyeJkVJT936r2JHmNJExmXXpZ4Z1fSDZvyTkklus9tUtFrvfIi+y+vSk8L7cZrB2riMnUwNUp2AdAUTxi1atdzhLI6Hf8aDMzk3iphJT7c+LLP0MgbY0HxNxpMnCz9C3LihWQx0p8qQSk+pWPLMvRyZsJjmNBTjMHXnuHW8xTwfXcNksmINi2hEpXnAU8DwHkuKmPEHoj/qYv8G3+Fpb6kQsl92jURzv/ZS/4oPWdC6DVpiN+KRkd2vul0E7mJ2xZfUn8P7F5OdiV9h/Ky+DlpXJZP/k+qHF8jxDjr8wfAwuehnZ3e7HlCXOI7t7fy9wtt39/wMAY0mt3wL085sAAAAASUVORK5CYII=',
            url = 'http://static.ed.edmunds-media.com/unversioned/img/logo.png',
            src = useData ? data : url;
        return '<img src="' + src + '" alt="Edmunds.com" height="36" width="109" />';
    },

    getDescriptionSection: function(vehicleFullName, vehicleStyleName) {
        return [
            '<div class="vehicle-description">',
                '<div class="name">' + vehicleFullName + '</div>',
                '<div>' + vehicleStyleName + '</div>',
            '</div>'
        ].join('');
    },

    getPricesSection: function(totalPrice) {
        return [
            '<h2>New Car Prices</h2>',
            '<div class="prices">',
                '<div class="note">* Price as configured</div>',
                (totalPrice.baseMSRP ? '<div>MSRP: ' + _.currency(totalPrice.baseMSRP) + '</div>': ''),
                (totalPrice.baseInvoice ? '<div>Invoice: ' + _.currency(totalPrice.baseInvoice) + '</div>': ''),
                (totalPrice.tmv ? '<div><b>True Market Value<sup>&reg</sup>: ' + _.currency(totalPrice.tmv) + '</b></div>': ''),
            '</div>'
        ].join('');
    },

    getIncentivesSection: function(customerCashPrice) {
        if (customerCashPrice > 0) {
            return [
                '<h2>Incentives</h2>',
                '<div class="incentives">Customer Cash: ' + _.currency(customerCashPrice) + '</div>'
            ].join('');
        }
        return '';
    },

    getFeaturesSection: function(features, basePrice) {
        var html = [
            '<h2>Your selected options</h2>',
            '<table class="table-features">',
                '<thead>',
                    '<tr>',
                        '<th>Description</th>',
                        '<th class="price">MSRP</th>',
                    '</tr>',
                    '<tr>',
                        '<th>Base Price</th>',
                        '<th class="price">' + _.currency(basePrice.baseMSRP) + '</th>',
                    '</tr>',
                '</thead>',
                '<tbody>'
        ].join('');
        if (features) {
            features.each(function(feature) {
                var baseMSRP = feature.get('price').baseMSRP;
                if (_.isNull(baseMSRP)) {
                    return;
                }
                html += [
                    '<tr>',
                        '<td>' + feature.get('name') + '</td>',
                        '<td class="price">' + (feature.isIncluded() ? 'included' : _.currency(baseMSRP)) + '</td>',
                    '</tr>'
                ].join('');
            });
        }
        html += [
                '</tbody>',
                '<tfoot>',
                    '<tr>',
                        '<th>Total Price</th>',
                        '<th class="price">' + _.currency(basePrice.baseMSRP + (features ? features.getTotalPrice().baseMSRP : 0)) + '</th>',
                    '</tr>',
                '</tfoot>',
            '</table>'
        ].join('');
        return html;
    },

    getDealersSection: function(premierDealers, allDealers) {
        return [
            '<table class="table-dealers">',
                '<thead>',
                    '<tr>',
                        '<th class="col">Premier Dealers</th>',
                        '<th class="space"></th>',
                        '<th class="col">All Dealers</th>',
                    '</tr>',
                '</thead>',
                '<tbody>',
                    '<tr>',
                        '<td class="col">' + this.getDealersList(premierDealers) + '</td>',
                        '<td class="space"></td>',
                        '<td class="col">' + this.getDealersList(allDealers) + '</td>',
                    '</tr>',
                '</tbody>',
            '</table>'
        ].join('');
    },

    getDealersList: function(dealers) {
        var html = '';
        if (dealers) {
            html += '<table><tbody>';
            dealers.each(function(dealer) {
                html += [
                    '<tr>',
                        '<td>',
                            '<div class="name"><b>' + (dealer.get('name') || '&nbsp;') + '</b></div>',
                            '<div class="distance">' + (dealer.getDistance() || '&nbsp;') + ' mi away</div>',
                            '<div class="address">' + (dealer.getAddress() || '&nbsp;') + '</div>',
                            '<div class="phone"><b>' + (dealer.getPhone() || '&nbsp;') + '</b></div>',
                        '</td>',
                    '</tr>'
                ].join('');
            });
            html += '</tbody></table>';
        }
        return html;
    },

    getFooterSection: function() {
        return '<div class="footer">&copy; Edmunds Inc. All rights Reserved. This information was extracted from www.edmunds.com and is subject to the terms of the Visitor Agreement at http://www.edmunds.com/about/visitor-agreement.html</div>';
    },

    getCommonStyles: function() {
        return [
            '<style>',
                'body{font-family:Arial,sans-serif;font-size:12px;line-height:1.5}',
                'h2{font-size:14px;margin:15px 0 5px}',
                '.container{padding-top:10px;width:700px}',
                '.vehicle-description{border-bottom:1px solid #ddd;font-size:14px;padding:15px 0}',
                '.vehicle-description .name{font-weight:700}',
                '.prices{border:1px solid #000;font-size:18px;list-style:none;margin:0;padding:10px 20px}',
                '.prices .note{font-size:12px;line-height:1;margin-top:-5px;text-align:right}',
                '.incentives{border:1px solid #000;font-size:18px;padding:10px 20px}',
                '.footer{border-top:1px solid #ddd;color:#555;font-size:11px;margin-top:30px;padding:15px 0}',
            '</style>'
        ].join('');
    },

    getConfigurationStyles: function() {
        return [
            '<style>',
                '.table-features{border:0;border-collapse:collapse}',
                '.table-features th{text-align:left}',
                '.table-features th,.table-features td{padding:7px 0}',
                '.table-features .price{padding-left:75px;text-align:right}',
            '</style>'
        ].join('');
    },

    getPriceQuotesStyles: function() {
        return [
            '<style>',
                '.table-dealers{border:0;border-collapse:collapse;margin-top:20px;width:100%}',
                '.table-dealers th{text-align:left}',
                '.table-dealers .space{width:10%}',
                '.table-dealers .col{width:45%}',
                '.table-dealers table{border:1px solid black;border-collapse:collapse;width:100%}',
                '.table-dealers table, .table-dealers table td{border:1px solid black}',
                '.table-dealers table td{padding:10px 15px}',
            '</style>'
        ].join('');
    },

    getConfigurationBodyHTML: function(options) {
        return [
            this.getCommonStyles(),
            this.getConfigurationStyles(),
            '<table style="border:0;border-collapse:collapse;width:700px"><tbody><tr><td>',
                this.getLogoSection(options.print),
                this.getDescriptionSection(options.vehicleFullName, options.vehicleStyleName),
                this.getPricesSection(options.totalPrice),
                this.getIncentivesSection(options.customerCashPrice),
                this.getFeaturesSection(options.features, options.basePrice),
                this.getFooterSection(),
            '</td></tr></tbody></table>'
        ].join('');
    },

    getPriceQuotesBodyHTML: function(options) {
        return [
            this.getCommonStyles(),
            this.getPriceQuotesStyles(),
            '<table style="border:0;border-collapse:collapse;width:700px"><tbody><tr><td>',
                this.getLogoSection(options.print),
                this.getDescriptionSection(options.vehicleFullName, options.vehicleStyleName),
                this.getPricesSection(options.totalPrice),
                this.getIncentivesSection(options.customerCashPrice),
                this.getDealersSection(options.premierDealers, options.allDealers),
                this.getFooterSection(),
            '</td></tr></tbody></table>'
        ].join('');
    },

    getConfigurationHTML: function(options) {
        return [
            '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
            '<html xmlns="http://www.w3.org/1999/xhtml">',
                '<head>',
                    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">',
                    '<title>Configuration</title>',
                '</head>',
                '<body>',
                    this.getConfigurationBodyHTML(options),
                '</body>',
            '</html>'
        ].join('');
    },

    getPriceQuotesHTML: function(options) {
        return [
            '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
            '<html xmlns="http://www.w3.org/1999/xhtml">',
                '<head>',
                    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">',
                    '<title>Price Quotes</title>',
                '</head>',
                '<body>',
                    this.getPriceQuotesBodyHTML(options),
                '</body>',
            '</html>'
        ].join('');
    }

};
EDM.namespace('ui').Validator = (function() {


    var ruleRegex = /^(.+?)\[(.+)\]$/,
        spaceRegex = /^a+|a+$/g,
        numericRegex = /^[0-9]+$/,
        containsNumericRegex = /[0-9]/,
        firstDigitRegex = /^[0-1]/,
        repeatSameDigitRegex = /^(.)\1{6}$/,
        integerRegex = /^[0-9]+$/,
        decimalRegex = /^\-?[0-9]*\.?[0-9]+$/,
        emailRegex = /^([0-9a-zA-Z]([\-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][\-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/,
        emailDomainRegex = /^[A-Za-z0-9](([_\.\-]?[a-zA-Z0-9]+)*)@([A-Za-z0-9]+)(([\.\-]?[a-zA-Z0-9]+)*)\.([A-Za-z]{2,3})$/,
        specialCharactersRegex = /[\*\^<>\\\"\.\;\:\[\]\(\)\{\}\!\@\_]/,
        alphaRegex = /^[a-z]+([\-][a-z]+)*?$/i,
        alphaNumericRegex = /^[a-z0-9]+$/i,
        alphaDashRegex = /^[a-z0-9_\-]+$/i,
        naturalRegex = /^[0-9]+$/i,
        naturalNoZeroRegex = /^[1-9][0-9]*$/i,
        ipRegex = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,
        base64Regex = /[^a-zA-Z0-9\/\+=]/i,
        numericDashRegex = /^[\d\-\s]+$/,
        urlRegex = /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
        repeatSameRegex = /(.)\1{2}/i,
        repeatConsanantRegex = /[bcdfghjklmnpqrstvwxz]{6}/i,
        containsVowelRegex = /^(ng|([a-z\-]*?[a|e|i|o|u|y][a-z\-]*?))$/i,
        contains = EDM.util.Array.contains;

    function Validator(){
    }

    /*
     * Define the regular expressions that will be used
     */


    Validator.prototype = {

        required: function(field) {
            var value = $.trim(field.value);
            return (value !== null && value !== '');
        },
        nameLength: function(field) {
            var value = $.trim(field.value);
            return (value.length >= 2);
        },
        alpha: function(field){
            var value = $.trim(field.value);
            return alphaRegex.test(value);
        },
        noSpecialCharacters: function(field) {
            return !specialCharactersRegex.test(field.value);
        },
        noNumeric: function(field) {
            return !containsNumericRegex.test(field.value);
        },
        decimal: function(field) {
            return (decimalRegex.test(field.value) || !field.value.length);
        },

        excludeCode: function(field){
            var excludeList = [222, 333, 411, 444, 456, 500, 555, 666, 777, 911, 900, 999],
                value = field.value;
            value = parseInt(value, 10);
            return (!contains(excludeList, value) && field.value !== '000');
        },

        excludePrefix: function(field){
            var excludeList = [411, 555, 611, 911],
                value = field.value;
            value = parseInt(value, 10);
            return (!contains(excludeList, value));
        },

        minLength: function(field){
            var value = $.trim(field.value),
                minLength = field.maxLength;
            return (value.length === minLength);
        },

        email: function(field) {
            var value = $.trim(field.value);
            return emailRegex.test(value);
        },

        emailDomain: function(field) {
            var value = $.trim(field.value);
            return emailDomainRegex.test(value);
        },

        maxValue: function(field){
            return (field.value <= 100);
        },

        integer: function(field) {
            return (integerRegex.test($.trim(field.value)));
        },

        noRepeatSame: function(field) {
            var value = $.trim(field.value);
            return !(repeatSameRegex.test(value));
        },

        noRepeatConsanant: function(field) {
            return !(repeatConsanantRegex.test(field.value));
        },

        containsVowel: function(field) {
            var value = $.trim(field.value);
            return containsVowelRegex.test(value);
        },

        firstDigit: function(field) {
            return !firstDigitRegex.test($.trim(field.value));
        },

        phone: function(field) {
            var prefix = $.trim($('[name="phonePrefix"]').val()),
                suffix = $.trim($('[name="phoneSuffix"]').val());
            if(prefix.length === 3 && suffix.length === 4) {
                var lastDigits = prefix + suffix;
                return !(repeatSameDigitRegex.test(lastDigits));
            }
            return true;
        }

    };
    
    return Validator;
}());

EDM.namespace('ui').Tooltip = (function() {

    var View = EDM.ui.View;

    return View.extend({

        className: 'edm-tooltip',

        initialize: function(options) {
            this.render(options.text);
        },

        render: function(text) {
            var arrow = document.createElement('div'),
                textElement = document.createElement('span');

            textElement.innerHTML = text || '';
            arrow.className = 'arrow-left';
            this.el.appendChild(arrow);
            this.el.appendChild(textElement);
        },

        setText: function(text){
            this.el.getElementsByTagName('span')[0].innerHTML = text;
        },

        show: function() {
            this.el.style.display = 'block';
        },

        hide: function() {
            this.el.style.display = 'none';
        }

    });

}());

EDM.namespace('ui').Button = (function() {

    var // dependencies
        View = EDM.ui.View;

    return View.extend({

        tagName: 'button',

        events: {
            'click': 'onClick'
        },

        onClick: function() {
            this.trigger('click');
        },

        setText: function(text) {
            this.el.innerHTML = text;
            return this;
        },

        disable: function() {
            this.el.setAttribute('disabled', 'disabled');
            return this;
        },

        enable: function() {
            this.el.removeAttribute('disabled');
            return this;
        }

    });

}());

EDM.namespace('ui').TextField = (function() {

    var // dependencies
        View = EDM.ui.View,
        Tooltip = EDM.ui.Tooltip,
        RegionApi = EDM.api.Region,
        KeyCode = EDM.event.KeyCode,
        contains = EDM.util.Array.contains,
        Element = EDM.dom.Element,
        validator = new EDM.ui.Validator();

    return View.extend({

        tagName: 'input',

        className: '',

        attributes: {
            type: 'text'
        },

        events: {
            //focus: 'validate',
            focus: 'hideLabel',
            blur: 'showLabel',
            change: 'validate',
            keyup: 'validate'
        },

        initialize: function(options) {
            if (options.validators) {
                this.validators = options.validators;
            }
            //this.on('focus', this.hideLabel, this);
        },

        render: function(root) {
            var el = this.el,
                label,
                labelText,
                requiredElement;

            label = document.createElement('label');
            label.className = el.name;
            labelText = document.createElement('span');
            labelText.className = 'text-label';
            labelText.innerHTML = el.alt;

            root.appendChild(label);
            label.appendChild(labelText);

            if (el.maxLength > 4) {
                requiredElement = document.createElement('span');
                requiredElement.innerHTML = '*';
                labelText.innerHTML = el.title;
                labelText.appendChild(requiredElement);
            }

            label.appendChild(el);
            this.renderTooltip();
            return this;
        },

        renderTooltip: function(){
            var tooltip = this.tooltip = new Tooltip({
                className: 'nvcwidget-tooltip',
                text: ''
            });

            if (this.el.parentNode) {
                this.el.parentNode.insertBefore(this.tooltip.el, this.el.nextSibling);
            }
            tooltip.hide();
            this.on('valid', tooltip.hide, tooltip);
            this.on('error', tooltip.show, tooltip);
            return this;
        },

        showLabel: function(){
            var el = this.el;
            if (!el.value && getElementsByClassName('text-label', '', el.parentNode)[0]){
                getElementsByClassName('text-label', '', el.parentNode)[0].style.display = 'block';
            }
            this.tooltip.hide();
        },

        hideLabel: function(){
            if (getElementsByClassName('text-label', '', this.el.parentNode)[0]) {
                getElementsByClassName('text-label', '', this.el.parentNode)[0].style.display = 'none';
            }
        },

        reset: function() {
            var $parentEl = new Element(this.el.parentNode);
            $parentEl.removeClass('invalid');
            this.el.value = '';
            this.showLabel();
        },

        // TODO validator
        validate: function() {
            var rules = this.validators, opt,
                el = this.el,
                $parentEl = new Element(el.parentNode),
                isValid;

            this.trigger('focus');

            for (opt in rules){

                isValid = validator[opt](el);

                if (!isValid) {
                    this.tooltip.setText(rules[opt].message.replace('%s', el.title));
                    $parentEl.addClass('invalid');
                    this.trigger('error');
                    this.trigger('change', {
                        isValid: isValid,
                        fieldName: el.name,
                        fieldValue: el.value
                    });
                    return;
                }

                $parentEl.removeClass('invalid');
                this.trigger('valid');
            }
            this.trigger('change', {
                isValid: isValid,
                fieldName: el.name,
                fieldValue: el.value
            });
        },

        validateField: function() {
            var rules = this.validators, opt,
                el = this.el,
                $parentEl = new Element(el.parentNode),
                isValid;

            for (opt in rules){

                isValid = validator[opt](el);

                if (!isValid) {
                    $parentEl.addClass('invalid');
                    return {
                        isValid: isValid,
                        fieldName: el.name,
                        fieldValue: el.value
                    };
                }

                $parentEl.removeClass('invalid');
            }

            return {
                isValid: isValid,
                fieldName: el.name,
                fieldValue: el.value
            };
        }

    });

}());

EDM.namespace('ui').PhoneFieldGroup = (function() {

    var // dependencies
        View = EDM.ui.View,
        Tooltip = EDM.ui.Tooltip,
        TextField = EDM.ui.TextField,
        RegionApi = EDM.api.Region,
        KeyCode = EDM.event.KeyCode,
        validator = new EDM.ui.Validator();

    return View.extend({

        initialize: function(options) {
            var phoneCode = this.phoneCode = new TextField({
                    className: 'code-field',
                    attributes: {
                        type: 'text',
                        name: 'phoneCode',
                        title: 'Area Code',
                        alt: '999',
                        maxLength: 3,
                        required: 'required'
                    },
                    validators: {
                        required: {
                            message: 'The %s field is required'
                        },
                        integer: {
                            message: '%s must contain digits only'
                        },
                        /*phone: {
                            message: 'Phone number is invalid'
                        },*/
                        firstDigit: {
                            message: '%s must not begin with 0 or 1'
                        },
                        excludeCode: {
                            message: 'Must not be 000, 222, 333, 411, 444, 456, 500, 555, 666, 777, 911, 900, or 999'
                        },
                        decimal: {
                            message: '%s must contain 3 digits'
                        },
                        minLength: {
                            message: '%s must contain 3 digits'
                        }
                    }
                }),
                phonePrefix = this.phonePrefix = new TextField({
                    className: 'prefix-field',
                    attributes: {
                        type: 'text',
                        name: 'phonePrefix',
                        title: 'Prefix',
                        alt: '999',
                        maxLength: 3,
                        required: 'required'
                    },
                    validators: {
                        required: {
                            message: 'The %s field is required'
                        },
                        integer: {
                            message: '%s must contain digits only'
                        },
                        firstDigit: {
                            message: '%s must not begin with 0 or 1'
                        },
                        excludePrefix: {
                            message: 'Must not be 411, 555, 611 or 911'
                        },
                        phone: {
                            message: 'Phone number is invalid'
                        },
                        decimal: {
                            message: '%s must contain 3 digits'
                        },
                        minLength: {
                            message: '%s must contain 3 digits'
                        }
                    }
                }),
                phoneSuffix = this.phoneSuffix = new TextField({
                    className: 'suffix-field',
                    attributes: {
                        type: 'text',
                        name: 'phoneSuffix',
                        title: 'Suffix',
                        alt: '9999',
                        maxLength: 4,
                        required: 'required'
                    },
                    validators: {
                        required: {
                            message: 'The %s field is required'
                        },
                        integer: {
                            message: '%s must contain digits only'
                        },
                        phone: {
                            message: 'Phone number is invalid'
                        },
                        decimal: {
                            message: '%s must contain 4 digits'
                        },
                        minLength: {
                            message: '%s must contain 4 digits'
                        }
                    }
                });

            this.fields = [
                phoneCode,
                phonePrefix,
                phoneSuffix
            ];
        },

        bindEvents: function(){
            this.phoneCode.on('change', this.validate, this);
            this.phonePrefix.on('change', this.validate, this);
            this.phoneSuffix.on('change', this.validate, this);
        },

        render: function(formElement) {
            var fields = this.fields,
                length = fields.length;

            for (var i = 0; i < length; i = i + 1) {
                fields[i].render(formElement);
            }

            this.bindEvents();
            return this;
        },

        reset: function() {
            var fields = this.fields,
                length = fields.length,
                i = 0;
            for (i = 0; i < length; i = i + 1) {
                fields[i].reset();
            }
        },

        validate: function() {
            var fields = this.fields,
                length = fields.length,
                i = 0,
                fieldInfo;
            for (i = 0; i < length; i = i + 1) {
                fieldInfo = fields[i].validateField();
                this.trigger('change', fieldInfo);
            }
        },

        changeAvailable: function(isAvailable){
            var fields = this.fields,
                field;
            for (field in fields) {
                if (fields.hasOwnProperty(field)){
                    fields[field].el.disabled = isAvailable ? false : true;
                }
            }
        }

    });

}());

EDM.namespace('ui').VehicleForm = (function() {

    var // dependencies
        View = EDM.ui.View,
        Tooltip = EDM.ui.Tooltip,
        TextField = EDM.ui.TextField,
        PhoneFieldGroup = EDM.ui.PhoneFieldGroup,
        RegionApi = EDM.api.Region,
        KeyCode = EDM.event.KeyCode,
        template = EDM.template,
        contains = EDM.util.Array.contains,
        validator = new EDM.ui.Validator();

    return View.extend({

        initialize: function(options) {
            var firstname = this.firstname = new TextField({
                    attributes: {
                        type: 'text',
                        name: 'firstname',
                        title: 'First Name',
                        required: 'required',
                        maxlength: 50
                    },
                    validators: {
                        required: {
                            message: 'The %s field is required'
                        },
                        nameLength: {
                            message: 'Must contain at least 2 characters'
                        },
                        noNumeric: {
                            message: 'The %s field cannot contain numbers'
                        },
                        noSpecialCharacters: {
                            message: 'Must not contain any special characters such as * ^ < > \\ " . ; : [ ] ( ) { } ! @ _'
                        },
                        alpha: {
                            message: 'The %s field is invalid'
                        },
                        noRepeatSame: {
                            message: 'Must not contain 3 of the same letter concurrently'
                        },
                        noRepeatConsanant: {
                            message: 'Must not contain 6 consecutive consonants'
                        },
                        containsVowel: {
                            message: 'Must contain a vowel'
                        }
                    }
                }),
                lastname = this.lastname = new TextField({
                    attributes: {
                        type: 'text',
                        name: 'lastname',
                        title: 'Last Name',
                        required: 'required',
                        maxlength: 50
                    },
                    validators: {
                        required: {
                            message: 'The %s field is required'
                        },
                        nameLength: {
                            message: 'Must contain at least 2 characters'
                        },
                        noNumeric: {
                            message: 'The %s field cannot contain numbers'
                        },
                        noSpecialCharacters: {
                            message: 'Must not contain any special characters such as * ^ < > \\ " . ; : [ ] ( ) { } ! @ _'
                        },
                        alpha: {
                            message: 'The %s field is invalid'
                        },
                        noRepeatSame: {
                            message: 'Must not contain 3 of the same letter concurrently'
                        },
                        noRepeatConsanant: {
                            message: 'Must not contain 6 consecutive consonants'
                        },
                        containsVowel: {
                            message: 'Must contain a vowel'
                        }
                    }
                }),
                email = this.email = new TextField({
                    attributes: {
                        type: 'text',
                        name: 'email',
                        title: 'E-mail',
                        required: 'required',
                        maxlength: 50
                    },
                    validators: {
                        required: {
                            message: 'The %s field is required'
                        },
                        email: {
                            message: 'The %s field is invalid'
                        },
                        emailDomain: {
                            message: 'The %s field is invalid'
                        }
                    }
                }),
                phoneGroup = this.phoneGroup = new PhoneFieldGroup();

            //this.on('error', tooltip.show, tooltip);

            this.fields = [
                firstname,
                lastname,
                email,
                phoneGroup
            ];

            this.template = template(this.template);
        },

        bindEvents: function(){
            this.firstname.on('change', this.validate, this);
            this.lastname.on('change', this.validate, this);
            this.email.on('change', this.validate, this);
            this.phoneGroup.on('change', this.validate, this);
        },

        resetValues: function() {
            var fields = this.fields,
                length = fields.length,
                i = 0;
            for (i = 0; i < length; i = i + 1) {
                fields[i].reset();
            }
        },

        render: function(root) {
            var fields = this.fields,
                length = fields.length,
                formElement,
                i, wrapper;

            this.root = root;
            if (root){
                root.innerHTML = this.template({});
            }
            formElement = $(root).find('.form');
            for (i = 0; i < length; i = i + 1) {
                wrapper = $('<div class="form-field"><div class="form-field-inner"></div></div>');
                $(formElement).append(wrapper);
                fields[i].render(wrapper.find('.form-field-inner')[0]);
            }

            this.bindEvents();
            return this;
        },

        reset: function() {
            this.root.innerHTML = '';
            return this;
        },

        validate: function(fieldInfo) {
            this.trigger('update-request-form', {
                name: fieldInfo.fieldName,
                value: fieldInfo.isValid ? $.trim(fieldInfo.fieldValue) : ''
            });
        },

        changeAvailable: function(isAvailable){
            var fields = this.fields,
                field;
            for (field in fields) {
                if (fields.hasOwnProperty(field)){
                    if(!fields[field].hasOwnProperty('fields')) {
                        fields[field].el.disabled = isAvailable ? false : true;
                    }
                    else {
                        fields[field].changeAvailable(isAvailable);
                    }
                }
            }
        },

        template: '<div class="rule"><b>2.</b> Request free price quote by using the form below and find the best deals</div><div class="form"></div>'

    });

}());

EDM.namespace('nvc').ConfigLeadForm = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        // helpers
        ArrayUtil = EDM.util.Array,
        isArray = ArrayUtil.isArray,
        contains = ArrayUtil.contains,
        bind = EDM.util.Function.bind;

    function ConfigLeadForm(apiKey) {
        Observable.call(this);
        this.apiKey = apiKey;
        this.initialize(apiKey);
        this.bindEvents();
    }

    ConfigLeadForm.prototype = {

        initialize: function(apiKey) {

            this.config = {
                apiKey: apiKey,
                make: '',
                model: '',
                year: '',
                styleid: '',
                zip: '',
                options: [],
                price: {},
                radius: 100,
                dealers: [],
                firstname: '',
                lastname: '',
                email: '',
                phoneCode: '',
                phonePrefix: '',
                phoneSuffix: ''
            };

        },

        setOption: function(key, value){
            this.config[key] = value;
            this.trigger('change');
            return this;
        },

        bindEvents: function() {
            this.on('change', this.validate, this);
        },

        validate: function(){
            var isValid = false;
            if (this.config.dealers.length && this.config.firstname.length && this.config.lastname.length && this.config.email.length && this.config.phoneCode.length && this.config.phonePrefix.length && this.config.phoneSuffix.length) {
                isValid = true;
            }
            this.trigger('readytosubmit', isValid);
            return isValid;
        },

        reset: function(save) {
            var attrs = _.clone(this.config);
            this.config = {
                apiKey: this.apiKey,
                make: '',
                model: '',
                year: '',
                styleid: '',
                zip: save.zip ? attrs.zip : '',
                options: [],
                price: {},
                radius: 100,
                dealers: [],
                firstname: '',
                lastname: '',
                email: '',
                phoneCode: '',
                phonePrefix: '',
                phoneSuffix: ''
            };

        }

    };

    return ConfigLeadForm;

}());

EDM.namespace('nvc').VehicleDetails = (function() {

    var // dependencies
        View = EDM.ui.View,
        template = EDM.template;

    return View.extend({

        className: 'vehicle-description',

        render: function(details, showPrice) {
            this.el.innerHTML = template(this.template, { details: details, showPrice: showPrice, msrpTooltip: NVC.TOOLTIP_MSRP });
            this.trigger('render');
            return this;
        },

        reset: function() {
            this.el.innerHTML = '<span class="default-price">Base MSRP:&nbsp;---</span>';
            return this;
        },

        template: [
            '<div class="name"><%= details.name %></div>',
            '<div class="desc"><%= details.description %></div>',
            '<% if(showPrice) { %>',
            '<div class="price">',
                'Base MSRP:<sup>$</sup>',
                '<span class="value" onclick="">',
                    '<%= _.formatNumber(details.price) %>',
                    '<div class="nvcwidget-tooltip"><div class="arrow-left"></div><%= msrpTooltip %></div>',
                '</span>',
            '</div>',
            '<% } %>'
        ].join('')

    });

}());

EDM.namespace('nvc').VehiclePhotos = (function() {

    var onePixelImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDkvMTIvMTOcPiNzAAAADUlEQVQImWP4//8/AwAI/AL+hc2rNAAAAABJRU5ErkJggg==';

    return Backbone.View.extend({

        className: 'vehicle-photos',

        template: '<div class="image"><img src="" alt=""></div><div class="image"><img src="" alt=""></div>',

        initialize: function(options) {
            this.vehicleApi = new EDM.api.Vehicle(options.vehicleApiKey);
            this.$el.addClass(options.colorScheme);
        },

        render: function() {
            this.$el.html(this.template);
            this.reset();
            return this;
        },

        reset: function() {
            this.$('img').attr('src', onePixelImage);
            return this;
        },

        loadPhotos: function(styleId) {
            var callback = _.bind(this.onPhotosLoad, this);
            this.vehicleApi.getPhotosByStyleId(styleId, callback);
        },

        onPhotosLoad: function(response) {
            var baseUrl = 'http://media.ed.edmunds-media.com',
                photos = [],
                images = this.$('img');
            photos.push(_.findWhere(response, { subType: 'exterior', shotTypeAbbreviation: 'FQ' }));
            photos.push(_.findWhere(response, { subType: 'exterior', shotTypeAbbreviation: 'RQ' }));
            photos = _.map(photos, function(photo) {
                return baseUrl + (photo && photo.id || onePixelImage).replace('dam/photo', '') + '_500.jpg';
            });
            images.eq(0).attr('src', photos[0]);
            images.eq(1).attr('src', photos[1]);
        }

    });

}());
EDM.namespace('nvc').VehiclePrice = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDMUNDSAPI.Vehicle,
        bind = EDM.util.Function.bind,
        template = EDM.template;

    function VehiclePrice(options) {
        //this.initialize.apply(this, arguments);
        this.initialize(options);
        this.bindEvents();
    }

    _.extend(VehiclePrice.prototype, Backbone.Events, {

        initialize: function(options) {
            this.options = options;
            this.el = options.el;
            this.template = template(this.template);
            this.vehicleApi = new VehicleApi(options.vehicleApiKey);
        },

        bindEvents: function() {},

        render: function(totalPrice) {
            var price = totalPrice,
                expr = /(?=(?:\d{3})+(?:\.|$))/g,
                graphWidth,
                graphDash;

            this.totalPrice = totalPrice;

            if (price.tmv > price.invoice && price.tmv <= price.msrp) {
                graphWidth = (price.tmv - price.invoice)*100 / (price.msrp - price.invoice);
                graphDash = 0;
            } else if (price.tmv < price.invoice) {
                graphWidth = 0;
                graphDash = (price.invoice - price.tmv)*100 / (price.msrp - price.tmv);
            } else if (price.tmv > price.msrp) {
                graphWidth = 100;
                graphDash = 0;
            } else {
                graphWidth = 0;
                graphDash = 0;
            }

            this.graphDash = graphDash;

            price = {
                tmv: price.tmv ? price.tmv.toString().split(expr).join(',') : 'N/A',
                invoice: price.invoice ? price.invoice.toString().split(expr).join(',') : 'N/A',
                msrp: price.msrp ? price.msrp.toString().split(expr).join(',') : 'N/A',
                width: graphWidth,
                leftDash: graphDash,
                tmvTooltip: NVC.TOOLTIP_TMV,
                msrpTooltip: NVC.TOOLTIP_MSRP,
                invoiceTooltip: NVC.TOOLTIP_INVOICE
            };

            this.el.innerHTML = this.template({ totalPrice: price });
            this.updateGraph();

            this.trigger('render');

            return this;
        },

        // Update after render. When value of invoice near of the msrp.
        updateGraph: function(){
            try {
            var bottomEl = getElementsByClassName('bottom', '', this.el)[0],
                invoiceEl = isIE ? bottomEl.childNodes[1] : getElementsByClassName('left', '', bottomEl)[0],
                msrpEl = isIE ? bottomEl.childNodes[0] : getElementsByClassName('right', '', bottomEl)[0],
                invoiceElWidth = getElementsByClassName('value', '', invoiceEl)[0].offsetWidth,
                msrpElWidth = getElementsByClassName('value', '', msrpEl)[0].offsetWidth,
                bottomElWidth = bottomEl.offsetWidth,
                graphDash = this.graphDash,
                space = 10,  // 10 px for  space between invoice and msrp price value
                correctLength;

            if (graphDash > 0) {
                correctLength = (invoiceElWidth + msrpElWidth + space) * 100 / bottomElWidth;
                if (correctLength > (100 - graphDash) && !isIE) {
                    invoiceEl.style.marginLeft = (100 - correctLength) + '%';
                }
            }
            } catch(e) {}
        },

        loadPrice: function(styleId, zipCode, featureIds) {
            var successCallback = _.bind(this.onPriceLoadSuccess, this),
                errorCallback = _.bind(this.onPriceLoadError, this),
                url = 'optionid=' + featureIds.join('&optionid=') + '&';
            this.vehicleApi.getOptionsList(url, zipCode, styleId, successCallback, errorCallback);
            return this;
        },

        onPriceLoadSuccess: function(response) {
            if (response.error || response.hasOwnProperty('errorType')) {
                return this.onPriceLoadError();
            }
                var totalPrice = {
                    invoice:    response.tmv.totalWithOptions.baseInvoice,
                    tmv:        response.tmv.totalWithOptions.tmv,
                    msrp:       response.tmv.totalWithOptions.baseMSRP
                };
                this.trigger('load', totalPrice, response);
        },
        onPriceLoadError: function() {
            this.trigger('loaderror');
        },

        reset: function() {
            this.el.innerHTML = '';
        },
        template: [
            '<div>',
                '<div>',
                    '<div class="nvcwidget-price-graph">',
                        // TMV
                        '<div class="top" style="width: <%= totalPrice.width %>%;">',
                            '<div class="top-inner">',
                                '<span class="name">True Market Value&reg;</span>',
                                '<span class="value" onclick=""><sup>$</sup><%= totalPrice.tmv %><div class="nvcwidget-tooltip"><div class="arrow-left"></div><%= totalPrice.tmvTooltip %></div></span>',
                            '</div>',
                        '</div>',
                        // graph
                        '<div class="graph">',
                            '<div class="left" style="width: <%= totalPrice.width %>%;">',
                                '<div class="middle"></div>',
                            '</div>',
                            '<div class="dash" style="left: <%= totalPrice.leftDash %>%;"></div>',
                            '<div class="dash rights"></div>',
                            '<div class="right"></div>',
                        '</div>',
                        // labels
                        '<div class="bottom">',
                            '<div class="right">',
                                '<span class="name">MSRP</span>',
                                '<span class="value" onclick=""><sup>$</sup><%= totalPrice.msrp %><div class="nvcwidget-tooltip"><div class="arrow-left"></div><%= totalPrice.msrpTooltip %></div></span>',
                            '</div>',
                            '<div class="left" style="margin-left: <%= totalPrice.leftDash %>%;">',
                                '<span class="name">Invoice</span>',
                                '<span class="value" onclick=""><sup>$</sup><%= totalPrice.invoice %><div class="nvcwidget-tooltip"><div class="arrow-left"></div><%= totalPrice.invoiceTooltip %></div></span>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('')

    });

    return VehiclePrice;

}());

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
EDM.namespace('view').Tooltip = Backbone.View.extend({

    className: 'edm-tooltip',

    template: '<div class="arrow arrow-left"></div><span></span>',

    render: function() {
        this.$el.html(this.template);
        if (this.options.text) {
            this.setText(this.options.text);
        }
        this[this.options.show ? 'show' : 'hide']();
        return this;
    },

    setText: function(value) {
        this.$('span').text(value);
        return this;
    },

    show: function() {
        this.$el.show();
        return this;
    },

    hide: function() {
        this.$el.hide();
        return this;
    }

});

EDM.namespace('view.form').Button = Backbone.View.extend({

    tagName: 'button',

    events: {
        'click': 'onClick'
    },

    render: function() {
        this.$el.text(this.options.text);
        return this;
    },

    onClick: function() {
        this.trigger('click');
    },

    disable: function() {
        this.$el.prop('disabled', true);
        return this;
    },

    enable: function() {
        this.$el.prop('disabled', false);
        return this;
    }

});

EDM.namespace('view.form').ZipField = Backbone.View.extend({

    tagName: 'input',

    // TODO remove zip-field class
    className: 'edm-form-zipfield zip-field',

    attributes: {
        type: 'text',
        title: 'ZIP Code',
        maxlength: 5
    },

    events: {
        change: 'validate',
        blur: 'setCurrentValue',
        keyup: 'validate',
        keypress: 'onKeyPress'
    },

    initialize: function(options) {
        this.currentZipCode = options.zipCode;
        this.regionApi = new EDM.api.Region(options.vehicleApiKey);
        this.tooltip = new EDM.view.Tooltip({
            className: 'nvcwidget-tooltip',
            text: 'Please enter a valid Zip Code'
        });
        this.on('valid', this.onValid, this);
        this.on('invalid', this.onInvalid, this);
        this.on('change', this.validate, this);
    },

    render: function() {
        this.$el.val(this.currentZipCode);
        this.$el.before(this.tooltip.render().el);
        return this;
    },

    enable: function() {
        this.$el.prop('disabled', false);
        return this;
    },

    disable: function() {
        this.$el.prop('disabled', true);
        return this;
    },

    onKeyPress: function(event) {
        var charCode = event.which,
            KeyCode = EDM.event.KeyCode,
            allowedKeys = [
                KeyCode.BACKSPACE,
                KeyCode.DELETE,
                KeyCode.TAB,
                KeyCode.ENTER,
                KeyCode.ARROW_LEFT,
                KeyCode.ARROW_UP,
                KeyCode.ARROW_RIGHT,
                KeyCode.ARROW_DOWN
            ];
        if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
            return;
        }
        if (String.fromCharCode(charCode).match(/\d/)) {
            return;
        }
        // for firefox
        if ((!event.which || !event.charCode) && event.keyCode && _.contains(allowedKeys, event.keyCode)) {
            return;
        }
        event.preventDefault();
        return false;
    },

    validate: function() {
        var zipCode = this.$el.val(),
            regZip = /\d{5}/,
            successCallback = _.bind(this.onZipLoadSuccess, this),
            errorCallback = _.bind(this.onZipLoadError, this);
        if (this.pending) {
            return this;
        }
        if (this.currentZipCode === zipCode) {
            return this.trigger('valid', zipCode);
        }
        if (regZip.test(zipCode)) {
            this.pending = true;
            this.regionApi.getValidZip(zipCode, successCallback, errorCallback);
            return this;
        }
        return this.trigger('invalid', zipCode);
    },

    setCurrentValue: function() {
        this.$el.val(this.currentZipCode);
        return this.validate();
    },

    onValid: function(zipCode) {
        this.currentZipCode = zipCode;
        this.tooltip.hide();
    },

    onInvalid: function() {
        this.tooltip.show();
    },

    onZipLoadSuccess: function(response) {
        var zipCode = this.$el.val();
        this.pending = false;
        if (response[zipCode] && response[zipCode] === 'true') {
            return this.trigger('valid', zipCode);
        }
        return this.trigger('invalid', zipCode);
    },

    onZipLoadError: function() {
        this.pending = false;
        return this.trigger('invalid', this.$el.val());
    },

    updateZipCode: function(zipCode) {
        this.$el.val(zipCode);
        return this.trigger('valid', zipCode);
    }

});

EDM.namespace('view.form').MiField = Backbone.View.extend({

    tagName: 'input',

    className: 'edm-form-mifield within-field',

    attributes: {
        type: 'text',
        maxlength: 3
    },

    events: {
        'change': 'onChange',
        'blur': 'onChange',
        'keyup': 'validate',
        'keypress': 'onKeyPress'
    },

    initialize: function() {
        _.defaults(this.options, {
            min: 1,
            max: 100,
            radius: 100
        });
        this.tooltip = this.tooltip = new EDM.view.Tooltip({
            className: 'nvcwidget-tooltip',
            text: 'The Radius is invalid'
        });
        this.on('valid', this.onValid, this);
        this.on('invalid', this.onInvalid, this);
    },

    onChange: function() {
        var value = this.$el.val(),
            isValid = this.validate();
        if (isValid) {
            this.$el.val(Number(value));
        }
    },

    render: function() {
        this.$el.val(this.options.radius);
        this.$el.before(this.tooltip.render().el);
        return this;
    },

    validate: function() {
        var value = Number(this.$el.val());
        if (!this.$el.val().length) {
            this.trigger('invalid', 'Radius must not be empty');
            return false;
        }
        if (!(/\d+/).test(value)) {
            this.trigger('invalid', 'Radius must be a number');
            return false;
        }
        if (value !== Math.round(value)) {
            this.trigger('invalid', 'Radius must be an integer');
            return false;
        }
        if (value > this.options.max) {
            this.trigger('invalid', 'Radius must be less than or equal to ' + this.options.max);
            return false;
        }
        if (value < this.options.min) {
            this.trigger('invalid', 'Radius must be greater than or equal to ' + this.options.min);
            return false;
        }
        this.trigger('valid', value);
        return true;
    },

    onValid: function() {
        this.tooltip.hide();
    },

    onInvalid: function(message) {
        this.tooltip.setText(message).show();
    },

    onKeyPress: function(event) {
        var charCode = event.which,
            KeyCode = EDM.event.KeyCode,
            allowedKeys = [
                KeyCode.BACKSPACE,
                KeyCode.DELETE,
                KeyCode.TAB,
                KeyCode.ENTER,
                KeyCode.ARROW_LEFT,
                KeyCode.ARROW_UP,
                KeyCode.ARROW_RIGHT,
                KeyCode.ARROW_DOWN
            ];
        if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
            return;
        }
        if (String.fromCharCode(charCode).match(/\d/)) {
            return;
        }
        // for firefox
        if ((!event.which || !event.charCode) && event.keyCode && _.contains(allowedKeys, event.keyCode)) {
            return;
        }
        event.preventDefault();
        return false;
    }

});

EDM.namespace('view.form').ZipUpdate = Backbone.View.extend({

    // TODO remove zipcode-update class
    className: 'edm-form-zipupdate zipcode-update',

    initialize: function(options) {
        // zip field
        this.zipField = new EDM.view.form.ZipField({
            vehicleApiKey:  options.vehicleApiKey,
            zipCode:        options.zipCode
        });
        this.zipField.on('valid', this.onZipValid, this);
        this.zipField.on('invalid', this.onZipInvalid, this);
        this.zipField.on('blur', this.onZipBlur, this);
        // button
        this.button = new EDM.view.form.Button({
            className: 'button-light',
            text: 'Update'
        });
        this.button.on('click', this.onButtonClick, this);
    },

    render: function() {
        var el = this.$el;
        el.append('<label>ZIP: </label>');
        el.append(this.zipField.el);
        el.append(this.button.render().el);
        this.zipField.render();
        return this;
    },

    disable: function() {
        this.button.disable();
        this.zipField.disable();
        return this;
    },

    enable: function() {
        this.button.enable();
        this.zipField.enable();
        return this;
    },

    onButtonClick: function() {
        this.trigger('update', this.zipField.$el.val());
    },

    onZipValid: function() {
        this.button.enable();
    },

    onZipInvalid: function() {
        this.button.disable();
    },

    updateZipCode: function(zipCode) {
        this.zipField.updateZipCode(zipCode);
    }

});

EDM.namespace('view.form').ZipLocation = EDM.view.form.ZipUpdate.extend({

    // TODO remove zipcode-update class
    className: 'edm-form-zipupdate zipcode-update',

    // TODO refactor template and render method
    template: [
        '<span class="name">Prices for Zip code</span>',
        '<div class="zip-code tab2-zip"></div>',
        '<span class="state">&nbsp;</span>'
    ],

    initialize: function(options) {
        EDM.view.form.ZipUpdate.prototype.initialize.apply(this, arguments);
        this.vehicleApi = new EDMUNDSAPI.Vehicle(options.vehicleApiKey);
    },

    render: function() {
        this.$el.html(this.template);
        this.$('.zip-code').append(this.zipField.el);
        this.$('.zip-code').after(this.button.render().el);
        this.zipField.render();
        return this;
    },

    onButtonClick: function() {
        this.trigger('update', this.zipField.$el.val());
    },

    loadLocation: function() {
        var callback = _.bind(this.onLocationLoad, this),
            zip = this.zipField.$el.val();
        this.vehicleApi.getUpdateLocation(zip, callback);
    },

    onLocationLoad: function(response) {
        var location = this.parseLocation(response);
        this.setLocationText(location);
        this.trigger('location-load');
    },

    parseLocation: function(response) {
        var location = {
            state: response.regionsHolder ? response.regionsHolder[0].name : null,
            stateCode:  response.regionsHolder ? response.regionsHolder[0].stateCode : null
        };
        return location;
    },

    setLocationText: function(location) {
        var text = location.state ? location.state + ', ' + location.stateCode : 'Please click UPDATE button one more time.';
        this.$('.state').text(text);
        return this;
    },

    updateZipCode: function(zipCode) {
        this.zipField.updateZipCode(zipCode);
        this.loadLocation();
    }

});

EDM.namespace('view.form').ZipMiField = EDM.view.form.ZipUpdate.extend({

    // TODO remove zipcode-update class
    className: 'edm-form-zipupdate zipcode-update',

    // TODO refactor template and render method
    template: [
        '<div class="name"><b>1.</b> Select dealer near your location</div>',
        '<div class="zip-code"></div>',
        '<div class="within"><span>within</span><span>mi</span></div>'
    ],

    initialize: function(options) {
        EDM.view.form.ZipUpdate.prototype.initialize.apply(this, arguments);
        this.miField = new EDM.view.form.MiField({
            radius: this.options.radius
        });
        this.miField.on('valid', this.onRadiusValid, this);
        this.miField.on('invalid', this.onRadiusInValid, this);

        this.isValidZip = _.has(this.options, 'zipCode');
        this.isValidRadius = _.has(this.options, 'radius');
    },

    render: function() {
        this.$el.html(this.template);
        this.$('.zip-code').append('<label>ZIP: </label>');
        this.$('.zip-code').append(this.zipField.el);
        this.$('.within').after(this.button.render().el);
        this.$('.within span:first').after(this.miField.el);
        this.zipField.render();
        this.miField.render();
        return this;
    },

    toggleButton: function() {
        this.button[this.isValidZip && this.isValidRadius ? 'enable' : 'disable']();
    },

    onButtonClick: function() {
        this.trigger('update', this.zipField.$el.val(), this.miField.$el.val());
    },

    onZipValid: function() {
        this.isValidZip = true;
        this.toggleButton();
    },

    onZipInvalid: function() {
        this.isValidZip = false;
        this.toggleButton();
    },

    onRadiusValid: function() {
        this.isValidRadius = true;
        this.toggleButton();
    },

    onRadiusInValid: function() {
        this.isValidRadius = false;
        this.toggleButton();
    }

});

EDM.namespace('view').IncentivesAndRebates = Backbone.View.extend({

    className: 'incentives',

    events: {
        'click .switcher': 'toggleState'
    },

    template: [
        '<div class="incentive-toggle">',
            '<div class="switcher-wrapper">',
                '<span class="">Include in TMV<sup>&reg;</sup></span>',
                '<div class="switcher"></div>',
            '</div>',
            '<div class="incentive-label"><i class="icon-incentive"></i>Incentives</div>',
        '</div>',
        '<div class="incentive-info">',
            '<span class="incentive-price"><%= _.currency(incentive) %></span>',
            '<span class="incentive-subprogram">Customer Cash<div class="nvcwidget-tooltip"><div class="arrow-left"></div><%= description %></div></span>',
        '</div>'
    ].join(''),

    render: function() {
        this.$el.html(_.template(this.template, {
            incentive: this.options.incentive,
            description: NVC.TOOLTIP_CUSTOMERCASH
        }));
        this.switcher = this.$('.switcher');
        if (this.options.turnedOn) {
            this.switcher.removeClass('off').addClass('on');
        } else {
            this.switcher.removeClass('on').addClass('off');
        }
        return this;
    },

    toggleState: function() {
        this.switcher.toggleClass('on off');
        this.trigger('change', this.switcher.hasClass('on'));
        return this;
    }

});

/**
 * @class Feature
 * @namespace EDM.model
 */
(function() {

    var Feature = Backbone.Model.extend({

        defaults: {
            name: '',
            status: 'available',
            price: {
                tmv: 0,
                baseMSRP: 0,
                baseInvoice: 0
            }
        },

        /**
         * @method setAvailable
         * @chainable
         */
        setAvailable: function() {
            return this.set('status', Feature.STATUS_AVAILABLE);
        },

        /**
         * @method setExcluded
         * @chainable
         */
        setExcluded: function() {
            return this.set('status', Feature.STATUS_EXCLUDED);
        },

        /**
         * @method setIncluded
         * @chainable
         */
        setIncluded: function() {
            return this.set('status', Feature.STATUS_INCLUDED);
        },

        /**
         * @method setSelected
         * @chainable
         */
        setSelected: function() {
            return this.set('status', Feature.STATUS_SELECTED);
        },

        /**
         * @method isAvailable
         * @return {Boolean}
         */
        isAvailable: function() {
            return this.get('status') === Feature.STATUS_AVAILABLE;
        },

        /**
         * @method isExcluded
         * @return {Boolean}
         */
        isExcluded: function() {
            return this.get('status') === Feature.STATUS_EXCLUDED;
        },

        /**
         * @method isIncluded
         * @return {Boolean}
         */
        isIncluded: function() {
            return this.get('status') === Feature.STATUS_INCLUDED;
        },

        /**
         * @method isSelected
         * @return {Boolean}
         */
        isSelected: function() {
            return this.get('status') === Feature.STATUS_SELECTED;
        },

        /**
         * @method isSelected
         * @return {Boolean}
         */
        isUnavailableSelected: function() {
            return this.get('status') === Feature.STATUS_UNAVAILABLE_SELECTED;
        },

        /**
         * @method isColor
         * @return {Boolean}
         */
        isColor: function() {
            return this.get('type') === Feature.TYPE_COLOR;
        },

        /**
         * @method isOption
         * @return {Boolean}
         */
        isOption: function() {
            return this.get('type') === Feature.TYPE_OPTION;
        }

    }, /* static properties and methods */ {

        /**
         * @method fromFeaturesMapObject
         * @static
         * @param {Object} featuresMapObject
         */
        fromFeaturesMapObject: function(featuresMapObject) {
            return new Feature({
                id:     featuresMapObject.id,
                name:   featuresMapObject.name,
                type:   featuresMapObject.equipmentType
            });
        },

        /**
         * @property STATUS_AVAILABLE
         * @type {String}
         * @static
         */
        STATUS_AVAILABLE: 'available',

        /**
         * @property STATUS_INCLUDED
         * @type {String}
         * @static
         */
        STATUS_INCLUDED: 'included',

        /**
         * @property STATUS_EXCLUDED
         * @type {String}
         * @static
         */
        STATUS_EXCLUDED: 'excluded',

        /**
         * @property STATUS_SELECTED
         * @type {String}
         * @static
         */
        STATUS_SELECTED: 'selected',

        /**
         * @property STATUS_UNAVAILABLE_SELECTED
         * @type {String}
         * @static
         */
        STATUS_UNAVAILABLE_SELECTED: 'unavailable selected',

        /**
         * @property TYPE_COLOR
         * @type {String}
         * @static
         */
        TYPE_COLOR: 'color',

        /**
         * @property TYPE_OPTION
         * @type {String}
         * @static
         */
        TYPE_OPTION: 'option'

    });

    // define in EDM namespace
    EDM.namespace('model').Feature = Feature;

}());

/**
 * @class Color
 * @namespace EDM.model.feature
 */
(function(FeatureModel) {

    var Color = FeatureModel.extend({

        // public properties and methods

    }, /* static properties and methods */ {

        /**
         * @static
         * @param {Object} featuresMapObject
         */
        fromFeaturesMapObject: function(featuresMapObject) {
            var modelOptions = {
                    id:     featuresMapObject.id,
                    name:   featuresMapObject.name,
                    type:   featuresMapObject.equipmentType
                },
                attributeGroups = featuresMapObject.attributeGroups;
            // manufacturer name
            if (attributeGroups.COLOR_INFO && attributeGroups.COLOR_INFO.attributes.MANUFACTURER_OPTION_NAME) {
                modelOptions.name = attributeGroups.COLOR_INFO.attributes.MANUFACTURER_OPTION_NAME.value;
            }
            // category
            if (attributeGroups.COLOR_TYPE && attributeGroups.COLOR_TYPE.attributes.COLOR_TYPE) {
                modelOptions.category = attributeGroups.COLOR_TYPE.attributes.COLOR_TYPE.value;
            }
            // primary and secondary colors
            if (attributeGroups.COLOR_CHIPS) {
                // primary color
                if (attributeGroups.COLOR_CHIPS.attributes.PRIMARY_R_CODE &&
                        attributeGroups.COLOR_CHIPS.attributes.PRIMARY_G_CODE &&
                        attributeGroups.COLOR_CHIPS.attributes.PRIMARY_B_CODE) {
                    modelOptions.primaryColor = {
                        r:  attributeGroups.COLOR_CHIPS.attributes.PRIMARY_R_CODE.value,
                        g:  attributeGroups.COLOR_CHIPS.attributes.PRIMARY_G_CODE.value,
                        b:  attributeGroups.COLOR_CHIPS.attributes.PRIMARY_B_CODE.value
                    };
                }
                // secondary color
                if (attributeGroups.COLOR_CHIPS.attributes.SECONDARY_R_CODE &&
                        attributeGroups.COLOR_CHIPS.attributes.SECONDARY_G_CODE &&
                        attributeGroups.COLOR_CHIPS.attributes.SECONDARY_B_CODE) {
                    modelOptions.secondaryColor = {
                        r:  attributeGroups.COLOR_CHIPS.attributes.SECONDARY_R_CODE.value,
                        g:  attributeGroups.COLOR_CHIPS.attributes.SECONDARY_G_CODE.value,
                        b:  attributeGroups.COLOR_CHIPS.attributes.SECONDARY_B_CODE.value
                    };
                }
            }
            // price
            modelOptions.price = featuresMapObject.price;
            return new Color(modelOptions);
        }

    });

    // define in EDM namespace
    EDM.namespace('model.feature').Color = Color;

}(
    // dependencies
    EDM.model.Feature
));

/**
 * @class Option
 * @namespace EDM.model.feature
 */
(function(FeatureModel) {

    var Option = FeatureModel.extend({

        // public properties and methods

    }, /* static properties and methods */ {

        /**
         * @static
         * @param {Object} featuresMapObject
         */
        fromFeaturesMapObject: function(featuresMapObject) {
            var modelOptions = {
                    id:     featuresMapObject.id,
                    name:   featuresMapObject.name,
                    type:   featuresMapObject.equipmentType
                },
                attributeGroups = featuresMapObject.attributeGroups;
            // manufacturer name
            if (attributeGroups.OPTION_INFO && attributeGroups.OPTION_INFO.attributes.MANUFACTURER_OPTION_NAME) {
                modelOptions.name = attributeGroups.OPTION_INFO.attributes.MANUFACTURER_OPTION_NAME.value;
            }
            // category
            if (attributeGroups.OPTION_INFO && attributeGroups.OPTION_INFO.attributes.OPTION_CATEGORY) {
                modelOptions.category = attributeGroups.OPTION_INFO.attributes.OPTION_CATEGORY.value;
            } else {
                modelOptions.category = 'Other';
            }
            // price
            modelOptions.price = featuresMapObject.price;
            return new Option(modelOptions);
        }

    });

    // define in EDM namespace
    EDM.namespace('model.feature').Option = Option;

}(
    // dependencies
    EDM.model.Feature
));

/**
 * @class Features
 * @namespace EDM.collection
 */
(function(FeatureModel, ColorModel, OptionModel) {

    var Features = Backbone.Collection.extend({

        /**
         *
         */
        model: FeatureModel,

        /**
         *
         */
        currentState: {},

        /**
         *
         */
        previousState: {},

        /**
         *
         */
        comparator: function(model) {
            var prefix = model.get('category') === 'Additional Fees' ? '_' : '';
            // for ids '000000001' - '000000005'
            // +model.get('id') should return a number
            if (+model.get('id') < 6) {
                prefix += '_';
            }
            return prefix + model.get('name');
        },

        /**
         * @chainable
         */
        saveCurrentState: function() {
            var currentState;
            this.previousState = _.clone(this.currentState);
            currentState = this.currentState = {
                available: [],
                selected: [],
                excluded: [],
                included: []
            };
            this.each(function(feature) {
                if (feature.isAvailable()) {
                    currentState.available.push(feature.get('id'));
                }
                if (feature.isSelected()) {
                    currentState.selected.push(feature.get('id'));
                }
                if (feature.isIncluded()) {
                    currentState.included.push(feature.get('id'));
                }
                if (feature.isExcluded()) {
                    currentState.excluded.push(feature.get('id'));
                }
            });
            return this;
        },

        /**
         * @chainable
         */
        applyOptions: function(response) {
            var featuresByType = this.mapByType(),
                options = featuresByType[FeatureModel.TYPE_OPTION],
                colors = featuresByType[FeatureModel.TYPE_COLOR].mapByCategory(),

                availableIds = [],
                selectedIds = [],
                includedIds = [],
                excludedIds = [],

                includedOptionIds = [],
                selectedOptionIds = [],

                includedColorIds = [],
                selectedColorIds = [];

            selectedIds = _.union(this.currentState.selected, response.requiredItems, response.currentOptions, response.selectedOption);
            selectedIds = _.without(selectedIds, response.deselectedOption);
            selectedIds = _.difference(selectedIds, response.furtherRemovals, response.includedItems);

            excludedIds = response.excludedItems;

            function colorsFilter(id) {
                var feature = this.get(id);
                return feature && feature.isColor();
            }

            includedColorIds = _.filter(response.includedItems, colorsFilter, this);
            includedOptionIds = _.difference(response.includedItems, includedColorIds);

            selectedColorIds = _.filter(selectedIds, colorsFilter, this);
            selectedOptionIds = _.difference(selectedIds, selectedColorIds);

            // TODO filter included and selected color ids
            // only one color should be included or selected in category
            var includedAndSelectedColorIds = _.union(includedColorIds, selectedColorIds),
                map = this.mapByTypeAndCategory(),
                colorCategoriesMap = map[FeatureModel.TYPE_COLOR];

            _.each(colorCategoriesMap, function(features) {
                var ids = features.pluck('id'),
                    includedIds = _.intersection(ids, includedColorIds),
                    selectedIds = _.intersection(ids, selectedColorIds),
                    requiredIds = _.intersection(selectedIds, response.requiredItems);

                if (requiredIds.length) {
                    selectedIds = requiredIds;
                }

                includedColorIds = _.difference(includedColorIds, ids);
                selectedColorIds = _.difference(selectedColorIds, ids);

                if (_.contains(includedIds, response.selectedOption)) {
                    selectedColorIds = _.without(selectedColorIds, response.selectedOption);
                    includedColorIds.push(response.selectedOption);
                } else if (_.contains(selectedIds, response.selectedOption)) {
                    selectedColorIds.push(response.selectedOption);
                } else if (includedIds.length > 0) {
                    includedColorIds.push(_.last(includedIds));
                } else {
                    // what happens if selectedIds would contain more then one item?
                    selectedColorIds = _.union(selectedColorIds, selectedIds);
                }

                // and what about requires options?

            }, this);

            includedIds = _.union(includedColorIds, includedOptionIds);
            selectedIds = _.union(selectedColorIds, selectedOptionIds);

            // reset status
            this.each(function(feature) {
                if (feature.isAvailable() || feature.isUnavailableSelected()) {
                    return;
                }
                feature.setAvailable();
            }, this);

            this.setExcluded(excludedIds);
            this.setIncluded(includedIds);
            this.setSelected(selectedIds);

            // save
            this.saveCurrentState();
            return this;
        },

        setPreviousState: function() {
            var state = this.previousState;
            this.setAvailable(state.available);
            this.setExcluded(state.excluded);
            this.setIncluded(state.included);
            this.setSelected(state.selected);
            this.saveCurrentState();
            return this;
        },

        resetState: function() {
            this.previousState = {};
            this.currentState = {};
            return this;
        },

        /**
         *
         */
        mapByType: function() {
            var map = {};
            this.each(function(feature) {
                var key = feature.get('type');
                if (!map[key]) {
                    map[key] = new Features();
                }
                map[key].add(feature);
            });
            return map;
        },

        /**
         *
         */
        mapByCategory: function() {
            var map = {};
            this.each(function(feature) {
                var key = feature.get('category');
                if (!map[key]) {
                    map[key] = new Features();
                }
                map[key].add(feature);
            });
            return map;
        },

        /**
         *
         */
        mapByTypeAndCategory: function() {
            var map = {};
            _.each(this.mapByType(), function(features, type) {
                map[type] = features.mapByCategory();
            });
            return map;
        },

        /**
         * @chainable
         */
        setAvailable: function(ids) {
            _.each(ids, function(id) {
                var feature = this.get(id);
                if (feature) {
                    feature.setAvailable();
                }
            }, this);
            return this;
        },

        /**
         * @chainable
         */
        setExcluded: function(ids) {
            _.each(ids, function(id) {
                var feature = this.get(id);
                if (feature) {
                    feature.setExcluded();
                }
            }, this);
            return this;
        },

        setIncluded: function(ids) {
            _.each(ids, function(id) {
                var feature = this.get(id);
                if (feature) {
                    feature.setIncluded();
                }
            }, this);
            return this;
        },

        setSelected: function(ids) {
            _.each(ids, function(id) {
                var feature = this.get(id);
                if (feature) {
                    feature.setSelected();
                }
            }, this);
            return this;
        },

        /**
         *
         */
        getTotalPrice: function() {
            var totalPrice = {
                tmv: 0,
                baseMSRP: 0,
                baseInvoice: 0
            };
            this.each(function(feature) {
                var price;
                if (feature.isSelected() || feature.isUnavailableSelected()) {
                    price = feature.get('price');
                    totalPrice.tmv += Number(price.tmv) || 0;
                    totalPrice.baseMSRP += price.baseMSRP;
                    totalPrice.baseInvoice += price.baseInvoice;
                }
            });
            return totalPrice;
        },

        updatePrices: function(tmv) {
            var feature;
            // Regional Adjustment
            if (tmv.regionalAdjustment) {
                feature = this.get('000000003');
                if (feature) {
                    feature.set('price', {
                        tmv: Number(tmv.regionalAdjustment.tmv),
                        baseMSRP: null,
                        baseInvoice: null
                    });
                } else {
                    this.add({
                        id: '000000003',
                        name: 'Regional Adjustment',
                        category: 'Additional Fees',
                        type: FeatureModel.TYPE_OPTION,
                        status: FeatureModel.STATUS_UNAVAILABLE_SELECTED,
                        price: {
                            tmv: Number(tmv.regionalAdjustment.tmv),
                            baseMSRP: null,
                            baseInvoice: null
                        }
                    });
                }
            }
            // Color Adjustment
            if (tmv.colorAdjustment) {
                feature = this.get('000000004');
                if (feature) {
                    feature.set('price', {
                        tmv: Number(tmv.colorAdjustment.tmv),
                        baseMSRP: null,
                        baseInvoice: null
                    });
                } else {
                    this.add({
                        id: '000000004',
                        name: 'Color Adjustment',
                        category: 'Additional Fees',
                        type: FeatureModel.TYPE_OPTION,
                        status: FeatureModel.STATUS_UNAVAILABLE_SELECTED,
                        price: {
                            tmv: Number(tmv.colorAdjustment.tmv),
                            baseMSRP: null,
                            baseInvoice: null
                        }
                    });
                }
            }
            // Advertising Fee
            if (tmv.colorAdjustment) {
                feature = this.get('000000005');
                if (feature) {
                    feature.set('price', {
                        tmv: null,
                        baseMSRP: null,
                        baseInvoice: Number(tmv.regionalAdFee) || 0
                    });
                } else {
                    this.add({
                        id: '000000005',
                        name: 'Advertising Fee',
                        category: 'Additional Fees',
                        type: FeatureModel.TYPE_OPTION,
                        status: FeatureModel.STATUS_UNAVAILABLE_SELECTED,
                        price: {
                            tmv: null,
                            baseMSRP: null,
                            baseInvoice: Number(tmv.regionalAdFee)
                        }
                    });
                }
            }
            _.each(tmv.optionTMVPrices, function(price, featureId) {
                var feature = this.get(featureId),
                    featurePrice;
                if (feature) {
                    featurePrice = feature.get('price');
                    feature.set('price', {
                        tmv:            _.isNull(price.tmv) ? featurePrice.tmv : price.tmv,
                        baseMSRP:       _.isNull(price.baseMSRP) ? featurePrice.baseMSRP : price.baseMSRP,
                        baseInvoice:    _.isNull(price.baseInvoice) ? featurePrice.baseInvoice : price.baseInvoice
                    });
                }
            }, this);
            return this;
        }

    }, /* static properties and methods */ {

        /**
         * @static
         * @param {Object} featuresMap
         */
        fromFeaturesMap: function(featuresMap) {
            var models = [];
            _.each(featuresMap, function(featuresMapObject, featureId) {
                var model;
                switch (featuresMapObject.equipmentType) {
                    case FeatureModel.TYPE_COLOR:
                        model = ColorModel.fromFeaturesMapObject(featuresMapObject);
                        break;
                    case FeatureModel.TYPE_OPTION:
                        if (featuresMapObject.price) {
                            if (featuresMapObject.price.baseMSRP >= 0) {
                                model = OptionModel.fromFeaturesMapObject(featuresMapObject);
                            }
                        } else {
                            model = OptionModel.fromFeaturesMapObject(featuresMapObject);
                        }
                        break;
                }
                if (model) {
                    models.push(model);
                }
            });
            return new Features(models);
        }

    });

    // defined in EDM namespace
    EDM.namespace('collection').Features = Features;

}(
    // dependencies
    EDM.model.Feature,
    EDM.model.feature.Color,
    EDM.model.feature.Option
));


/**
 * @class Category
 * @namespace EDM.view.features
 */
EDM.namespace('view.features').Category = Backbone.View.extend({

    className: 'features-category-head',

    events: {
        'click': 'onClick'
    },

    template: [
        '<div class="inner">',
            '<div class="features-category-price"><%= _.currency(totalPrice.baseMSRP) %></div>',
            '<div class="features-category-title"><%= categoryName %></div>',
        '</div>'
    ].join(''),

    initialize: function() {
        this.collection.on('reset', this.updateTotalPrice, this);
        // compile template
        this.template = _.template(this.template);
        this.setTitle(this.options.categoryName);
    },

    render: function() {
        this.el.innerHTML = this.template({
            categoryName: this.categoryName,
            totalPrice: this.collection.getTotalPrice()
        });
        return this;
    },

    updateTotalPrice: function() {
        var totalPrice = this.collection.getTotalPrice();
        this.$('.features-category-price').html(_.currency(totalPrice.baseMSRP));
        return this;
    },

    onClick: function() {
        this.trigger('open', this.categoryName, this.collection);
    },

    setTitle: function(categoryName) {
        this.categoryName = this.normalizeTitle(categoryName || '');
        return this.render();
    },

    // TODO capitalize string helper
    // words[idx] = EDM.String.capitalize(word);
    normalizeTitle: function(title) {
        var words = title.split(/[\s_]+/g);
        _.each(words, function(word, idx, words) {
            words[idx] = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        });
        return words.join(' ');
    }

});

EDM.namespace('view.features.category').ColorCategory = EDM.view.features.Category.extend({

    template: [
        '<div class="inner">',
            '<div class="features-category-color">',
                '<% if (feature && feature.has("secondaryColor")) { %>',
                    '<div class="feature-secondary-color" style="background-color: <%= _.rgb2hex(feature && feature.get("secondaryColor")) %>"></div>',
                '<% } %>',
                '<% if (feature && feature.has("primaryColor")) { %>',
                    '<div class="feature-primary-color" style="background-color: <%= _.rgb2hex(feature && feature.get("primaryColor")) %>"></div>',
                '<% } %>',
            '</div>',
            '<div class="features-category-price"><%= _.currency(totalPrice.baseMSRP) %></div>',
            '<div class="features-category-title"><%= categoryName %></div>',
        '</div>'
    ].join(''),

    render: function() {
        var selectedFeature = this.collection.filter(function(feature) {
                return feature.isSelected() || feature.isIncluded();
            })[0],
            firstFeature = this.collection.at(0),
            className = 'category-' + (firstFeature && firstFeature.get('category') || '').toLowerCase().replace(/[\s_]+/g, '-');
        this.el.innerHTML = this.template({
            categoryName: (selectedFeature ? selectedFeature.get('name') : 'Select a color'),
            totalPrice: this.collection.getTotalPrice(),
            feature: selectedFeature
        });
        this.$el.addClass(className);
        return this;
    }

});

/**
 * @class CategoriesList
 * @namespace EDM.view.features
 */
EDM.namespace('view.features').Categories = Backbone.View.extend({

    /**
     *
     */
    categoriesMap: {},

    /**
     *
     */
    render: function() {
        var CATEGORY_PACKAGE    = 'Package',
            CATEGORY_FEES       = 'Additional Fees',
            TYPE_COLOR          = 'color',
            TYPE_OPTION         = 'option',
            map, groupWrapper;
        // clear view
        this.$el.empty();
        //
        if (this.collection.length === 0) {
            this.$el.html('<div class="alert">Sorry, we don\'t have configurable options for this vehicle.</div>');
            return this;
        }
        map = this.collection.mapByTypeAndCategory();
        // render packages first
        this.createGroupWrapper();
        if (map[TYPE_OPTION] && map[TYPE_OPTION][CATEGORY_PACKAGE]) {
            this.renderOptionsCategory(CATEGORY_PACKAGE, map[TYPE_OPTION][CATEGORY_PACKAGE]);
        }
        // then render colors
        this.createExtraGroupWrapper();
        _.each(map[TYPE_COLOR], function(features, categoryName) {
            this.renderColorsCategory(categoryName, features);
        }, this);
        this.$extraGroupWrapper = null;
        // after render options without packages and fees
        this.createGroupWrapper();
        if (map[TYPE_OPTION]) {
            this.$groupWrapper.append('<h6 class="features-category-title">Options</h6>');
        }
        _.each(map[TYPE_OPTION], function(features, categoryName) {
            if (categoryName !== CATEGORY_PACKAGE && categoryName !== CATEGORY_FEES) {
                this.renderOptionsCategory(categoryName, features);
            }
        }, this);
        // and render fees
        this.createGroupWrapper();
        if (map[TYPE_OPTION] && map[TYPE_OPTION][CATEGORY_FEES]) {
            this.renderOptionsCategory(CATEGORY_FEES, map[TYPE_OPTION][CATEGORY_FEES]);
        }
        return this;
    },

    createGroupWrapper: function() {
        this.$groupWrapper = $('<div class="features-group-wrapper"></div>').appendTo(this.$extraGroupWrapper || this.el);
        return this;
    },

    createExtraGroupWrapper: function() {
        this.$extraGroupWrapper = $('<div class="features-extra-group-wrapper"></div>').appendTo(this.el);
        return this;
    },

    /**
     *
     */
    renderColorsCategory: function(categoryName, features) {
        var category = new EDM.view.features.category.ColorCategory({
            collection: features,
            categoryName: categoryName
        });
        category.on('open', this.openCategory, this);
        this.createGroupWrapper();
        this.$groupWrapper.append('<h6 class="features-category-title">' + category.normalizeTitle(categoryName) + '</h6>');
        this.$groupWrapper.append(category.render().el);
        if (!this.categoriesMap.color) {
            this.categoriesMap.color = {};
        }
        this.categoriesMap.color[categoryName] = category;
        return this;
    },

    /**
     *
     */
    renderOptionsCategory: function(categoryName, features) {
        var category = new EDM.view.features.Category({
            collection: features,
            categoryName: categoryName
        });
        category.on('open', this.openCategory, this);
        this.$groupWrapper.append(category.render().el);
        if (!this.categoriesMap.option) {
            this.categoriesMap.option = {};
        }
        this.categoriesMap.option[categoryName] = category;
        return this;
    },

    refresh: function() {
        // color categories
        _.each(this.categoriesMap.color, function(category) {
            category.render();
        });
        // option categories
        _.each(this.categoriesMap.option, function(category) {
            category.updateTotalPrice();
        });
        return this;
    },

    /**
     *
     */
    openCategory: function(categoryName, features) {
        this.trigger('opencategory', categoryName, features);
    }

});

EDM.namespace('view.features').ListItem = Backbone.View.extend({

    tagName: 'li',

    className: 'features-list-item',

    events: {
        'click [type="checkbox"]': 'onSelect'
    },

    template: [
        '<label for="feature-<%= data.cid %>-<%= data.feature.get("id") %>">',
            '<% if (data.feature.isColor()) { %>',
                '<div class="feature-color">',
                    '<% if (data.feature.has("secondaryColor")) { %>',
                        '<div class="feature-secondary-color" style="background-color: <%= _.rgb2hex(data.feature.get("secondaryColor")) %>"></div>',
                    '<% } %>',
                    '<% if (data.feature.has("primaryColor")) { %>',
                        '<div class="feature-primary-color" style="background-color: <%= _.rgb2hex(data.feature.get("primaryColor")) %>"></div>',
                    '<% } %>',
                    '<i></i>',
                '</div>',
            '<% } %>',
            '<input type="checkbox" id="feature-<%= data.cid %>-<%= data.feature.get("id") %>" value="<%= data.feature.get("id") %>">',
            '<span class="feature-price feature-price-msrp"><%= _.currency(data.feature.get("price").baseMSRP) %></span>',
            '<span class="feature-name"><span class="notification-icon"></span><%= data.feature.get("name") %></span>',
        '</label>'
    ].join(''),

    initialize: function() {
        this.model.on('change', this.render, this);
    },

    render: function() {
        var feature = this.model,
            checkbox, price;
        this.$el
            .html(_.template(this.template, {
                feature: feature,
                cid: this.cid
            }, { variable: 'data' }))
            .removeClass('available included excluded selected')
            .addClass(feature.get('status'))
            .addClass(feature.get('type'));
        // update checkbox state
        checkbox = this.$('[type="checkbox"]');
        if (feature.isSelected()) {
            checkbox.prop({
                checked: true,
                disabled: false
            });
        } else if (feature.isIncluded() || feature.isUnavailableSelected()) {
            checkbox.prop({
                checked: true,
                disabled: true
            });
        } else if (feature.isAvailable() || feature.isExcluded()) {
            checkbox.prop({
                checked: false,
                disabled: false
            });
        }
        function getTextPrice(value) {
            return _.isNull(value) ? 'N/A' : _.currency(value);
        }
        // update price
        if (feature.isIncluded()) {
            this.$('.feature-price').text('Included');
        } else {
            price = this.model.get('price');
            this.$('.feature-price-msrp').html(getTextPrice(price.baseMSRP));
            this.$('.feature-price-tmv').html(getTextPrice(price.tmv));
            this.$('.feature-price-invoice').html(getTextPrice(price.baseInvoice));
        }
        return this;
    },

    onSelect: function(event) {
        var el = event.target;
        event.preventDefault();
        this.trigger('select', el.value, el.checked, this);
    }

});

EDM.namespace('view.features').List = Backbone.View.extend({

    tagName: 'ul',

    className: 'features-list',

    loadingText: 'Loading options...',

    emptyText: 'Sorry, we don\'t have configurable options for this vehicle.',

    initialize: function() {
        this.collection.on('reset', this.render, this);
        this.collection.on('request', this.onRequest, this);
    },

    render: function() {
        this.$el.empty();
        if (!this.collection.length) {
            this.$el.html(this.emptyText);
            return this;
        }
        this.setClassName();
        this.collection.each(this.add, this);
        return this;
    },

    add: function(model) {
        var item;
        if (_.isNull(model.get('price').baseMSRP)) {
            return this;
        }
        item = new EDM.view.features.ListItem({
            model: model
        });
        item.on('select', this.onSelect, this);
        this.$el.append(item.render().el);
        return this;
    },

    showLoadingOverlay: function() {
        if (!this.loadingOverlay) {
            this.loadingOverlay = $('<li class="overlay"></li>');
        }
        this.loadingOverlay.appendTo(this.$el);
    },

    hideLoadingOverlay: function() {
        if (this.loadingOverlay) {
            this.loadingOverlay.remove();
        }
    },

    onSelect: function(featureId, selected, view) {
        this.trigger('select', featureId, selected, view);
    },

    onRequest: function() {
        this.showLoadingOverlay();
    },

    setClassName: function() {
        var className = 'category-' + (this.collection.at(0).get('category') || '').toLowerCase().replace(/[\s_]+/g, '-');
        this.$el
            .removeClass()
            .addClass(this.className)
            .addClass(className);
        return this;
    }

});

EDM.namespace('view.features').SelectedListItem = EDM.view.features.ListItem.extend({

    events: {
        'click [data-action="remove"]': 'onRemoveClick'
    },

    template: [
        '<a href="#" class="icon-remove" data-action="remove">',
            '<div class="nvcwidget-tooltip"><div class="arrow-left"></div>Delete</div>',
        '</a>',
        '<span class="feature-price feature-price-msrp"><%= _.currency(data.feature.get("price").baseMSRP) %></span>',
        '<span class="feature-price feature-price-tmv"><%= _.currency(data.feature.get("price").tmv) %></span>',
        '<span class="feature-price feature-price-invoice"><%= _.currency(data.feature.get("price").baseInvoice) %></span>',
        '<span class="feature-name"><span class="notification-icon"></span><%= data.feature.get("name") %></span>'
    ].join(''),

    onRemoveClick: function(event) {
        event.preventDefault();
        this.trigger('select', this.model.get('id'), false, this);
    }

});

EDM.namespace('view.features').SelectedList = EDM.view.features.List.extend({

    className: 'selected-features-list',

    emptyText: '',

    add: function(model) {
        var item = new EDM.view.features.SelectedListItem({
            model: model
        });
        item.on('select', this.onSelect, this);
        this.$el.append(item.render().el);
        return this;
    }

});

EDM.namespace('view.features').SelectedFeatures = Backbone.View.extend({

    className: 'selected-features',

    headerTemplate: [
        '<div class="selected-features-header">',
            '<div class="headers-row">',
                '<div class="price-dropdown">',
                    '<div class="arrow"></div>',
                    '<ul>',
                        '<li data-price-type="msrp">MSRP</li>',
                        '<li data-price-type="tmv">TMV&reg;</li>',
                        '<li data-price-type="invoice">Invoice</li>',
                    '</ul>',
                '</div>',
                '<div class="feature-price feature-price-msrp">MSRP</div>',
                '<div class="feature-price feature-price-tmv">TMV&reg;</div>',
                '<div class="feature-price feature-price-invoice">Invoice</div>',
                '<div class="feature-name">Description</div>',
            '</div>',
            '<div class="base-price-row">',
                '<div class="feature-price feature-price-msrp">$0</div>',
                '<div class="feature-price feature-price-tmv">$0</div>',
                '<div class="feature-price feature-price-invoice">$0</div>',
                '<div class="feature-name">Base Price</div>',
            '</div>',
        '</div>'
    ].join(''),

    footerTemplate: [
        '<div class="selected-features-footer">',
            '<div class="total-price-row">',
                '<div class="feature-price feature-price-msrp">$0</div>',
                '<div class="feature-price feature-price-tmv">$0</div>',
                '<div class="feature-price feature-price-invoice">$0</div>',
                '<div class="feature-name">Total Price</div>',
            '</div>',
        '</div>'
    ].join(''),

    initialize: function(options) {
        this.basePrice = this.setBasePrice(options.basePrice);
        this.list = new EDM.view.features.SelectedList({
            collection: this.collection
        });
    },

    render: function() {
        var header = _.template(this.headerTemplate, { baseMSRP: this.baseMSRP }),
            footer = _.template(this.footerTemplate, { totalPrice: this.totalPrice });
        // header
        this.$el.append(header);
        this.initPriceDropdown();
        // list
        this.$el.append(this.list.el);
        // footer
        this.$el.append(footer);
        return this;
    },

    initPriceDropdown: function() {
        var me = this,
            dropdown = this.$('.price-dropdown'),
            list = dropdown.find('ul');
        function showPriceRowsByType(type) {
            var priceRows = me.$('.feature-price');
            priceRows.hide();
            priceRows.filter(function() {
                return $(this).hasClass('feature-price-' + type);
            }).show();
        }
        dropdown.on({
            mouseenter: function() {
                list.show();
            },
            mouseleave: function() {
                list.hide();
            }
        });
        list.find('li').on('click', function() {
            showPriceRowsByType($(this).data('priceType'));
            list.hide();
        });
        return this;
    },

    resize: function() {
        var parentHeight = this.$el.parent().height(),
            header = this.$('.selected-features-header'),
            footer = this.$('.selected-features-footer'),
            headerHeight = header.height(),
            footerHeight = footer.height(),
            listItem = this.$('.selected-features-list > :first'),
            listWidth, padding;
        if (this.$el.closest('.nvcwidget').hasClass('nvcwidget-wide') || this.$el.closest('.nvcwidget').hasClass('nvcwidget-x-wide')) {
            parentHeight = this.$el.closest('.w1').height();
        }
        this.list.$el.css('max-height', parentHeight - (headerHeight + footerHeight));
        if (listItem.length === 1) {
            listWidth = listItem.outerWidth();
            padding = Math.max(footer.outerWidth() - listWidth, 0);
            header.css('padding-right', padding);
            footer.css('padding-right', padding);
        }
        return this;
    },

    setBasePrice: function(basePrice) {
        var row = this.$('.selected-features-header .base-price-row');
        this.basePrice = basePrice || {
            tmv: 0,
            baseMSRP: 0,
            baseInvoice: 0
        };
        row.find('.feature-price-msrp').text(_.currency(this.basePrice.baseMSRP));
        row.find('.feature-price-tmv').text(_.currency(this.basePrice.tmv));
        row.find('.feature-price-invoice').text(_.currency(this.basePrice.baseInvoice));
        this.updateTotalPrice();
        return this;
    },

    updateTotalPrice: function() {
        var totalPrice = this.collection.getTotalPrice(),
            basePrice = this.basePrice,
            footer = this.$('.selected-features-footer');
        footer.find('.feature-price-msrp').text(_.currency(basePrice.baseMSRP + totalPrice.baseMSRP));
        footer.find('.feature-price-tmv').text(_.currency(basePrice.tmv + totalPrice.tmv));
        footer.find('.feature-price-invoice').text(_.currency(basePrice.baseInvoice + totalPrice.baseInvoice));
        return this;
    }

});

EDM.namespace('view.features').Notification = Backbone.View.extend({

    className: 'feature-notification',

    events: {
        'click [data-action="ok"]': 'onOkClick',
        'click [data-action="cancel"]': 'onCancelClick'
    },

    itemTemplate: [
        '<li>',
            '<span class="feature-price"><%= _.currency(feature.get("price").baseMSRP) %></span>',
            '<span class="feature-name"><%= feature.get("name") %></span>',
        '</li>'
    ].join(''),

    render: function() {
        var list, listItem;
        // required
        if (this.options.required.length) {
            this.$el.append('<p>Your selection requires the following:</p>');
            list = $('<ul/>').appendTo(this.el);
            _.each(this.options.required, function(feature) {
                listItem = _.template(this.itemTemplate, feature, { variable: 'feature' });
                list.append(listItem);
            }, this);
            this.$el.append('<p>which will be selected.</p>');
        }
        // excluded
        if (this.options.excluded.length) {
            if (!this.options.required.length) {
                this.$el.append('<p>Your selection excludes the following:</p>');
            } else {
                this.$el.append('<p>And excludes the following:</p>');
            }
            list = $('<ul/>').appendTo(this.el);
            _.each(this.options.excluded, function(feature) {
                listItem = _.template(this.itemTemplate, feature, { variable: 'feature' });
                list.append(listItem);
            }, this);
        }
        this.$el.append('<p>Continue with these changes?</p>');
        // buttons
        this.$el.append([
            '<div class="feature-notification-buttons">',
                '<button type="button" data-action="ok">Yes, continue</button>',
                '<button type="button" data-action="cancel">Do not change</button>',
            '</div>'
        ].join(''));
        return this;
    },

    onOkClick: function() {
        this.trigger('ok');
    },

    onCancelClick: function() {
        this.trigger('cancel');
    }

});

EDM.namespace('view.features').CategoryList = Backbone.View.extend({

    className: 'features-category',

    events: {
        '[data-action="close"]': 'onCloseClick'
    },

    initialize: function() {
        this.head = new EDM.view.features.Category({
            categoryName: this.options.categoryName,
            collection: this.collection
        });
        this.list = new EDM.view.features.List({
            collection: this.collection
        });
        this.button = new EDM.view.form.Button({
            className: 'button-small button-light',
            text: 'Close'
        });
        this.button.on('click', this.close, this);
    },

    render: function() {
        this.$el.html(this.head.render().el);
        this.$el.append(this.list.el);
        this.$el.append('<div class="features-category-footer"></div>');
        this.$('.features-category-footer').append(this.button.render().el);
        return this;
    },

    close: function() {
        return this.trigger('close');
    }

});

(function() {

    var Controller = function(options) {
        this.initialize(options);
    };

    _.extend(Controller.prototype, Backbone.Events, {

        defaults: {},

        initialize: function(options) {
            this.options = _.extend({}, this.defaults, options);
            this.features = new EDM.collection.Features();
            this.features.on('reset', this.renderCategories, this);

            this.$categoriesEl = $('#' + this.options.baseId + '_options');
            this.$featuresEl = $('#' + this.options.baseId + '_category_features_list');
            this.$selectedFeaturesEl = $('#' + this.options.baseId + '_options_list');

            this.categoryListView = new EDM.view.features.CategoryList({
                el: this.$featuresEl,
                collection: new EDM.collection.Features()
            });
            this.categoryListView.render();
            this.categoryListView.on('close', this.closeCategory, this);
            this.categoryListView.list.on('select', this.onSelectFeature, this);

            this.selectedFeatures = new EDM.view.features.SelectedFeatures({
                collection: new EDM.collection.Features()
            });
            this.selectedFeatures.list.on('select', this.onSelectFeature, this);
            $('#' + this.options.baseId + '_list_options').html(this.selectedFeatures.render().el);

            return this;
        },

        onSelectFeature: function(featureId, selected, view) {
            var options = {},
                action = selected ? 'select' : 'deselect';
            options[selected ? 'selectedId' : 'deselectedId'] = featureId;
            this.trigger('vehicle.feature.' + action, featureId);
            this.removeNotification();
            this.selectedItemView = view;
            this.getConfigWithOptions(options);
        },

        getDefaultConfig: function(options) {
            var features = this.features,
                me = this;
            options = options || {};
            this.$categoriesEl.html('<div class="alert">Loading options...</div>');
            this.$featuresEl.hide();
            this.$categoriesEl.show();
            if (!options.previous || this.isNewStyle) {
                this.features.resetState();
            }
            return $.ajax({
                url: 'http://api.edmunds.com/v1/api/configurator/default',
                data: {
                    api_key:    this.options.vehicleApiKey,
                    zip:        this.options.zipCode,
                    styleid:    this.options.styleId
                },
                timeout: 7000,
                dataType: 'jsonp',
                success: function(response) {
                    if (response.error || response.errorMessage) {
                        features.reset();
                        me.updateSelectedList();
                        me.trigger('loaderror');
                        return;
                    }
                    var newFeatures = EDM.collection.Features.fromFeaturesMap(response.featuresMap),
                        additionalFees = me.parseAdditionalFees(response);
                    newFeatures.add(additionalFees);
                    features.reset(newFeatures.models);
                    me.updateFeaturesStatus(response, options.previous, { silent: true });
                    me.trigger('load', response);
                },
                error: function() {
                    features.reset();
                    me.updateSelectedList();
                    me.trigger('loaderror');
                }
            });
        },

        getConfigWithOptions: function(options) {
            var features = this.features,
                listView = this.categoryListView.list,
                me = this;
            if (listView) {
                listView.showLoadingOverlay();
            }
            return $.ajax({
                url: 'http://api.edmunds.com/v1/api/configurator/withOptions',
                data: {
                    zip:        this.options.zipCode,
                    api_key:    this.options.vehicleApiKey,
                    styleid:    this.options.styleId,
                    optionid:   this.features.currentState.selected,
                    selected:   options.selectedId,
                    deselected: options.deselectedId
                },
                traditional: true,
                timeout: 7000,
                dataType: 'jsonp',
                success: function(response) {
                    if (response.errorMessage) {
                        me.updateFeaturesStatus({
                            selectedOption: options.selectedId,
                            deselectedOption: options.deselectedId
                        });
                        return;
                    }
                    if (response.error) {
                        me.trigger('updateerror');
                        return;
                    }
                    if (response.requiredItems.length || response.furtherRemovals.length) {
                        return me.showNotification(response);
                    }
                    me.updateFeaturesStatus(response);
                },
                error: function() {
                },
                complete: function() {
                    if (listView) {
                        listView.hideLoadingOverlay();
                    }
                    me.updateSelectedList();
                }
            });
        },

        resizeCategoryList: function() {
            var categoryEl = this.categoryListView.$el,
                parentHeight = categoryEl.parent().height(),
                listHeight;
            listHeight = parentHeight - (categoryEl.find('.features-category-head').outerHeight() + categoryEl.find('.features-category-footer').outerHeight());
            categoryEl.find('.features-list').height(listHeight);
        },

        parseAdditionalFees: function(response) {
            if(response.error || response.hasOwnProperty('errorType')){
                this.trigger('loaderror');
                return;
            }
            var fees = response.pricingAttributeGroup.attributes,
                FeatureModel = EDM.model.Feature,
                features = [],
                feature;
            // Destination Fee
            if (fees.DELIVERY_CHARGE && fees.DELIVERY_CHARGE.value > 0) {
                feature = new FeatureModel({
                    id: '000000001',
                    name: 'Destination Fee',
                    category: 'Additional Fees',
                    type: FeatureModel.TYPE_OPTION,
                    status: FeatureModel.STATUS_UNAVAILABLE_SELECTED,
                    price: {
                        tmv: Number(fees.DELIVERY_CHARGE.value),
                        baseMSRP: Number(fees.DELIVERY_CHARGE.value),
                        baseInvoice: Number(fees.DELIVERY_CHARGE.value)
                    }
                });
                features.push(feature);
            }
            // Gas Guzzler Tax
            if (fees.GAS_GUZZLER_TAX && fees.GAS_GUZZLER_TAX.value > 0) {
                feature = new FeatureModel({
                    id: '000000002',
                    name: 'Gas Guzzler Tax',
                    category: 'Additional Fees',
                    type: FeatureModel.TYPE_OPTION,
                    status: FeatureModel.STATUS_UNAVAILABLE_SELECTED,
                    price: {
                        tmv: Number(fees.GAS_GUZZLER_TAX.value),
                        baseMSRP: Number(fees.GAS_GUZZLER_TAX.value),
                        baseInvoice: Number(fees.GAS_GUZZLER_TAX.value)
                    }
                });
                features.push(feature);
            }
            // Regional Adjustment
            if (response.tmv && response.tmv.regionalAdjustment) {
                feature = new FeatureModel({
                    id: '000000003',
                    name: 'Regional Adjustment',
                    category: 'Additional Fees',
                    type: FeatureModel.TYPE_OPTION,
                    status: FeatureModel.STATUS_UNAVAILABLE_SELECTED,
                    price: {
                        tmv: Number(response.tmv.regionalAdjustment.tmv),
                        baseMSRP: null,
                        baseInvoice: null
                    }
                });
                features.push(feature);
            }
            // Color Adjustment
            if (response.tmv && response.tmv.colorAdjustment) {
                feature = new FeatureModel({
                    id: '000000004',
                    name: 'Color Adjustment',
                    category: 'Additional Fees',
                    type: FeatureModel.TYPE_OPTION,
                    status: FeatureModel.STATUS_UNAVAILABLE_SELECTED,
                    price: {
                        tmv: Number(response.tmv.colorAdjustment.tmv),
                        baseMSRP: null,
                        baseInvoice: null
                    }
                });
                features.push(feature);
            }
            // Advertising Fee
            feature = new FeatureModel({
                id: '000000005',
                name: 'Advertising Fee',
                category: 'Additional Fees',
                type: FeatureModel.TYPE_OPTION,
                status: FeatureModel.STATUS_UNAVAILABLE_SELECTED,
                price: {
                    tmv: null,
                    baseMSRP: null,
                    baseInvoice: Number(response.tmv.regionalAdFee)
                }
            });
            features.push(feature);
            return features;
        },

        getSelectedOptionsIds: function() {
            var selectedFeatures = this.features.filter(function(feature) {
                return feature.isSelected();
            });
            return _.map(selectedFeatures, function(feature) {
                return feature.get('id');
            });
        },

        showNotification: function(response) {
            function filter(ids) {
                return this.features.filter(function(feature) {
                    return _.contains(ids, feature.get('id'));
                });
            }
            this.removeNotification();
            this.notification = new EDM.view.features.Notification({
                required: filter.call(this, _.without(response.requiredItems, response.selectedOption)),
                excluded: filter.call(this, response.furtherRemovals)
            });
            this.notification.on('ok', function() {
                this.updateFeaturesStatus(response);
                this.removeNotification();
            }, this);
            this.notification.on('cancel', function() {
                this.removeNotification();
            }, this);
            if (this.selectedItemView) {
                this.selectedItemView.$el.addClass('active');
                this.selectedItemView.$el.append(this.notification.render().el);
            }
        },

        removeNotification: function() {
            if (this.notification) {
                this.notification.remove();
            }
            if (this.selectedItemView) {
                this.selectedItemView.$el.removeClass('active');
            }
        },

        updateFeaturesStatus: function(response, previous, options) {
            this.features.applyOptions(response);
            if (previous) {
                this.features.setPreviousState();
            }
            this.updateSelectedList();
            this.categories.refresh();
            this.categoryListView.head.updateTotalPrice();
            if (!options || options && !options.silent) {
                this.trigger('updatestatus');
            }
            return this;
        },

        setStyleId: function(styleId) {
            this.isNewStyle = this.options.styleId !== styleId;
            this.options.styleId = styleId;
            return this;
        },

        setZipCode: function(zipCode) {
            this.options.zipCode = zipCode;
            return this;
        },

        renderCategories: function() {
            this.categories = new EDM.view.features.Categories({
                collection: this.features
            });
            this.categories.on('opencategory', this.openCategory, this);
            this.$categoriesEl.html(this.categories.render().el);
            return this;
        },

        openCategory: function(categoryName, features) {
            this.categoryListView.head.setTitle(categoryName);
            this.categoryListView.collection.reset(features.models);
            this.$categoriesEl.hide();
            this.$featuresEl.show();
            this.resizeCategoryList();
            return this;
        },

        closeCategory: function() {
            this.removeNotification();
            this.$featuresEl.hide();
            this.$categoriesEl.show();
            return this;
        },

        updateSelectedList: function() {
            var features = this.features.filter(function(feature) {
                return feature.isSelected() || feature.isIncluded() || feature.isUnavailableSelected();
            });
            this.selectedFeatures.collection.reset(features);
            this.selectedFeatures.updateTotalPrice().resize();
        },

        setBasePrice: function(basePrice) {
            this.selectedFeatures.updateBasePrice(basePrice);
            return this;
        },

        reset: function() {
            this.$featuresEl.hide();
            this.$categoriesEl.empty();
            this.$categoriesEl.show();
            return this;
        }

    });

    EDM.namespace('controller').VehicleFeatures = Controller;

}());

EDM.namespace('model.dealers').SearchCriteria = Backbone.Model.extend({

    defaults: {
        api_key:        '',
        makeName:       '',
        model:          '',
        styleid:        '',
        zipcode:        '',
        keywords:       '',
        premierOnly:    false,
        radius:         100,
        rows:           5,
        isPublic:       false,
        bookName:       '',
        invalidTiers:   'T1',
        sortBy:         'dealer_distance:asc',
        fmt:            'json'
    }

});

EDM.namespace('model.dealers').Dealer = Backbone.Model.extend({

    defaults: {
        address: {},
        displayinfo: {},
        ratings: {},
        selected: false
    },

    getAddress: function() {
        var address = this.attributes.address;
        return address.city + ', ' + address.stateCode + ' ' + address.zipcode;
    },

    getDistance: function() {
        return parseFloat(this.attributes.displayinfo.dealer_distance).toFixed(2);
    },

    getPhone: function() {
        return this.attributes.displayinfo.dealer_trackable_phone;
    },

    getFullRating: function() {
        return parseFloat(this.attributes.ratings.SALES_OVERALL_RATING) || 0;
    },

    getRatingClassName: function() {
        var fullRating = this.getFullRating();
        return (Math.round(fullRating * 2) / 2).toString().replace('.', '_');
    },

    getReviewsCount: function() {
        var ratings = this.attributes.ratings,
            recommendedCount = parseInt(ratings.SALES_RECOMMENDED_REVIEW_COUNT, 10) || 0,
            notRecommendedCount = parseInt(ratings.SALES_NOT_RECOMMENDED_REVIEW_COUNT, 10) || 0;
        return recommendedCount + notRecommendedCount;
    },

    getSalesReviewsUrl: function() {
        return this.getUrl() + '/sales.1.html';
    },

    getUrl: function() {
        var attributes = this.attributes,
            address = attributes.address;
        return [
            'http://www.edmunds.com/dealerships',
            address.stateName.replace(/\s+/g, ''),
            address.city.replace(/\s+/g, ''),
            attributes.logicalName
        ].join('/');
    },

    isPremier: function() {
        return this.attributes.displayinfo.is_premier === 'true';
    },

    isSelected: function() {
        return this.attributes.selected;
    }

});

EDM.namespace('collection').Dealers = Backbone.Collection.extend({

    url: 'http://api.edmunds.com/v1/api/dealer',

    model: EDM.model.dealers.Dealer,

    parse: function(response) {
        return response.dealerHolder;
    },

    setSelected: function(dealerIds) {
        _.each(dealerIds, function(id) {
            var dealer = this.get(id);
            if (dealer) {
                dealer.set('selected', true);
            } else {
                dealerIds = _.without(dealerIds, id);
            }
        }, this);
        return dealerIds;
    }

});

EDM.namespace('view.dealers').ListItem = Backbone.View.extend({

    className: 'item',

    template: [
        '<div class="item-inner"><div class="item-inner-bg">',
            '<input type="checkbox" value="<%= dealer.get("id") %>" <% if (dealer.isSelected()) { %> checked="checked"<% } %>>',
            '<div class="info">',
                '<span class="name"><%= dealer.get("name") %></span>',
                '<span class="map"><span><%= dealer.getDistance() %> mi</span><%= dealer.getAddress() %> <a href="<%= dealer.getUrl() %>" target="_blank"></a></span>',
                '<span class="phone"><%= dealer.getPhone() %></span>',
                '<span class="rating r<%= dealer.getRatingClassName() %>" title="<%= dealer.getFullRating() %>"></span>',
                '<span class="reviews">',
                    '(<a href="<%= dealer.getSalesReviewsUrl() %>" target="_blank"><%= dealer.getReviewsCount() %> consumer review<% if (dealer.getReviewsCount() > 1) { print("s"); } %></a>)',
                '</span>',
            '</div>',
        '</div></div>'
    ].join(''),

    initialize: function() {
        this.model.on('change', this.render, this);
    },

    render: function() {
        this.el.innerHTML = _.template(this.template, { dealer: this.model });
        if (this.model.isPremier()) {
            this.$el.addClass('premier-dealer');
        }
        return this;
    }

});

EDM.namespace('view.dealers').List = Backbone.View.extend({

    className: 'list',

    events: {
        'click [data-action="select-all"]': 'onSelectAllClick',
        'click [type="checkbox"]': 'onChange'
    },

    initialize: function() {
        this.collection.on('reset', this.render, this);
        this.collection.on('request', this.onRequest, this);
    },

    render: function() {
        if (this.collection.length === 0) {
            return this.showMessage('There are no dealers in our network that are located within your location.');
        }
        if (this.collection.length === 1) {
            this.collection.at(0).set('selected', true);
            this.trigger('change', this.collection.at(0), true);
        }
        this.$el.empty();
        this.collection.each(this.add, this);
        return this;
    },

    add: function(model) {
        var item = new EDM.view.dealers.ListItem({
            model: model
        });
        this.el.appendChild(item.render().el);
        return this;
    },

    showMessage: function(text) {
        this.$el.html('<div class="loading">' + text + '</div>');
        return this;
    },

    onChange: function(event) {
        var el = event.target,
            dealer = this.collection.get(el.value);
        event.preventDefault();
        dealer.set('selected', el.checked);
        this.trigger('change', dealer, el.checked);
    },

    onRequest: function() {
        this.$el.html('<div class="loading">Loading dealers...</div>');
        return this.showMessage('Loading dealers...');
    }

});

EDM.namespace('view').Dealers = Backbone.View.extend({

    events: {
        'click .tab': 'onTabClick'
    },

    selectedDealers: [],

    initialize: function(options) {
        this.premierDealers = new EDM.view.dealers.List({
            collection: new EDM.collection.Dealers()
        });
        this.allDealers = new EDM.view.dealers.List({
            collection: new EDM.collection.Dealers()
        });
        this.premierDealers.on('change', this.onPremierChange, this);
        this.allDealers.on('change', this.onAllChange, this);
        this.searchCriteria = new EDM.model.dealers.SearchCriteria();
        this.searchCriteria.on('change', this.findDealers, this);
        this.searchCriteria.on('change:makeName', this.onMakeChange, this);
    },

    isGMC: function() {
        return this.searchCriteria.get('makeName') === 'GMC';
    },

    onMakeChange: function(searchCriteria, makeName) {
        var isGMC = makeName === 'GMC';
        this.$('.tab[data-tab-id="all"]')[isGMC ? 'show' : 'hide']();
        this.showTabById('premier');
    },

    findDealers: function() {
        this.findPremierDealers();
        if (this.isGMC()) {
            this.findAllDealers();
        }
        return this;
    },

    findAllDealers: function() {
        var me = this;
        this.searchCriteria.set('premierOnly', false, { silent: true });
        return this.allDealers.collection
            .fetch({
                data:       this.searchCriteria.toJSON(),
                dataType:   'jsonp',
                timeout:    7000,
                reset:      true
            })
            .done(_.bind(this.onFindAllDealersDone, this))
            .fail(_.bind(this.onFindAllDealersFail, this));
    },

    findPremierDealers: function() {
        this.searchCriteria.set('premierOnly', true, { silent: true });
        return this.premierDealers.collection
            .fetch({
                data:       this.searchCriteria.toJSON(),
                dataType:   'jsonp',
                timeout:    7000,
                reset:      true
            })
            .done(_.bind(this.onFindPremierDealersDone, this))
            .fail(_.bind(this.onFindPremierDealersFail, this));
    },

    render: function() {
        this.$('.tab-panel-premier').html(this.premierDealers.render().el);
        this.$('.tab-panel-all').html(this.allDealers.render().el);
        return this;
    },

    onFindPremierDealersDone: function() {
        this.selectedDealers = this.premierDealers.collection.setSelected(this.selectedDealers);
    },

    onFindPremierDealersFail: function() {
        this.premierDealers.collection.reset();
    },

    onFindAllDealersDone: function() {
        this.selectedDealers = this.allDealers.collection.setSelected(this.selectedDealers);
    },

    onFindAllDealersFail: function() {
        this.premierDealers.collection.reset();
    },

    onTabClick: function(event) {
        var currentTab = $(event.currentTarget),
            activeClass = 'active';
        if (currentTab.hasClass(activeClass)) {
            return;
        }
        this.showTabById(currentTab.data('tabId'));
    },

    showTabById: function(id) {
        var activeClass = 'active';
        this.$('.tab')
            .removeClass(activeClass)
            .filter('[data-tab-id="' + id + '"]')
                .addClass(activeClass);
        this.$('.tab-panel')
            .removeClass(activeClass)
            .filter('.tab-panel-' + id)
                .addClass(activeClass);
        return this;
    },

    onAllChange: function(dealer, selected) {
        var dealerId = dealer.get('id'),
            premierDealer = this.premierDealers.collection.get(dealerId);
        if (premierDealer) {
            premierDealer.set('selected', selected);
        }
        if (selected) {
            this.selectedDealers = _.union(this.selectedDealers, [dealerId]);
        } else {
            this.selectedDealers = _.without(this.selectedDealers, dealerId);
        }
        this.trigger(selected ? 'select' : 'deselect', dealer);
    },

    onPremierChange: function(premierDealer, selected) {
        var premierDealerId = premierDealer.get('id'),
            dealer = this.allDealers.collection.get(premierDealerId);
        if (dealer) {
            dealer.set('selected', selected);
        }
        if (selected) {
            this.selectedDealers = _.union(this.selectedDealers, [premierDealerId]);
        } else {
            this.selectedDealers = _.without(this.selectedDealers, premierDealerId);
        }
        this.trigger(selected ? 'select' : 'deselect', premierDealer);
    },

    getSelected: function() {
        var dealers = new EDM.collection.Dealers(),
            filter = function(dealer) {
                return dealer.get('selected');
            };
        dealers.add(this.allDealers.collection.filter(filter));
        dealers.add(this.premierDealers.collection.filter(filter));
        return dealers;
    },

    reset: function() {
        this.selectedDealers = [];
        this.allDealers.collection.reset();
        this.premierDealers.collection.reset();
        this.searchCriteria.unset('makeName', { silent: true });
        return this;
    }

});


}(window.EDM, window.jQuery, window._, window.Backbone));