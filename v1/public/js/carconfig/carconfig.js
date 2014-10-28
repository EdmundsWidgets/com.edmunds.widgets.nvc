(function(EDM) {
    'use strict';
    
    // utils shortcut
    var $ = EDM.Util;

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
                    bookName: 'DealerLocatorRuleBook',
                    apiKey: dealerApiKey,
                    premierOnly: true,
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
            rootElement.innerHTML = $.renderTemplate(NVC.template, {
                titleTooltip: NVC.TOOLTIP_TITLE,
                baseId: baseId,
                nav: nav,
                baseClass: me.getBaseClass()
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
                tmvPriceSection = document.getElementById(baseId + '_tmvprice');

            // cache elements
            _tabsListElement   = document.getElementById(baseId + '_tabs').getElementsByTagName('div');
            _tabContentElement = document.getElementById(baseId + '_tab_content');

            // style configurator
            this.styleConfigurator = new EDM.nvc.StyleConfigurator({
                apiKey: apiKey,
                includedMakes: options.includedMakes
            });
            document.getElementById(baseId + '_filters').appendChild(this.styleConfigurator.render().el);

            // vehicle photos
            this.vehiclePhotos = new EDM.nvc.VehiclePhotos(apiKey, options.colorScheme);
            document.getElementById(baseId + '_vehicle_details').appendChild(this.vehiclePhotos.el);
            // vehicle description
            this.vehicleDetails = new EDM.nvc.VehicleDetails();
            document.getElementById(baseId + '_vehicle_details').appendChild(this.vehicleDetails.el);
            this.vehicleDetails2 = new EDM.nvc.VehicleDetails();
            document.getElementById(baseId + '_vehicle_details2').appendChild(this.vehicleDetails2.el);
            this.vehicleDetails3 = new EDM.nvc.VehicleDetails();
            document.getElementById(baseId + '_vehicle_details3').appendChild(this.vehicleDetails3.el);
            // vehicle options
            this.vehicleOptions = new EDM.nvc.VehicleOptions(apiKey, baseId, options.styleId, defaultZipCode);
            // vehicle zip on first tab
            this.zipField = new EDM.ui.ZipField({ apiKey: apiKey, zip: defaultZipCode });
            //document.getElementById(baseId + '_zip_configure').appendChild(this.zipField.el);
            //this.zipField.render();
            // TODO
            this.zipUpdate = new EDM.ui.ZipUpdate({
                apiKey: apiKey,
                zip: defaultZipCode
            });
            document.getElementById(baseId + '_zip_configure').appendChild(this.zipUpdate.el);
            this.zipUpdate.render();

            // vehicle config for Lead Form
            this.configLeadForm = new EDM.nvc.ConfigLeadForm(apiKey);
            // vehicle price
            this.vehiclePrice = new EDM.nvc.VehiclePrice();
            // vehicle dealers
            this.dealers = new EDM.nvc.VehicleDealers(dealersOptions.apiKey);
            // vehicle dialog
            this.messageDialog = new EDM.nvc.MessageDialog();
            // vehicle zip and radius elements
            this.zipMiField = new EDM.nvc.ZipMiField(zipMiRoot, apiKey, dealersOptions);
            // vehicle zip location
            this.zipLocation = new EDM.nvc.ZipLocation(zipLocationRoot, apiKey);
            // vehicle options list
            this.optionsList = new EDM.nvc.OptionsList(rootList, apiKey);
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
                me.showTab(_tabsListElement[1]);
                me.vehiclePrice.updateGraph();
            };

            button2.onclick = function() {
                me.showTab(_tabsListElement[2]);
            };

            button3.onclick = function() {
                var config = me.configLeadForm.config,
                    options = {
                        isSuccess: true,
                        name: config.year + ' ' + config.make + ' ' + config.model, //"2013 BMW 6 Series Gran Couple Sedan",
                        dealers: []
                    },
                    url, xhr,
                    optdlr, opt,
                    dealersIds = [], optIds = [],
                    //callback = EDM.util.Function.bind(onSubmitForm, this),
                    isEmptyDealer = isEmpty(config.dealers),
                    //dealerMsgError = button3.parentNode.getElementsByClassName('msg-error')[0],
                    dealerMsgError = getElementsByClassName('msg-error', 'div', button3.parentNode)[0],
                    dealerMsg = document.createElement('div'),

                    dealerApi = new EDMUNDSAPI.Vehicle(dealerApiKey);

                if (dealerMsgError){
                    button3.parentNode.removeChild(dealerMsgError);
                }

                if (isEmptyDealer) {
                    dealerMsg.className = "msg-error";
                    dealerMsg.innerHTML = "At least 1 dealer must be selected.";
                    button3.parentNode.appendChild(dealerMsg);
                    return;
                }

                for (optdlr in config.dealers) {
                    dealersIds.push(optdlr);
                    options.dealers.push(config.dealers[optdlr].name);
                }
                for (opt in config.options) {
                    optIds.push(opt);
                }

                url = [
                    // vehicle
                    'make='         + config.make,
                    'model='        + config.modelNiceName,
                    'year='         + config.year,
                    'style='        + config.styleid,
                    // options
                    'optIds='       + optIds.join(','),
                    // dealers
                    'pqrf_sbmtdlr=' + dealersIds.join('&pqrf_sbmtdlr='),
                    // zipcode
                    'zip='          + config.zip,
                    // contacts
                    'firstname='    + config.firstname,
                    'lastname='     + config.lastname,
                    'email='        + config.email,
                    // phone
                    'area_code='    + config.phoneCode,
                    'phone_prefix=' + config.phonePrefix,
                    'phone_suffix=' + config.phoneSuffix,
                    // keys
                    'client_key='   + EDM.util.ClientKeyGenerator.generate(16, 36)
                ].join('&');

                function showMessage(options) {
                    rootElement.appendChild(me.messageDialog.render(options).el);
                    me.messageDialog.init();
                    me.messageDialog.on('reset', function() {
                        me.showTab(_tabsListElement[0]);
                        me.styleConfigurator.reset();
                        me.zipUpdate.zipField.reset(defaultZipCode);
                        me.vehicleForm.resetValues();
                        me.styleConfigurator.loadMakes();
                    });
                }

                var btnText = button3.innerHTML;
                button3.setAttribute('disabled', 'disabled');
                button3.innerHTML = 'Getting dealer quotes...';

                var pending = true;
                var timeout = 5000;

                setTimeout(function() {
                    if (pending) {
                        pending = false;
                        options.isSuccess = false;
                        showMessage(options);
                        button3.removeAttribute('disabled');
                        button3.innerHTML = btnText;
                    }
                }, timeout);

                dealerApi.submitLeadForm(url, function(response) {
                    if (pending) {
                        pending = false;
                        options.isSuccess = !response.error;
                        showMessage(options);
                        button3.removeAttribute('disabled');
                        button3.innerHTML = btnText;
                    }
                });

            };

            this.styleConfigurator.on('complete', function(options) {
                // set dealer options
                dealersOptions.makeName = options.makeName;
                dealersOptions.model = options.modelName;
                dealersOptions.styleId = options.styleId;
                // set lead form options
                this.configLeadForm.setOption('make', options.makeId);
                this.configLeadForm.setOption('makeName', options.makeName);
                this.configLeadForm.setOption('model', options.modelName);
                this.configLeadForm.setOption('modelNiceName', options.modelNiceName);
                this.configLeadForm.setOption('year', options.yearName);
                this.configLeadForm.setOption('styleName', options.styleName);
                this.configLeadForm.setOption('styleid', options.styleId);
                // reinit events

                isOptionsLoaded = false;
                toggleButtonState();

                if (this.zip) {
                    this.zipUpdate.enable();
                    this.vehiclePhotos.loadPhotos(options.styleId);
                    this.vehicleOptions.loadOptions(options.styleId);
                } else {
                    this.zipUpdate.showZipError();
                    this.zipUpdate.disable();
                }

                hasStyleId = true;
                toggleButtonState();
                this.resizeOptionsContainer();

                me.zipMiField.render(apiKey);
                me.zipMiField.zipField.el.value = dealersOptions.zipcode;

                me.zipLocation.render(apiKey);
                me.zipLocation.zipField.el.value = dealersOptions.zipcode;
                me.zipLocation.loadlocation();

                me.configLeadForm.setOption('zip', dealersOptions.zipcode);

                if (me.optionsList) {
                    me.optionsList.el.innerHTML = '';
                }

                // render optionsList and VehicleDealers whene location loaded
                me.zipLocation.off('location-load');
                me.zipLocation.on('location-load', function(){
                    var zip = me.zipLocation.zipField.el.value;

                    // update Zip fields
                    me.zipMiField.zipField.el.value = zip;
                    me.zipUpdate.zipField.el.value = zip;

                    me.configLeadForm.setOption('options', me.vehicleOptions.selectedList);
                    me.vehicleOptions.zipCode = zip;

                    me.optionsList.on('render', function(totalPrice){
                        me.resizeTMVTab();
                    });
                    // update dealers list
                    dealersOptions.zipcode = zip;

                    me.configLeadForm.setOption('zip', zip);

                    me.dealers.loadDealers(dealersRoot, dealersOptions);
                    me.optionsList.loadList(zip, dealersOptions.styleId, me.vehicleOptions.selectedList);
                });

                me.vehicleOptions.off('update-selected');
                me.vehicleOptions.on('update-selected', function(selectList){
                    var zip = me.zipLocation.zipField.el.value;
                    me.optionsList.list = selectList;
                    me.configLeadForm.setOption('options', selectList);
                    me.optionsList.loadList(zip, dealersOptions.styleId, selectList);
                });

                me.optionsList.off('listLoad');
                me.optionsList.on('listLoad', function(totalPrice){
                    var options = me.configLeadForm.config,
                        descrData = {
                            name: [options.year, options.makeName, options.model].join(' '),
                            description: options.styleName
                        };
                    descrData.price = totalPrice.msrp.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join(',');
                    me.vehicleDetails.render(descrData, true);
                    me.vehicleDetails2.render(descrData, false);
                    me.vehicleDetails3.render(descrData, false);

                    me.totalPrice = totalPrice;

                    me.vehiclePrice.render(rootPrice, me.totalPrice);

                    me.resizeTMVTab();

                    me.configLeadForm.setOption('price', totalPrice);
                    me.configLeadForm.setOption('options', me.vehicleOptions.selectedList);

                    var price = totalPrice.tmv;
                    price = price.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join(',');
                    tmvPriceSection.innerHTML = 'True Market Value<sub>&reg;</sub>:&nbsp;<sub class="currency">$</sub><span class="price">' + price + '</span>';
                });

                me.optionsList.off('del-option');
                me.optionsList.on('del-option', function(property){
                    var vehicleOptions = me.vehicleOptions,
                        optionsList = me.optionsList,

                    link = property.element,
                    trElement = link.parentNode.parentNode.parentNode,

                    feature = vehicleOptions.getFeatureById(property.id),
                    element = vehicleOptions.getFeatureElementById(property.id),
                    category = feature.category,
                    group = feature.group,

                    head = document.getElementById(baseId + '_' + feature.category + '_'+feature.group),
                    //footBtn = head.parentNode.getElementsByClassName('foot')[0].getElementsByTagName('button')[0],
                    footBtn = getElementsByClassName('foot', 'div', head.parentNode)[0].getElementsByTagName('button')[0],
                    groupControl = vehicleOptions.getInstanceByCategoryGroup(category, group);

                    element.checked = false;
                    groupControl.trigger('change', {
                        element: element,
                        options: feature,
                        head: head,
                        footBtn: footBtn
                    }, { silent: true });
                });

                me.zipMiField.off('update-dealers');
                me.zipMiField.on('update-dealers', function() {
                    var zip = me.zipMiField.zipField.el.value,
                        dealerMsgError = getElementsByClassName('msg-error', 'div', button3.parentNode)[0];
                    me.zipLocation.zipField.el.value = zip;
                    me.zipLocation.zip = zip;
                    dealersOptions.radius = me.zipMiField.miField.el.value;
                    dealersOptions.zipcode = zip;
                    me.vehicleOptions.zipCode = zip;

                    me.configLeadForm.setOption('radius', me.zipMiField.miField.el.value);
                    me.configLeadForm.setOption('zip', zip);

                    me.zipLocation.loadlocation();
                    if (dealerMsgError){
                        button3.parentNode.removeChild(dealerMsgError);
                    }
                });

                _tabsListElement[1].className = _tabsListElement[1].className.replace('disable', '');
                _tabsListElement[2].className = _tabsListElement[2].className.replace('disable', '');

            }, this);

            this.styleConfigurator.on('error', function(errorText) {
                rootElement.appendChild(me.messageDialog.render({
                    isSuccess: false,
                    text: errorText || '<p>Something went wrong!</p><p>Please return and try again or <a href="Mailto:api@edmunds.com">contact</a> us directly.</p>'
                }).el);
                me.messageDialog.init();
            });

            this.vehicleOptions.on('loaderror', function() {
                button.setAttribute('disabled', 'disabled');
                setInitialTabsState();
            });

            this.styleConfigurator.on('reset', function(options) {
                this.vehiclePhotos.reset();
                this.vehicleDetails.reset();
                this.vehicleOptions.reset();
                this.configLeadForm.reset({
                    contacts: true,
                    zip: true
                });
                this.vehicleForm.resetValues();
                hasStyleId = false;
                setInitialTabsState();
            }, this);

            this.zipUpdate.on('update', function(zipCode) {
                var styleId = this.configLeadForm.config.styleid;

                isOptionsLoaded = false;
                toggleButtonState();

                dealersOptions.zipcode = zipCode;
                this.configLeadForm.setOption('zip', zipCode);
                this.vehicleOptions.zipCode = zipCode;
                hasZipCode = true;

                if (hasStyleId) {
                    this.vehiclePhotos.loadPhotos(styleId);
                    this.vehicleOptions.loadOptions(styleId);
                    //setInitialTabsState();
                }

            }, this);

            this.vehicleOptions.on('load', function(response) {
                /*
                var options = this.configLeadForm.config,
                    descrData = {
                        name: [options.year, options.makeName, options.model].join(' '),
                        description: options.styleName
                    },
                    msrp = '0';
                try {
                    msrp = response.tmv.nationalBasePrice.baseMSRP + '';
                } catch(e) {
                }
                descrData.price = msrp.split( /(?=(?:\d{3})+(?:\.|$))/g ).join(',');
                this.vehicleDetails.render(descrData, true);
                this.vehicleDetails2.render(descrData, false);
                this.vehicleDetails3.render(descrData, false);
                */
                isOptionsLoaded = true;
                toggleButtonState();
            }, this);

            this.vehicleOptions.on('change', function(obj, options) {
                if (options && options.silent) {
                    return;
                }
                //setInitialTabsState();
            });

            this.dealers.on('dealer-selected', function(selectedDealers){
                //var dealerMsgError = button3.parentNode.getElementsByClassName('msg-error')[0];
                var dealerMsgError = getElementsByClassName('msg-error', '', button3.parentNode)[0];
                this.configLeadForm.setOption('dealers', selectedDealers);
                if (dealerMsgError){
                    button3.parentNode.removeChild(dealerMsgError);
                }
            }, this);

            this.dealers.on('dealersLoad', function(){
                this.configLeadForm.setOption('dealers', {});
            }, this);

            this.dealers.on('render', function(selectedDealers){
                this.resizePriceQuotesTab();
            }, this);

            this.dealers.on('dealers-available', function(isAvailable){
                var dealerMsgError = getElementsByClassName('msg-error', 'div', button3.parentNode)[0];
                this.vehicleForm.changeAvailable(isAvailable);
                button3.disabled = !isAvailable;
                if (!isAvailable){
                    if (dealerMsgError){
                        button3.parentNode.removeChild(dealerMsgError);
                    }
                }
            }, this);

            this.vehicleForm.on('update-request-form', function(field){
                this.configLeadForm.setOption(field.name, field.value);
            }, this);

            this.configLeadForm.on('readytosubmit', function(isValidLeadForm){
                button3.disabled = !isValidLeadForm;
            }, this);

            function setInitialTabsState() {
                toggleButtonState();
                _tabsListElement[1].className += !/disable/.test(_tabsListElement[1].className) ? ' disable' : '';
                _tabsListElement[2].className += !/disable/.test(_tabsListElement[2].className) ? ' disable' : '';
            }

            // TODO 'each' function

            _tabsListElement[0].onclick = function() {
                if (!/disable/.test(this.className)) {
                    me.trigger('tab:show', this);
                }
                return false;
            };
            _tabsListElement[1].onclick = function() {
                if (!/disable/.test(this.className)) {
                    me.trigger('tab:show', this);
                }
                me.vehiclePrice.updateGraph();
                return false;
            };
            _tabsListElement[2].onclick = function() {
                if (!/disable/.test(this.className)) {
                    me.trigger('tab:show', this);
                }
                return false;
            };

            this.bindEvents();


            this.zipUpdate.disable();

            if (apiKey && dealerApiKey && hasZipCode) {
                this.styleConfigurator.loadMakes();
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
                //listContentElement = _tabContentElement.getElementsByClassName(baseClass+'-tab-inner'),
                listContentElement = getElementsByClassName(baseClass+'-tab-inner', '', _tabContentElement),
                length = listContentElement.length;

            for (i = 0; i < length; i = i + 1) {
                var cls = _tabsListElement[i].className;
                _tabsListElement[i].className = 'tab'+(i+1);
                if (/disable/.test(cls)) {
                    _tabsListElement[i].className += ' disable';
                }
                listContentElement[i].className = baseClass + '-tab-inner hide';
            }
            element.className = id + ' active';
            document.getElementById(baseId + '_' + id).className = baseClass + '-tab-inner';
            this.trigger(id + ':showed');
            return this;
        };

    };

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
    /**
     * `template` HTML template - widget view
     * @property template
     * @static
     * @type {HTMLDivElement}
     */
    NVC.template = [
        '<div class="<%= baseClass %>-inner <%= nav %>">',
            '<div class="<%= baseClass %>-header noise-bg">',
                '<span class="title">NEW VEHICLE CONFIGURATOR</span><span class="question" onclick=""><sup>?</sup><div class="nvcwidget-tooltip"><div class="arrow-left"></div><%= titleTooltip %></div></span>',
            '</div>',
            '<div class="<%= baseClass %>-tabs" id="<%= baseId %>_tabs">',
                '<div class="tab1 active" id="<%= baseId %>-tab1">Configure</div>',
                '<div class="tab2 disable" id="<%= baseId %>-tab2">TMV&reg;</div>',
                '<div class="tab3 disable" id="<%= baseId %>-tab3">Price Quotes</div>',
            '</div>',
            '<div class="<%= baseClass %>-tab-content" id="<%= baseId %>_tab_content">',
                '<div class="<%= baseClass %>-tab-inner" id="<%= baseId %>_tab1">',
                    '<div class="noise-bg">',
                        '<div class="<%= baseClass %>-filters bottom-shadow">',
                            '<div class="filters" id="<%= baseId %>_filters"></div>',
                            '<div class="zip-code" id="<%= baseId %>_zip_configure"></div>',
                            '<div class="<%= baseClass %>-image" id="<%= baseId %>_vehicle_details"></div>',
                        '</div>',
                    '</div>',
                    '<div class="<%= baseClass %>-options-outer">',
                        '<form onclick=""><div class="<%= baseClass %>-options" id="<%= baseId %>_options"></div></form>',
                    '</div>',
                    '<div class="<%= baseClass %>-nav-bottom">',
                        '<button type="button" disabled="disabled" id="<%= baseId %>_button" class="button-block">Get Price</button>',
                    '</div>',
                '</div>',
                '<div class="<%= baseClass %>-tab-inner hide" id="<%= baseId %>_tab2">',
                    '<div class="<%= baseClass %>-inner-header">',
                        '<div class="<%= baseClass %>-image" id="<%= baseId %>_vehicle_details3"></div>',
                    '</div>',
                    '<div class="shadow-top noise-bg">',
                        '<div class="<%= baseClass %>-body">',
                            '<div class="<%= baseClass %>-inner-zip zip-location" id="<%= baseId %>_zip_location"></div>',
                            '<div class="<%= baseClass %>-list-options" id=<%= baseId %>_list_options></div>',
                            '<div class="<%= baseClass %>-price" id="<%= baseId %>_price"></div>',
                            /*
                            '<div class="<%= baseClass %>-body-bottom">',
                                '<div class="top"><span>Incentives</span><button type="button" class="button-light">INCLUDE IN TMV&reg;</button></div>',
                                '<div class="bottom"><a href="#">Customer Cash</a><span>$896</span></div>',
                            '</div>',
                            '<div class="<%= baseClass %>-body-foot"><a href="#" class="print">print</a><a href="#" class="email">e-mail</a></div>',
                            */
                        '</div>',
                    '</div>',
                    '<div class="<%= baseClass %>-top-footer"><button type="button" id="<%= baseId %>_button2">GET PRICE QUOTE</button><span>Next Step</span></div>',
                '</div>',
                '<div class="<%= baseClass %>-tab-inner hide" id="<%= baseId %>_tab3">',
                    '<div class="<%= baseClass %>-inner-header">',
                        '<div class="<%= baseClass %>-image" id="<%= baseId %>_vehicle_details2"></div>',
                        '<div class="tmvprice" id="<%= baseId %>_tmvprice"></div>',
                    '</div>',
                    '<div class="shadow-top noise-bg">',
                        '<div class="<%= baseClass %>-body">',
                            '<div class="<%= baseClass %>-inner-zip" id="<%= baseId %>_zip_mi"></div>',
                            '<div class="<%= baseClass %>-list-dealer"></div>',
                            '<div class="<%= baseClass %>-body-foot"><a href="#" class="print">print</a><a href="#" class="email">e-mail</a></div>',
                        '</div>',
                    '</div>',
                    '<div class="<%= baseClass %>-top-footer" id="<%= baseId %>_form">',
                    '</div>',
                    '<div class="<%= baseClass %>-nav-bottom">',
                        '<button type="button" disabled class="button-green" id="<%= baseId %>_button3">GET DEALER QUOTE</button>',
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

EDM.namespace('ui').Validator = (function() {


    var ruleRegex = /^(.+?)\[(.+)\]$/,
        spaceRegex = /^a+|a+$/g,
        numericRegex = /^[0-9]+$/,
        integerRegex = /^\-?[0-9]+$/,
        decimalRegex = /^\-?[0-9]*\.?[0-9]+$/,
        emailRegex = /^[a-zA-Z0-9.!#$%&amp;'*+\-\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/,
        alphaRegex = /^[a-z]+$/i,
        alphaNumericRegex = /^[a-z0-9]+$/i,
        alphaDashRegex = /^[a-z0-9_\-]+$/i,
        naturalRegex = /^[0-9]+$/i,
        naturalNoZeroRegex = /^[1-9][0-9]*$/i,
        ipRegex = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,
        base64Regex = /[^a-zA-Z0-9\/\+=]/i,
        numericDashRegex = /^[\d\-\s]+$/,
        urlRegex = /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
        contains = EDM.util.Array.contains;

    function Validator(){
    }

    /*
     * Define the regular expressions that will be used
     */


    Validator.prototype = {

        required: function(field) {
            var value = field.value;
            return (value !== null && value !== '');
        },
        alpha: function(field){
            return (alphaRegex.test(field.value));
        },    

        decimal: function(field) {
            return (decimalRegex.test(field.value) || !field.value.length);
        },

        excludeCode: function(field){
            var excludeList = [222, 333, 411, 444, 456, 500, 555, 666, 777, 911, 900, 999],
                value = field.value;
            value = parseInt(value, 10);
            return (!contains(excludeList, value));
        },

        minLength: function(field){
            var value = field.value,
                minLength = field.maxLength;
            return (value.length === minLength);
        },

        email: function(field) {
            return emailRegex.test(field.value);
        },

        maxValue: function(field){
            return (field.value <= 100);
        },

        integer: function(field) {
            return (integerRegex.test(field.value));
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

EDM.namespace('ui').ZipField = (function() {

    var // dependencies
        View = EDM.ui.View,
        Tooltip = EDM.ui.Tooltip,
        RegionApi = EDM.api.Region,
        KeyCode = EDM.event.KeyCode,
        contains = EDM.util.Array.contains;

    return View.extend({

        tagName: 'input',

        className: 'zip-field',

        attributes: {
            type: 'text',
            placeholder: 'ZIP',
            title: 'ZIP Code',
            maxlength: 5
        },

        events: {
            change: 'onChange',
            keyup: 'validate',
            keypress: 'onKeyPress',
            blur: 'onBlur'
        },

        initialize: function(options) {
            var tooltip = this.tooltip = new Tooltip({
                className: 'nvcwidget-tooltip',
                text: 'Please enter a valid Zip Code'
            });
            this.defaultZip = options.zip;
            tooltip.hide();
            this.on('valid', tooltip.hide, tooltip);
            this.on('error', tooltip.show, tooltip);
            this.on('change', this.validate, this);
            // create Region Api instance
            this.regionApi = new EDM.api.Region(options.apiKey);
        },

        render: function() {
            var zipLabel = document.createElement('label'),
                el = this.el;
            zipLabel.innerHTML = 'ZIP:';
            this.el.setAttribute('value', this.defaultZip ? this.defaultZip : '');
            if (el.parentNode) {
                el.parentNode.insertBefore(zipLabel, el);
                el.parentNode.insertBefore(this.tooltip.el, el.nextSibling);
            }
            return this;
        },

        reset: function(zipCode) {
            var hasDefault = zipCode ? true : false;
            this.defaultZip = zipCode;
            this.el.value = zipCode;
            if (hasDefault === true) {
                this.trigger('valid', zipCode);
            }
            else {
                this.trigger('error');
            }
            this.tooltip.hide();
        },

        onChange: function() {
            this.trigger('change');
        },

        validate: function() {
            var value = this.el.value,
                regZip = /\d{5}/,
                callback = EDM.util.Function.bind(this.onZipLoad, this);
            //this.trigger('error');
            if (regZip.test(value)) {
                this.regionApi.getValidZip(value, callback);
                return this;
            }
            return this.trigger('error');
        },

        onZipLoad: function(response) {
            var value = this.el.value;
            if (response[value] && response[value] === 'true') {
                return this.trigger('valid', value);
            }
            return this.trigger('error');
        },

        onBlur: function() {
            this.trigger('blur');
        },

        onKeyPress: function(event) {
            event = event || window.event;
            var keyCode = event.which || event.keyCode,
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
            if (contains(allowedKeys, keyCode)) {
                return;
            }
            if (String.fromCharCode(keyCode).match(/\d/)) {
                return;
            }
            if (event.preventDefault) {
                event.preventDefault();
            }
            return false;
        },

        enable: function() {
            this.el.removeAttribute('disabled');
            return this;
        },

        disable: function() {
            this.el.setAttribute('disabled', 'disabled');
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
        }

    });

}());

EDM.namespace('ui').VehicleForm = (function() {

    var // dependencies
        View = EDM.ui.View,
        Tooltip = EDM.ui.Tooltip,
        TextField = EDM.ui.TextField,
        RegionApi = EDM.api.Region,
        KeyCode = EDM.event.KeyCode,
        template = EDM.template,
        contains = EDM.util.Array.contains;

    return View.extend({

        initialize: function(options) {
            var firstname = this.firstname = new TextField({
                    attributes: {
                        type: 'text',
                        name: 'firstname',
                        title: 'First Name',
                        required: 'required',
                        maxlength: 100
                    },
                    validators: {
                        required: {
                            message: 'The %s field is required'
                        },
                        alpha: {
                            message: 'The %s field is invalid'
                        }
                    }
                }),
                lastname = this.lastname = new TextField({
                    attributes: {
                        type: 'text',
                        name: 'lastname',
                        title: 'Last Name',
                        required: 'required',
                        maxlength: 100
                    },
                    validators: {
                        required: {
                            message: 'The %s field is required'
                        },
                        alpha: {
                            message: 'The %s field is invalid'
                        }
                    }
                }),
                email = this.email = new TextField({
                    attributes: {
                        type: 'text',
                        name: 'email',
                        title: 'E-mail',
                        required: 'required',
                        maxlength: 100
                    },
                    validators: {
                        required: {
                            message: 'The %s field is required'
                        },
                        email: {
                            message: 'The %s field is invalid'
                        }
                    }
                }),
                phoneCode = this.phoneCode = new TextField({
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
                        excludeCode: {
                            message: 'Must not be 222, 333, 411, 444, 456, 500, 555, 666, 777, 911, 900, or 999'
                        },
                        decimal: {
                            message: '%s must contain 3 digits'
                        },
                        minLength: {
                            message: '%s must contain 3 digits'
                        },
                        integer: {
                            message: 'The %s field is invalid'
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
                        decimal: {
                            message: '%s must contain 3 digits'
                        },
                        minLength: {
                            message: '%s must contain 3 digits'
                        },
                        integer: {
                            message: 'The %s field is invalid'
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
                        decimal: {
                            message: '%s must contain 4 digits'
                        },
                        minLength: {
                            message: '%s must contain 4 digits'
                        },
                        integer: {
                            message: 'The %s field is invalid'
                        }
                    }
                });

            //this.on('error', tooltip.show, tooltip);

            this.fields = [
                firstname,
                lastname,
                email,
                phoneCode,
                phonePrefix,
                phoneSuffix
            ];

            this.template = template(this.template);
        },

        bindEvents: function(){
            this.firstname.on('change', this.validate, this);
            this.lastname.on('change', this.validate, this);
            this.email.on('change', this.validate, this);
            this.phoneCode.on('change', this.validate, this);
            this.phonePrefix.on('change', this.validate, this);
            this.phoneSuffix.on('change', this.validate, this);
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
                i;

            this.root = root;
            if (root){
                root.innerHTML = this.template({});
            }
            formElement = getElementsByClassName('form', '', root)[0];
            for (i = 0; i < length; i = i + 1) {
                fields[i].render(formElement);
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
                value: fieldInfo.isValid ? fieldInfo.fieldValue : ''
            });
        },

        changeAvailable: function(isAvailable){
            var fields = this.fields,
                field;
            for (field in fields) {
                if (fields.hasOwnProperty(field)){
                    fields[field].el.disabled = isAvailable ? false : true;
                }
            }
        },

        template: '<span class="rule"><b>2.</b> Request free price quote by using the form below and find the best deals</span><div class="form"></div>'

    });

}());

EDM.namespace('nvc').Select = (function() {

    var Observable = EDM.mixin.Observable,
        Element = EDM.dom.Element;

    function Select(options) {
        var el = document.createElement('select'),
            $el = new Element(el);
        // make observable
        Observable.call(this);
        // store elements
        this.el = el;
        this.$el = $el;
        this.initialize.apply(this, arguments);
        this.bindEvents();
    }

    Select.prototype = {

        defaultText: 'Please select an item',

        noItems: 'Not found items',

        initialize: function(options) {
            // set options
            options = options || {};
            if (options.title) {
                this.el.setAttribute('title', options.title);
            }
            this[options.disabled === true ? 'disable': 'enable']();
            this.defaultText = options.defaultText || this.defaultText;
            this.noItemsText = options.noItemsText || this.noItemsText;
        },

        bindEvents: function() {
            var me = this;
            this.$el.on('change', function(event) {
                var target = event.target || event.srcElement;
                me.trigger('change', target.value);
            });
        },

        render: function(items, optionText) {

            this.empty();

            optionText = optionText || this.defaultText;
            if (optionText) {
                this.add({ id: '', name: optionText });
            }

            var fr, label;

            if (EDM.util.Array.isArray(items)) {
                if (items.length) {
                    fr = this.getOptionsFragment(items);
                } else {
                    this.reset(this.noItemsText);
                }
            } else {
                fr = document.createDocumentFragment();
                for (label in items) {
                    var optgroup = document.createElement('optgroup');
                    optgroup.setAttribute('label', label);
                    optgroup.appendChild(this.getOptionsFragment(items[label]));
                    fr.appendChild(optgroup);
                }
            }

            if (fr) {
                this.el.appendChild(fr);
                this.enable();
            }

            return this;
        },

        getOptionsFragment: function(items) {
            var fragment = document.createDocumentFragment(),
                length = (items = items || []).length,
                i = 0,
                item, option;
            for ( ; i < length; i++) {
                item = items[i];
                option = document.createElement('option');
                option.setAttribute('value', item.id);
                option.innerHTML = item.name;
                fragment.appendChild(option);
            }
            return fragment;
        },

        add: function(item) {
            var option = document.createElement('option');
            item = item || {};
            option.setAttribute('value', item.id || '');
            option.innerHTML = item.name || item.id || '';
            this.el.appendChild(option);
            return this;
        },

        empty: function() {
            this.el.innerHTML = '';
            return this;
        },

        reset: function(optionText) {
            this.empty();
            this.disable();
            optionText = optionText || this.defaultText;
            if (optionText) {
                this.add({ id: '', name: optionText });
            }
            this.trigger('reset');
            return this;
        },

        enable: function() {
            this.el.removeAttribute('disabled');
            return this;
        },

        disable: function() {
            this.el.setAttribute('disabled', 'disabled');
            return this;
        }

    };

    return Select;

}());

EDM.namespace('nvc').StyleConfigurator = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDM.api.Vehicle,
        Select = EDM.nvc.Select,
        // helpers
        ArrayUtil = EDM.util.Array,
        isArray = ArrayUtil.isArray,
        contains = ArrayUtil.contains,
        bind = EDM.util.Function.bind;

    function StyleConfigurator() {
        Observable.call(this);
        this.el = document.createElement('div');
        this.el.className = 'vehicle-style-configurator';
        this.initialize.apply(this, arguments);
        this.bindEvents();
    }

    StyleConfigurator.prototype = {

        initialize: function(options) {
            options = options || {};
            // define Vehicle API
            this.vehicleApi = new VehicleApi(options.apiKey);
            // create select elements
            this.makeSelect = new Select({
                title: 'List of Makes',
                disabled: true,
                defaultText: 'List of Makes',
                noItemsText: 'Makes not found'
            });
            this.modelSelect = new Select({
                title: 'List of Models',
                disabled: true,
                defaultText: 'List of Models',
                noItemsText: 'Models not found'
            });
            this.yearSelect = new Select({
                title: 'List of Years',
                disabled: true,
                defaultText: 'List of Years',
                noItemsText: 'Years not found'
            });
            this.styleSelect = new Select({
                title: 'List of Styles',
                disabled: true,
                defaultText: 'List of Styles',
                noItemsText: 'Styles not found'
            });

            this.selectedValues = {
                make: {},
                model: {},
                year: {},
                style: {},
                // for backword compatibility
                makeId: undefined,
                modelId: undefined,
                yearId: undefined,
                styleId: undefined
            };

            this.options = options;
        },

        bindEvents: function() {
            // change events
            this.makeSelect.on('change', this.onMakeChange, this);
            this.modelSelect.on('change', this.onModelChange, this);
            this.yearSelect.on('change', this.onYearChange, this);
            this.styleSelect.on('change', this.onStyleChange, this);
            // reset events
            this.makeSelect.on('reset', this.modelSelect.reset, this.modelSelect);
            this.modelSelect.on('reset', this.yearSelect.reset, this.yearSelect);
            this.yearSelect.on('reset', this.styleSelect.reset, this.styleSelect);
            this.styleSelect.on('reset', function() {
                this.trigger('reset');
            }, this);
        },

        render: function() {
            var el = this.el;
            el.appendChild(this.makeSelect.render().el);
            el.appendChild(this.modelSelect.render().el);
            el.appendChild(this.yearSelect.render().el);
            el.appendChild(this.styleSelect.render().el);
            this.trigger('render');
            return this;
        },

        reset: function() {
            this.makeSelect.reset();
            return this;
        },

        loadMakes: function() {
            var successCallback = bind(this.onMakesLoad, this),
                errorCallback = bind(this.onMakesLoadError, this);
            this.makeSelect.reset('Loading Makes...');
            this.vehicleApi.getListOfMakes('new', successCallback, errorCallback);
        },

        loadModelsAndYears: function(makeId) {
            var successCallback = bind(this.onModelsAndYearsLoad, this),
                errorCallback = bind(this.onModelsAndYearsLoadError, this);
            this.makeSelect.disable();
            this.modelSelect.reset('Loading Models...');
            this.vehicleApi.getListOfModelsByMake(makeId, successCallback, errorCallback);
        },

        loadStyles: function(makeId, modelId, yearId) {
            var successCallback = bind(this.onStylesLoad, this),
                errorCallback = bind(this.onStylesLoadError, this);
            this.makeSelect.disable();
            this.modelSelect.disable();
            this.yearSelect.disable();
            this.styleSelect.reset('Loading Styles...');
            this.vehicleApi.getVehicle(makeId, modelId, yearId, successCallback, errorCallback);
        },

        // Load success callbacks

        onMakesLoad: function(request) {
            var items;
            if (request.error) {
                return this.onMakesLoadError();
            }
            items = this.parseMakes(request);
            this.makes = items;
            this.makeSelect.render(items, 'Select a Make');
            this.trigger('load:makes', items, request);
            return this;
        },

        onModelsAndYearsLoad: function(request) {
            var items;
            if (request.error) {
                return this.onModelsAndYearsLoadError();
            }
            items = this.parseModels(request);
            this.makeSelect.enable();
            this.modelSelect.render(items, 'Select a Model');
            this.models = request.models;
            this.parserdModels = items;
            this.trigger('load:models', items, request);
            return this;
        },

        onStylesLoad: function(request) {
            var items;
            if (request.error) {
                return this.onStylesLoadError();
            }
            items = this.parseStyles(request);
            this.makeSelect.enable();
            this.modelSelect.enable();
            this.yearSelect.enable();
            this.styles = items;
            this.styleSelect.render(items, 'Select a Style');
            this.trigger('load:styles', items, request);
            return this;
        },

        // Load error callbacks

        onMakesLoadError: function() {
            this.makeSelect.reset('Makes not found');
            return this.trigger('error', StyleConfigurator.MAKES_LOAD_ERROR_TEXT);
        },

        onModelsAndYearsLoadError: function() {
            this.makeSelect.enable();
            this.modelSelect.reset('Models not found');
            return this.trigger('error', StyleConfigurator.MODELS_LOAD_ERROR_TEXT);
        },

        onStylesLoadError: function() {
            this.makeSelect.enable();
            this.modelSelect.enable();
            this.yearSelect.enable();
            this.styleSelect.reset('Styles not found');
            return this.trigger('error', StyleConfigurator.STYLES_LOAD_ERROR_TEXT);
        },
        // Change callbacks

        onMakeChange: function(makeId) {
            this.makeId = makeId;
            this.makeName = this.getMakeNameById(makeId);
            this.modelSelect.reset();
            if (!makeId) {
                return;
            }
            this.loadModelsAndYears(makeId);
            return this;
        },

        onModelChange: function(modelId) {
            this.modelId = modelId;
            this.modelName = this.getModelNameById(modelId);
            this.modelNiceName = (modelId || '').split(':')[0];
            this.yearSelect.reset();
            if (!modelId) {
                return;
            }
            var years = this.parseYears(this.models[modelId], 'NEW');
            this.yearSelect.render(years, 'Select Year');
            return this;
        },

        onYearChange: function(yearId) {
            var modelId = this.modelId,
                model = modelId.substring(0, modelId.indexOf(':'));
            this.yearId = yearId;
            this.styleSelect.reset();
            if (!yearId) {
                return;
            }
            this.loadStyles(this.makeId, model, parseInt(this.yearId, 10));
            return this;
        },

        onStyleChange: function(styleId) {
            var selectedStyle = this.getSelectedStyle(styleId);
            this.styleId = styleId;
            this.styleName = selectedStyle.name;
            this.trigger('reset');
            if (styleId) {
                this.trigger('complete', {
                    makeId: this.makeId,
                    modelId: this.modelId,
                    yearId: this.yearId,
                    styleId: this.styleId,
                    modelNiceName: this.modelNiceName,
                    // temporary
                    makeName: this.makeName,
                    modelName: this.modelName,
                    yearName: (this.yearId || '').replace(/\D+/, ''),
                    styleName: this.styleName
                });
            }
        },

        getMakeNameById: function(id) {
            var records = this.makes,
                length = records.length,
                i = 0;
            for ( ; i < length; i++) {
                if (records[i].id === id) {
                    return records[i].name;
                }
            }
            return '';
        },

        getModelNameById: function(id) {
            var records = this.parserdModels,
                length = records.length,
                i = 0;
            for ( ; i < length; i++) {
                if (records[i].id === id) {
                    return records[i].name;
                }
            }
            return '';
        },

        getStyleNameById: function(id) {
            var records = this.styles,
                length = records.length,
                i = 0;
            for ( ; i < length; i++) {
                if (records[i].id === id) {
                    return records[i].name;
                }
            }
            return '';
        },

        getSelectedStyle: function(styleId) {
            var records = this.styles,
                length = records.length,
                i = 0;
            for ( ; i < length; i++) {
                if (records[i].id === styleId) {
                    return records[i];
                }
            }
            return {};
        },

        // Parsers
        parseMakes: function(request) {
            var result = [],
                records = request.makes,
                includedMakes = this.options.includedMakes,
                makes = (typeof includedMakes === 'string') ? includedMakes.split(',') : [],
                includeAll = includedMakes === 'all',
                key, record;
            for (key in records) {
                record = records[key];
                if (includeAll || contains(makes, record.niceName)) {
                    result.push({
                        id: record.niceName,
                        name: record.name
                    });
                }
            }
            return result;
        },

        parseModels: function(request) {
            var records = request.models,
                showVehicles = 'NEW';
            /**
             * Checking list of years.
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
            /**
             * Mapping for list of models.
             * @param {Array} records List of models
             * @param {String} type
             * @return {Object}
             */
            function mapModels(records, type) {
                var result = [],
                    key, record;
                for (key in records) {
                    record = records[key];
                    if (hasYears(record.years, type)) {
                        result.push({
                            id: key,
                            name: record.name
                        });
                    }
                }
                return result;
            }
            // used or new
            if (showVehicles === 'USED' || showVehicles === 'NEW') {
                return mapModels(records, showVehicles);
            }
            return mapModels(records);
        },

        parseYears: function(request, type) {
            var result = {},
                records = request.years;
            /**
             * Mapping for list of years.
             * @param {Array} years List of years
             * @param {String} type
             * @return {Object}
             */
            function mapYears(years, type) {
                var result = [],
                    length, i, year;
                years = isArray(years) ? years : [];
                length = years.length;
                for (i = 0; i < length; i++) {
                    year = years[i];
                    result.push({
                        id: year + type,
                        name: year
                    });
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
        },

        parseStyles: function(request) {
            var result = [],
                records = request.modelYearHolder[0].styles,
                length = records.length,
                i, record;
            for (i = 0; i < length; i++) {
                record = records[i];
                if (record.publicationState === 'NEW' || record.publicationState === 'NEW_USED') {
                    result.push({
                        id: record.id,
                        name: record.name
                    });
                }
            }
            return result;
        }

    };

    StyleConfigurator.MAKES_LOAD_ERROR_TEXT = '<p>The makes have not been loaded.</p><p>Please return and try again or <a href="Mailto:api@edmunds.com">contact</a> us directly.</p>';

    StyleConfigurator.MODELS_LOAD_ERROR_TEXT = '<p>The models have not been loaded.</p><p>Please return and try again or <a href="Mailto:api@edmunds.com">contact</a> us directly.</p>';

    StyleConfigurator.STYLES_LOAD_ERROR_TEXT = '<p>The styles have not been loaded.</p><p>Please return and try again or <a href="Mailto:api@edmunds.com">contact</a> us directly.</p>';

    return StyleConfigurator;

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
                dealers: {},
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


            if (this.config.firstname.length && this.config.lastname.length && this.config.email.length && this.config.phoneCode.length && this.config.phonePrefix.length && this.config.phoneSuffix.length) {
                isValid = true;
            }
            this.trigger('readytosubmit', isValid);
        },

        reset: function(save) {
            /*var attrs = this.config;
            save = save;
            attrs = {
                apiKey:         this.apiKey,
                make:           '',
                model:          '',
                year:           '',
                styleid:        '',
                zip:            save.zip ? attrs.zip : '',
                options:        [],
                price:          {},
                radius:         100,
                dealers:        '',

                firstname:      save.contacts ? attrs.firstname : '',
                lastname:       save.contacts ? attrs.lastname : '',
                email:          save.contacts ? attrs.email : '',
                phoneCode:      save.contacts ? attrs.phoneCode : '',
                phonePrefix:    save.contacts ? attrs.phonePrefix : '',
                phoneSuffix:    save.contacts ? attrs.phoneSuffix : ''
            };*/
            this.config = {
                apiKey: this.apiKey,
                make: '',
                model: '',
                year: '',
                styleid: '',
                zip: '',
                options: [],
                price: {},
                radius: 100,
                dealers: {},
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
            '<span class="name"><%= details.name %></span>',
            '<span class="desc"><%= details.description %></span>',
            '<% if(showPrice) { %>',
            '<span class="price">Base MSRP:<sup>$</sup>',
                '<span class="value" onclick="">',
                    '<%= details.price %>',
                    '<div class="nvcwidget-tooltip"><div class="arrow-left"></div><%= msrpTooltip %></div>',
                '</span>',
            '</span>',
            '<% } %>'
        ].join('')

    });

}());

EDM.namespace('nvc').VehiclePhotos = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDM.api.Vehicle,
        bind = EDM.util.Function.bind,
        template = EDM.template;

    function VehiclePhotos() {
        Observable.call(this);
        this.el = document.createElement('div');
        this.el.className = 'vehicle-photos';
        this.initialize.apply(this, arguments);
        this.bindEvents();
    }

    VehiclePhotos.prototype = {

        initialize: function(apiKey, colorScheme) {
            this.vehicleApi = new VehicleApi(apiKey);
            this.template = template(this.template);
            this.colorScheme = colorScheme;
        },

        bindEvents: function() {},

        preloadImage: function(url, callback) {
            var img = document.createElement('img');
            img.onload = function() {
                callback(img);
            };
            img.src = url;
        },

        render: function(photos) {
            var me = this;
            this.preloadImage(photos[0], function(img) {
                var span = document.createElement('span');
                span.className = 'image';
                span.appendChild(img);
                me.el.innerHTML = '';
                me.el.appendChild(span);
                me.trigger('render');
            });
            return this;
        },

        loadPhotos: function(styleId) {
            var callback = bind(this.onPhotosLoad, this);
            this.vehicleApi.getPhotosByStyleId(styleId, callback);
        },

        onPhotosLoad: function(response) {
            var photos = this.parsePhotos(response);
            var me = this;
            this.trigger('photosload', photos, response);
            this.render(photos);
        },

        onPhotosLoadError: function() {
            this.trigger('photosloaderror');
        },

        parsePhotos: function(response) {
            var baseUrl = 'http://media.ed.edmunds-media.com',
                length = response.length,
                i = 0,
                photos = [],
                photo;
            for ( ; i < length; i++) {
                photo = response[i];
                if (photo.subType === 'exterior' && (photo.shotTypeAbbreviation === 'S' || photo.shotTypeAbbreviation === 'FQ')) {
                    photos.push(baseUrl + photo.id.replace('dam/photo', '') + '_500.jpg');
                    return photos;
                }
            }
            return photos;
        },

        reset: function() {
            var lightDefaultImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANoAAACSCAIAAACsdEONAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N0FDNUM4MkZCMTlCMTFFMjkyNTRGRDI4NEFFNEY0NUQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6N0FDNUM4MzBCMTlCMTFFMjkyNTRGRDI4NEFFNEY0NUQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3QUM1QzgyREIxOUIxMUUyOTI1NEZEMjg0QUU0RjQ1RCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo3QUM1QzgyRUIxOUIxMUUyOTI1NEZEMjg0QUU0RjQ1RCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PpUWm78AABCtSURBVHja7J2LeqLK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',
                darkDefaultImage = 'data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAABQAAD/4QMpaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjAtYzA2MCA2MS4xMzQ3NzcsIDIwMTAvMDIvMTItMTc6MzI6MDAgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzUgV2luZG93cyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCMDVGRjc0MkJCRDcxMUUyQjAzNEREMDU1NDBBNkM3MyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCMDVGRjc0M0JCRDcxMUUyQjAzNEREMDU1NDBBNkM3MyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkIwNDY1NjA0QkJENzExRTJCMDM0REQwNTU0MEE2QzczIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkIwNDY1NjA1QkJENzExRTJCMDM0REQwNTU0MEE2QzczIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+/+4ADkFkb2JlAGTAAAAAAf/bAIQAAgICAgICAgICAgMCAgIDBAMCAgME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';
            this.el.innerHTML = '';
            this.render([ this.colorScheme === 'dark' ? darkDefaultImage : lightDefaultImage]);
            return this;
        },

        template: [
            '<% for (var i = 0, length = photos.length; i < length; i++) { %>',
                '<span class="image"><img src="<%= photos[i] %>"></span>',
            '<% } %>'
        ].join('')

    };

    return VehiclePhotos;

}());

EDM.namespace('nvc').VehiclePrice = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDMUNDSAPI.Vehicle,
        bind = EDM.util.Function.bind,
        template = EDM.template;

    function VehiclePrice() {
        Observable.call(this);
        //this.initialize.apply(this, arguments);
        this.initialize();
        this.bindEvents();
    }

    VehiclePrice.prototype = {

        initialize: function() {
            this.template = template(this.template);
        },

        bindEvents: function() {},

        render: function(root, totalPrice) {
            var price = totalPrice,
                expr = /(?=(?:\d{3})+(?:\.|$))/g,
                graphWidth,
                graphDash;

            this.el = root;
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

    };

    return VehiclePrice;

}());
EDM.namespace('nvc').ZipMiField = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDMUNDSAPI.Vehicle,
        bind = EDM.util.Function.bind,
        template = EDM.template;

    function ZipMiField(root, apikey) {
        Observable.call(this);
        this.el = root;
        //this.initialize.apply(this, arguments);
        this.initialize(apikey);
        this.bindEvents();
    }

    ZipMiField.prototype = {

        initialize: function(apiKey) {
            this.vehicleApi = new VehicleApi(apiKey);
            this.template = template(this.template);
        },

        bindEvents: function() {
            this.on('update-dealers', this.updateDealers, this);
        },

        render: function(apiKey) {
            var zipElement, withinElement, spanWithin, spanMi,
                me = this;

            this.el.innerHTML = this.template({});
            zipElement = getElementsByClassName('zip-code', '', this.el)[0];

            // render Zip field
            this.zipField = new EDM.ui.ZipField({ apiKey: apiKey });
            zipElement.appendChild(this.zipField.el);
            this.zipField.render();
            this.zipField.valid = true;

            // render radius field
            withinElement = getElementsByClassName('within', '', this.el)[0];
            spanMi = document.createElement('span');
            spanMi.innerHTML = 'mi';
            spanWithin = document.createElement('span');
            spanWithin.innerHTML = 'within';
            withinElement.appendChild(spanWithin);

            this.miField = new EDM.ui.TextField({
                attributes: {
                    type: 'text',
                    name: 'mi',
                    title: 'Radius',
                    maxLength: 3,
                    value: 100
                },
                className: 'within-field',
                validators: {
                    decimal: {
                        message: 'The %s field is invalid'
                    },
                    maxValue: {
                        message: '%s must be less than 100'
                    }
                }
            }),
            this.miField.valid = true;
            withinElement.appendChild(this.miField.el);
            withinElement.appendChild(spanMi);
            this.miField.renderTooltip();

            this.button = this.el.getElementsByTagName('button')[0];

            this.button.onclick = function(){
                me.trigger('update-dealers');
            };

            this.miField.on('valid', function(){
                me.miField.valid = true;
                me.validate();
            });
            this.miField.on('error', function(){
                me.miField.valid = false;
                me.validate();
            });
            this.zipField.on('valid', function(){
                me.zipField.valid = true;
                me.validate();
            });
            this.zipField.on('error', function(){
                me.zipField.valid = false;
                me.validate();
            });

            return this;
        },

        validate: function(){
            if (this.zipField.valid && this.miField.valid) {
                this.enableButton();
                return;
            }
            this.disabledButton();
        },

        updateDealers: function(){
        },

        enableButton: function(){
            this.button.disabled = false;
        },

        disabledButton: function(){
            this.button.disabled = true;
        },

        template: [
            '<span class="name"><b>1.</b> Select dealer near your location</span>',
            '<div class="zip-code"></div>',
            '<div class="within"></div>',
            '<button type="button" class="button-light">UPDATE</button>'
        ].join('')

    };

    return ZipMiField;

}());


EDM.namespace('ui').ZipUpdate = (function() {

    var
        View = EDM.ui.View,
        Button = EDM.ui.Button,
        ZipField = EDM.ui.ZipField,
        UpdateButton;

    return View.extend({

        className: 'zipcode-update',

        initialize: function(options) {
            options = options || {};
            this.zipCode = options.zip;
            // create elements
            this.zipField = new ZipField({
                apiKey: options.apiKey,
                zip: options.zip
            });
            this.button = new Button({
                className: 'button-light'
            });
            // add events
            this.zipField.on('valid', this.onZipValid, this);
            this.zipField.on('error', this.onZipError, this);
            this.zipField.on('blur', this.onZipBlur, this);
            this.button.on('click', this.onButtonClick, this);
        },

        render: function() {
            var el = this.el;
            el.appendChild(this.zipField.el);
            el.appendChild(this.button.el);
            this.zipField.render();
            this.button.setText('Update');
            return this;
        },

        showZipError: function() {
            this.zipField.tooltip.show();
            this.button.disable();
            return this;
        },

        hideZipError: function() {
            this.zipField.tooltip.hide();
            return this;
        },

        onButtonClick: function() {
            this.zipCode = this.newZipCode || this.zipCode;
            this.trigger('update', this.zipCode);
        },

        onZipBlur: function() {
            if (!this.newZipCode) {
                this.zipField.el.value = this.zipCode;
                this.hideZipError();
                this.button.enable();
            }
        },

        onZipValid: function(zipCode) {
            this.newZipCode = (zipCode === this.zipCode) ? null : zipCode;
            if (this.newZipCode) {
                this.button.enable();
            }
        },

        onZipError: function() {
            this.newZipCode = null;
            this.button.disable();
            this.trigger('error');
        },

        disable: function() {
            this.button.disable();
            this.zipField.disable();
        },

        enable: function() {
            this.button.enable();
            this.zipField.enable();
        }

    });

}());

/**
 *
 * @class VehicleOptions
 * @namespace EDM
 * @example
 *
 * @constructor
 * @extends EDM.Widget
 */
EDM.namespace('nvc').VehicleOptions = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDMUNDSAPI.Vehicle,
        bind = EDM.util.Function.bind,
        FunctionUtil = EDM.util.Function,
        Element = EDM.dom.Element,
        ArrayUtil = EDM.util.Array;

    function VehicleOptions(apiKey, baseId, styleId, zipCode) {
        Observable.call(this);

        this.styleId = styleId;
        this.selectedList = {};
        this.oldSelectedList = {};
        this.config_invalid = false;
        this.baseId = baseId;
        this.styleId = styleId;
        this.zipCode = zipCode;

        this.featuresMap = [];
        this.groupControlsList = [];

        this.excludedItems = [];
        this.includedItems = [];

        this.initialize.apply(this, arguments);
        this.bindEvents();
    }

    VehicleOptions.prototype = {

        initialize: function(apiKey) {
            this.vehicleApi = new VehicleApi(apiKey);
            this.el = document.getElementById(this.baseId + '_options');
        },

        bindEvents: function (){
            return this;
        },

        parseOptions: function (data, styleId){
            var i,
                price = data.pricingAttributeGroup,
                opt = data.featuresMap,
                colorType,
                colorChips,
                optionCategory,
                obj,
                colorName,
                optionName,

                options = {
                    colors: {
                    },
                    options: {
                    },
                    more: {
                        fees: []
                    }
                };

            for (i in opt) {
                if (opt.hasOwnProperty(i)) {
                    // Is this a color?
                    if (opt[i].attributeGroups.COLOR_TYPE) {


                        // TODO check for empty value
                        colorType   = opt[i].attributeGroups.COLOR_TYPE.attributes.COLOR_TYPE.value;
                        colorChips  = opt[i].attributeGroups.COLOR_CHIPS.attributes;
                        colorName   = opt[i].attributeGroups.COLOR_INFO.attributes.MANUFACTURER_OPTION_NAME.value;

                        options.colors[colorType.toLowerCase()] = options.colors[colorType.toLowerCase()] || [];
                        // secondaryColor: 'none'
                        if (colorChips.PRIMARY_R_CODE && colorChips.SECONDARY_R_CODE && colorChips.SECONDARY_G_CODE && colorChips.SECONDARY_B_CODE) {
                            obj = {
                                id: i,
                                name: colorName,
                                category: 'colors',
                                group: colorType.toLowerCase(),
                                type: 'radio',
                                price: opt[i].price || 0,
                                primaryColor: 'rgb(' + colorChips.PRIMARY_R_CODE.value +', '+ colorChips.PRIMARY_G_CODE.value +', '+ colorChips.PRIMARY_B_CODE.value + ')',
                                secondaryColor: 'rgb(' + colorChips.SECONDARY_R_CODE.value +', '+ colorChips.SECONDARY_G_CODE.value +', '+ colorChips.SECONDARY_B_CODE.value + ')',
                                status: 'available',
                                included: false
                            };
                            options.colors[colorType.toLowerCase()].push(obj);
                            this.featuresMap.push(obj);
                        } else if (colorChips.PRIMARY_R_CODE) {
                            obj = {
                                id: i,
                                name: colorName,
                                category: 'colors',
                                group: colorType.toLowerCase(),
                                type: 'radio',
                                price: opt[i].price || 0,
                                primaryColor: 'rgb(' + colorChips.PRIMARY_R_CODE.value +', '+ colorChips.PRIMARY_G_CODE.value +', '+ colorChips.PRIMARY_B_CODE.value + ')',
                                secondaryColor: 'none',
                                status: 'available',
                                included: false
                            };
                            options.colors[colorType.toLowerCase()].push(obj);
                            this.featuresMap.push(obj);
                        } else {
                            obj = {
                                id: i,
                                name: colorName,
                                category: 'colors',
                                group: colorType.toLowerCase(),
                                type: 'radio',
                                price: opt[i].price || 0,
                                primaryColor: 'none',
                                secondaryColor: 'none',
                                status: 'available',
                                included: false
                            };
                            options.colors[colorType.toLowerCase()].push(obj);
                            this.featuresMap.push(obj);
                        }
                    }
                    // Is this an option?
                    else if (opt[i].attributeGroups.OPTION_INFO && opt[i].attributeGroups.OPTION_INFO.attributes && opt[i].attributeGroups.OPTION_INFO.attributes.OPTION_CATEGORY) {
                        optionCategory = opt[i].attributeGroups.OPTION_INFO.attributes.OPTION_CATEGORY.value;
                        optionName = opt[i].attributeGroups.OPTION_INFO.attributes.MANUFACTURER_OPTION_NAME.value;
                        options.options[optionCategory] = options.options[optionCategory] || [];
                        obj = {
                            id: i,
                            name: optionName,
                            category: 'options',
                            group: optionCategory,
                            type: 'checkbox',
                            status: 'available',
                            included: false,
                            price: opt[i].price || 0
                        };
                        options.options[optionCategory].push(obj);
                        this.featuresMap.push(obj);
                    }
                }
            }
              // Are there any more fees we need to list?
            if (price && price.attributes && price.attributes.DELIVERY_CHARGE && (price.attributes.DELIVERY_CHARGE.value > 0)) {
                obj = {
                    name: "Destination Fee",
                    category: 'fees',
                    group: 'Fees',
                    type: 'checkbox',
                    price: price.attributes.DELIVERY_CHARGE.value
                };
                options.more.fees.push(obj);
                this.featuresMap.push(obj);
            }

            if (price && price.attributes && price.attributes.GAS_GUZZLER_TAX && (price.attributes.GAS_GUZZLER_TAX.value > 0) ) {
                obj = {
                    name: "Gas Guzzler Tax",
                    category: 'fees',
                    group: 'Fees',
                    type: 'checkbox',
                    price: price.attributes.GAS_GUZZLER_TAX.value
                };
                options.more.fees.push(obj);
                this.featuresMap.push(obj);
            }

            this.render(options);
            this.onLoadDependencies(data, 'preselect');

            return this;
        },

        reset: function() {
            var el = document.getElementById(this.baseId + '_options');
            if (el) {
                el.innerHTML = '';
            }
            this.featuresMap = [];
            this.excludedItems = [];
            this.includedItems = [];
            this.groupControlsList = [];
            this.selectedList = {};
            this.oldSelectedList = {};
            return this;
        },

        render: function (options){
            var baseId = this.baseId,
                rootOptions = document.getElementById(baseId + '_options'), k,
                rootGroup = document.createElement('div'),
                categoryElement = document.createElement('div');


            rootOptions.innerHTML = '';
            categoryElement.className = 'name';
            categoryElement.innerHTML = 'Options';
            rootGroup.className = 'option-group';
            rootGroup.id = baseId + '_option_group_options';

            function triggerChangeEvent() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift('change');
                this.trigger.apply(this, args);
            }
            if (options.colors) {
                for (k in options.colors) {
                    var radioGroup = new EDM.nvc.RadioGroup(rootOptions, baseId, k, options.colors[k], 'colors');
                    radioGroup.render();
                    radioGroup.init();
                    radioGroup.on('change', this.loadDependencies, this);
                    radioGroup.on('change', triggerChangeEvent, this);
                    this.groupControlsList.push(radioGroup);
                }
            }
            // If there are options

            // TODO isEmpty Object
            if (options.options) {
                rootOptions.appendChild(rootGroup);
                rootGroup.appendChild(categoryElement);
                for (k in options.options) {
                    var checkboxGroup = new EDM.nvc.CheckboxGroup(rootGroup, baseId, k, options.options[k], 'options');
                    checkboxGroup.render();
                    checkboxGroup.init();
                    checkboxGroup.on('change', this.loadDependencies, this);
                    checkboxGroup.on('change', triggerChangeEvent, this);
                    this.groupControlsList.push(checkboxGroup);
                }
            }
            // Any fees to process?
            if (options.more.fees.length > 0) {
                var feesGroup = new EDM.nvc.FeesGroup(rootOptions, baseId, 'Fees', options.more.fees, 'fees');
                feesGroup.render();
                feesGroup.init();
                feesGroup.on('change', this.loadDependencies, this);
                feesGroup.on('change', triggerChangeEvent, this);
                this.groupControlsList.push(feesGroup);
            }

            this.elements = rootOptions.getElementsByTagName('input');

            this.bindEvents();
            this.trigger('render');

            return this;
        },

        loadOptions: function(styleId) {
            var successCallback = FunctionUtil.bind(this.onLoadOptions, this),
                errorCallback = FunctionUtil.bind(this.onLoadOptionsError, this);
            this.styleId = styleId;
            this.el.innerHTML = '<div class="loading">Loading options...</div>';
            this.vehicleApi.getVehicleConfig(styleId, this.zipCode, successCallback, errorCallback);
        },

        onLoadOptionsError: function() {
            this.el.innerHTML = '<div class="loading"><p>Sorry, we have a minor breakdown.</p><p>The options have not been loaded.</p><p>Please, try again later or select different style.</p></div>';
            this.trigger('loaderror');
        },

        onLoadOptions: function (options){
            if (options.errorMessage) {
                this.el.innerHTML = '<div class="loading">' + "<p>Sorry, we don't have a default configuration for this style.</p>" + '</div>';
                this.trigger('load');
                return this;
            }
            this.parseOptions(options, this.styleId);
            this.trigger('load', options);
            return this;
        },

        removeFeature: function(key){
            if (this.selectedList.hasOwnProperty(key)) {
                delete this.selectedList[key];
            }
        },

        removeOldFeature: function(key){
            if (this.oldSelectedList.hasOwnProperty(key)) {
                delete this.oldSelectedList[key];
            }
        },

        addFeature: function (key) {
            var opt,
                feature = this.getFeatureById(key);

            if (this.selectedList.hasOwnProperty(key)) {
                delete this.selectedList[key];
            }
            if (feature.category === 'colors') {
                for(opt in this.selectedList) {
                    if (this.selectedList[opt][0].group === feature.group) {
                        delete this.selectedList[opt];
                    }
                }
            }

            this.selectedList[feature.id] = this.selectedList[feature.id] || [];
            this.selectedList[feature.id].push(feature);

            return this;
        },

        addOldFeature: function (key) {
            var opt,
                feature = this.getFeatureById(key);

            if (this.oldSelectedList.hasOwnProperty(key)) {
                delete this.oldSelectedList[key];
            }
            if (feature){
                if (feature.category === 'colors') {
                    for(opt in this.oldSelectedList) {
                        if (this.oldSelectedList[opt][0].group === feature.group) {
                            delete this.oldSelectedList[opt];
                        }
                    }
                }

                this.oldSelectedList[feature.id] = this.oldSelectedList[feature.id] || [];
                this.oldSelectedList[feature.id].push(feature);
            }

            return this;
        },

        showDisableMask: function(element){
            var mask = document.createElement('div');
            mask.className = 'mask';
            element.parentNode.parentNode.appendChild(mask);
            //element.disabled = true;
        },

        hideDisableMask: function(lastActionOption){
            var maskParent;
            maskParent = lastActionOption.parentNode.parentNode;
            maskParent.removeChild(getElementsByClassName('mask', '', maskParent)[0]);
        },

        loadDependencies: function(options){
            var url ='',
                prop = options.options[0] ? options.options[0] : options.options,
                featureId = prop.id,
                group = prop.group,
                category = prop.category,
                isChecked = options.element.checked,
                callback = FunctionUtil.bind(this.onLoadDependencies, this);

            this.showDisableMask(options.element);
            this.lastActionOption = options.element;
            this[isChecked ? 'addFeature' : 'removeFeature'](featureId);

            if (isChecked) {
                if(this.config_invalid){
                    if(category === 'color' && group == 'exterior'){
                        url = this.getDependenciesUrl(true)+ 'colorid='+featureId;
                    } else {
                        url = this.getDependenciesUrl(true)+ 'optionid='+featureId;
                    }
                } else {
                    url = this.getDependenciesUrl(true)+ 'selected='+featureId;
                }
            } else {
                if(this.config_invalid){
                    url = this.getDependenciesUrl(true);
                } else {
                    url = this.getDependenciesUrl(true)+'optionid='+featureId+'&deselected='+featureId;
                }
            }

            this.vehicleApi.getDependenciesList(url, callback);
        },

        getDependenciesUrl: function(featureExists) {
            var urlString = '',
                state  = featureExists || false,
                url = [],
                current = this.selectedList,
                colorSet = false,
                count = 0,
                element,
                item,
                i;

            url.push('zip='+this.zipCode+'&');
            url.push('styleid=' + this.styleId + '&');
            // moved colorSet out of the if/else condition
            if (current && state === true) {
                // var colorSet = false;
                for (i in current) {
                    item = current[i][0];
                    element = this.getFeatureElementById(item.id);

                    if (!element.disabled){
                        if ((item.group === 'exterior') && (item.category === 'colors')) {
                            if(this.config_invalid){
                                url.push('colorid=' + item.id);
                            } else {
                                url.push('optionid=' + item.id);
                            }
                            url.push('&');
                            colorSet = true;
                            count = count + 1;
                        }
                        // New for Interior Color
                        else {
                            if ((item.group === 'interior') && (item.category === 'colors')) {
                                url.push('optionid=' + item.id);
                                url.push('&');
                                count++;
                            }
                            else {
                                if ((item.group === 'interior_trim') && (item.category === 'colors')) {
                                    url.push('optionid=' + item.id);
                                    url.push('&');
                                    count++;
                                }
                                else
                                if ((item.group === 'roof') && (item.category === 'colors')) {
                                    url.push('optionid=' + item.id);
                                    url.push('&');
                                    count++;
                                }
                                else
                                if (item.category === 'options') {
                                    if(this.config_invalid){
                                        url.push('optionid=' + item.id);
                                        url.push('&');
                                        count++;
                                    }
                                    else {
                                        url.push('optionid=' + item.id);
                                        url.push('&');
                                        count++;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (count === 0 && state === true && this.config_invalid === false) {
                url.push('optionid=&');
            }

            urlString = url.join('');

            // Based on colorSet condition, check for pattern match for empty colorid to remove
            if(this.config_invalid === true){
                if ((colorSet) && (urlString.match(/&colorid=&/g))) {
                    urlString = urlString.replace(/&colorid=&/g, '&');
                }
            }

            return urlString;
        },

        getFeatureElementById: function(id){
            var elements = this.elements,
                length = elements.length,
                element, i;

            for (i = 0; i < length; i = i + 1) {
                if (elements[i].getAttribute('data-id') === id){
                    element = elements[i];
                }
            }
            return element;
        },

        getFeatureById: function(id){
            var list = this.featuresMap,
                length = list.length,
                item, i;

            for (i = 0; i < length; i = i + 1) {
                if (list[i].id === id){
                    item = list[i];
                }
            }
            return item;
        },

        getInstanceByCategoryGroup: function(category, group){
            var i,
                groupControl,
                groupControls = this.groupControlsList,
                length = groupControls.length;

            for(i = 0; i < length; i = i + 1) {
                if (groupControls[i].category === category && groupControls[i].group === group) {
                    groupControl = groupControls[i];
                }
            }
            return groupControl;
        },

        resetUnavailable: function(){
            var i, feature,
                features = this.excludedItems,
                length;

            if (features && features.length){
                length = features.length;
                for(i = 0; i < length; i = i + 1){
                    feature = this.getFeatureById(features[i]);
                    if(feature && feature.status === 'unavailable'){
                        this.handleIncludedExcludedFeatureUI(feature.id, 'unexcluded');    // setAvailable // enabled
                    }
                }
            }
        },

        resetIncluded: function(){
            var i, feature,
                features = this.includedItems,
                length;

            if (features && features.length){
                length = features.length;
                for(i = 0; i < length; i = i + 1){
                    feature = this.getFeatureById(features[i]);
                    if(feature && feature.included){
                        feature.available = true;
                        feature.nullprice = false;
                        feature.required = false;
                        this.removeFeature(feature.id);
                        this.addOldFeature(feature.id);
                        this.handleIncludedExcludedFeatureUI(feature.id, 'unincluded');    // setUnincluded    // unchecked enabled calculate
                    }
                }
            }
        },

        onLoadDependencies: function(response, preselect){
            if(response && !response.error) {
                this.resetUnavailable();
                this.resetIncluded();

                if (response.selectedOption){
                    this.handleSelected(response);
                }
                if (response.deselectedOption){
                    this.handleDeselected(response);
                }
                if (response.includedItems && response.includedItems.length){
                    this.handleIncluded(response);
                }
                if (response.requiredItems && response.requiredItems.length){
                    this.handleRequired(response);
                }
                if(response.furtherRemovals && response.furtherRemovals.length){
                    this.handleRemovals(response);
                }
                if(response.excludedItems && response.excludedItems.length) {
                    this.handleExcluded(response);
                }

                this.includedItems = response.includedItems;
                this.excludedItems = response.excludedItems;

                this.trigger('update-selected', this.selectedList);

            } else {
                //this.lastActionOption.disabled = false;
                if (this.lastActionOption){
                    this.lastActionOption.checked = !this.lastActionOption.checked;
                }
            }
            if (preselect !== 'preselect'){
                this.hideDisableMask(this.lastActionOption);
            }
        },

        // Handler handleExcluded: from server-side-configurator.js
        handleExcluded: function(response) {
            var excluded = response.excludedItems, i,
                length = excluded.length;

            for(i = 0; i < length; i = i + 1){
                if(this.getFeatureById(excluded[i]) !== null){
                    this.removeFeature(excluded[i]);
                    this.addOldFeature(excluded[i]);
                    this.handleIncludedExcludedFeatureUI(excluded[i], 'unincluded');     // setUnincluded    // unchecked enabled calculate
                    this.handleIncludedExcludedFeatureUI(excluded[i], 'excluded');  // setUnAvailable   // disabled
                }
            }
        },

        // Handler handleSelected: from server-side-configurator.js
        handleSelected: function(response) {
            var selected = response.selectedOption,
                feature;

            feature = this.getFeatureById(selected);
            if(feature!==null){
                this.addFeature(selected);
                this.removeOldFeature(selected);
                //this.handleIncludedExcludedFeatureUI(selected, 'included');  // setIncluded  // checked disabled calculate
                //this.handleIncludedExcludedFeatureUI(selected, 'unexcluded');    // setAvailable // enabled
                this.handleIncludedExcludedFeatureUI(selected, 'checked');    // setChecked // checked calculate
            }

        },

        // Handler handleRequired: from server-side-configurator.js
        handleRequired: function(response) {
            var required = response.requiredItems, i,
                feature,
                length = required.length;
            for(i = 0; i < length; i = i + 1){
                if(this.getFeatureById(required[i]) !== null){
                    feature = this.getFeatureById(required[i]);
                    feature.required = true;
                    this.addFeature(required[i]);
                    this.removeOldFeature(required[i]);
                    feature.included = false;
                    //this.handleIncludedExcludedFeatureUI(required[i], 'included');      // setIncluded  // checked disabled calculate
                    this.handleIncludedExcludedFeatureUI(required[i], 'checked');       // setChecked // checked calculate
                    this.handleIncludedExcludedFeatureUI(required[i], 'unexcluded');    // setAvailable // enabled
                }
            }
        },

        // Handler handleRemovals: from server-side-configurator.js
        handleRemovals: function(response) {
            var removals = response.furtherRemovals, i, feature,
                length = removals.length;
            for(i = 0; i < length; i = i + 1){
                feature = this.getFeatureById(removals[i]);
                if(this.getFeatureById(removals[i]) !== null){
                    feature.required = false;
                    this.removeFeature(removals[i]);
                    this.addOldFeature(removals[i]);
                    this.handleIncludedExcludedFeatureUI(removals[i], 'unincluded');     // setUnincluded    // unchecked enabled calculate
                }
            }
        },

        // Handler handleIncluded: from server-side-configurator.js
        handleIncluded: function(response) {
            var included = response.includedItems,
                length = included.length, i,
                feature;

            for(i = 0; i < length; i = i + 1){
                feature = this.getFeatureById(included[i]);
               if(feature!==null){
                    feature.available = false;
                    this.addFeature(included[i]);
                    this.removeOldFeature(included[i]);
                    this.handleIncludedExcludedFeatureUI(included[i], 'unincluded');     // setUnincluded    // unchecked enabled calculate
                    this.handleIncludedExcludedFeatureUI(included[i], 'included');  // setIncluded  // checked disabled calculate
                }
            }
        },

        // Handler handleDeselected: rewrite method
        handleDeselected: function(response) {
            var deselected = response.deselectedOption;

            if(this.getFeatureById(deselected) !== null){
                this.removeFeature(deselected);
                this.addOldFeature(deselected);
                this.handleIncludedExcludedFeatureUI(deselected, 'unincluded');    // setUnincluded    // unchecked enabled calculate
            }
        },

        handleIncludedExcludedFeatureUI: function(featureid, state) {
            var element = this.getFeatureElementById(featureid),
                feature = this.getFeatureById(featureid);
            if (element) {
                if(state) {
                    switch (state) {
                        case 'unincluded': this.setUnincluded(element, feature);break;
                        case 'checked': this.setChecked(element, feature); break;
                        case 'included': this.setIncluded(element, feature); break;
                        case 'excluded': this.setUnAvailable(element, feature); break;
                        case 'unexcluded': this.setAvailable(element, feature); break;
                    }
                }
            }
        },

        reCalculate: function(element, feature, eventName){
            var head = document.getElementById(this.baseId+'_' + feature.category + '_'+feature.group),
                footBtn =getElementsByClassName('foot', '', head.parentNode)[0].getElementsByTagName('button')[0],
                groupControl = this.getInstanceByCategoryGroup(feature.category, feature.group);

            groupControl.trigger(eventName, {
                element: element,
                options: feature,
                head: head,
                footBtn: footBtn
            });
        },

        setUnincluded: function(element, feature) {
            element.checked = false;
            if (feature.included && !element.disabled){
                this.reCalculate(element, feature, 'calculate');
            }
            feature.included = false;
            element.disabled = false;
        },

        setChecked: function(element, feature) {
            element.checked = true;
            if (!feature.included || feature.category === 'colors'){
                this.reCalculate(element, feature, 'calculate');
            }
            if (!feature.required) {
                if (feature.price === 0 || feature.price.baseMSRP === 0) {
                    feature.nullprice = true;
                }
            }
            feature.included = true;
        },

        setIncluded: function(element, feature) {
            element.checked = true;
            if (!feature.included || feature.category === 'colors'){
                this.reCalculate(element, feature, 'change-color');
            }
            if (feature.category === 'options'){
                element.disabled = true;
            }
            feature.included = true;
        },

        setAvailable: function(element, feature) {
            var parent = new Element(element.parentNode);
            element.disabled = false;
            parent.removeClass('disabled');
            feature.status = 'available';
        },

        setUnAvailable: function(element, feature) {
            var parent = new Element(element.parentNode);
            element.disabled = true;
            parent.addClass('disabled');
            feature.status = 'unavailable';
        }

    };

    return VehicleOptions;

}());
/**
 * 
 * @class OptionGroup
 * @namespace EDM
 * @example
 *              
 * @constructor
 * @extends EDM.Widget
 */
EDM.namespace('nvc').OptionGroup = (function() {


    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDMUNDSAPI.Vehicle,
        Element = EDM.dom.Element,
        bind = EDM.util.Function.bind;

    function OptionGroup() {
        Observable.call(this);
    }

    OptionGroup.prototype = {

        initialize: function() {},

        disableButton: function(button){
            button.disabled = true;
            return this;
        },

        enableButton: function(button){
            button.disabled = false;
            return this;
        },

        expand: function(groop){
            var optionsEl = getElementsByClassName('option', '', document), i,
                $groop = new Element(groop),
                $optionsEl;

            for (i = optionsEl.length - 1; i >= 0; i = i - 1) {
                if (optionsEl[i].className.indexOf('emptybg') === -1){
                    $optionsEl = new Element(optionsEl[i]),
                    $optionsEl.removeClass('active');
                }
            }
            $groop.addClass('active');
            return this;
        },

        collapse: function(groop){
            var $groop = new Element(groop);
            $groop.removeClass('active');
            return this;
        },

        collapsible: function(group) {
            var isShow = group.className.indexOf('active') > -1 ? true : false;
            this[isShow ? 'collapse' : 'expand'](group);
            return this;
        },

        bindOnChangeEvent: function(element, elementOptions, parentHead, footBtn) {
            var me = this;
            element[isIE ? 'onclick' : 'onchange'] = function(event) {
                me.trigger('change', { 
                    element: this, 
                    options: elementOptions,
                    head: parentHead, 
                    footBtn: footBtn 
                });
            };
            return this;
        },

        bindEvents: function() {
            //this.on('change', this.calculatePrice, this);
            this.on('calculate', this.calculatePrice, this);
            this.on('change-color', this.changeColor, this);
            return this;
        },

        calculatePrice: function(options){
            var opts = options.options[0] ? options.options[0] : options.options,
                type = opts.type,
                price = parseInt(options.element.value, 10),
                isChecked = options.element.checked,
                headElement = options.head,
                sum = getElementsByClassName('price', '', headElement)[0].innerHTML.replace(/\$/,''),
                priceElement = getElementsByClassName('price', '', headElement)[0],
                valueElement = getElementsByClassName('value', '', headElement)[0],
                picElement = getElementsByClassName('pic', '', headElement)[0],
                picSecondElement = getElementsByClassName('secondary', '', headElement)[0],
                groupList = headElement.parentNode.getElementsByTagName('input'),
                groupListLength = groupList.length, i;

            if (opts.category === 'colors') {
                this.makeDeselectedAll(groupList);
                if (isChecked){
                    priceElement.innerHTML = price < 0 ? '($' + price.toString().replace(/-/,'') + ')' : '$' + price;
                    valueElement.innerHTML = opts.name;
                    picElement.style.background = options.element.getAttribute('data-primarycolor');
                    picSecondElement.style.background = options.element.getAttribute('data-secondarycolor');
                    this.makeSelected(options.element);
                } else {
                    priceElement.innerHTML = '$0';
                    valueElement.innerHTML = 'Select a Color';
                    picElement.removeAttribute('style');
                    picElement.setAttribute('style', '');
                    picElement.className = 'pic default';
                    picSecondElement.removeAttribute('style');
                    picSecondElement.setAttribute('style', '');
                    this.makeDeselected(options.element);
                }
            } 
            if (opts.category === 'options') {
                sum = sum.indexOf('(') === -1 ? parseInt(sum, 10) : - parseInt(sum.replace(/\(|\)/g,''), 10);
                sum = isChecked ? sum + price : sum - price;
                priceElement.innerHTML = sum < 0 ? '($' + sum.toString().replace(/-/,'') + ')' : '$' + sum;
            }
            return this;
        },

        changeColor: function(options){
            var opts = options.options[0] ? options.options[0] : options.options,
                type = opts.type,
                isChecked = options.element.checked,
                headElement = options.head,

                priceElement = getElementsByClassName('price', '', headElement)[0],
                valueElement = getElementsByClassName('value', '', headElement)[0],
                picElement = getElementsByClassName('pic', '', headElement)[0],
                picSecondElement = getElementsByClassName('secondary', '', headElement)[0],

                groupList = headElement.parentNode.getElementsByTagName('input'),
                groupListLength = groupList.length, i;

            if (opts.category === 'colors') {
                this.makeDeselectedAll(groupList);
                if (isChecked){
                    priceElement.innerHTML = '$0';
                    valueElement.innerHTML = opts.name;
                    picElement.style.background = options.element.getAttribute('data-primarycolor');
                    picSecondElement.style.background = options.element.getAttribute('data-secondarycolor');
                    this.makeSelected(options.element);
                } else {
                    priceElement.innerHTML = '$0';
                    valueElement.innerHTML = 'Select a Color';
                    picElement.removeAttribute('style');
                    picElement.className = 'pic default';
                    picSecondElement.removeAttribute('style');
                    this.makeDeselected(options.element);
                }
            } 

            return this;
        },

        makeSelected: function(element){
            element.checked = true;
            element.parentNode.className = 'active';
        },

        makeDeselected: function(element){
            element.checked = false;
            element.parentNode.className = '';
        },

        makeDeselectedAll: function(listElement){
            var i, length = listElement.length;
            for (i = 0; i < length; i = i + 1) {
                listElement[i].checked = false;
                listElement[i].parentNode.className = '';
            }
        }
    };

    return OptionGroup;

}());
/**
 * 
 * @class RadioGroup
 * @namespace EDM
 * @example
 *              
 * @constructor
 * @extends EDM.Widget
 */
 EDM.namespace('nvc').RadioGroup = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDMUNDSAPI.Vehicle,
        bind = EDM.util.Function.bind,
        FunctionUtil = EDM.util.Function,
        ArrayUtil = EDM.util.Array,
        template = EDM.template,
        _groopEl,
        _headEl,
        _listEl,
        _footEl,
        _priceEl,
        _listElItems,
        _footBtn,
        _length,
        _price,
        _item;



    function RadioGroup(root, baseId, group, list, category) {
        Observable.call(this);

        this.baseId = baseId;
        this.root = root;
        this.group = group;
        this.list = list;
        this.category = category;

        this.template = template(this.template);
    }

    RadioGroup.prototype = {

        render: function (){
            var templateElement = document.createElement('div');

            // render from template
            templateElement.innerHTML = this.template({
                baseId: this.baseId,
                group: this.group
            });
            templateElement.className = 'option-group';
            this.root.appendChild(templateElement);

            // render elements list
            this.renderList();
            return this;
        },

        renderList: function(){
            var i,
            _length = this.list.length,
            list = this.list,
            priceHtml; 
            // cache elements
            _groopEl    = document.getElementById(this.baseId + '_colors_' + this.group);
            _headEl     = getElementsByClassName('head', '', _groopEl)[0];
            _priceEl    = getElementsByClassName('price', '', _groopEl)[0];
            _listEl     = getElementsByClassName('list', '', _groopEl)[0];
            _footEl     = getElementsByClassName('foot', '', _groopEl)[0];
            _footBtn    = _footEl.getElementsByTagName('button')[0];

            for (i = 0; i < _length; i = i + 1) {
                _price = list[i].price;
                if (list[i].price === 0) {
                    _price = 0;
                } else {
                    _price = list[i].price.baseMSRP;
                }
                priceHtml = _price < 0 ? '($' + _price.toString().replace(/-/,'') + ')' : '$' + _price;
                _item = document.createElement('label');
                _item.innerHTML = [
                    '<span class="price">' + priceHtml + '</span>',
                    '<span class="pic" style="background-color:' + list[i].primaryColor + '">',
                        '<span class="secondary" style="background-color: ' + list[i].secondaryColor + '"></span>',
                        '<i></i>',
                    '</span>',
                    '<input type="checkbox" data-primarycolor="' + list[i].primaryColor + '" data-secondarycolor="' + list[i].secondaryColor + '" data-id="' + list[i].id + '" id="for' + list[i].id + '" value="' + _price + '" name="group_colors_' + this.group + '">',
                    '<span class="value">' + list[i].name + '</span>'
                    ].join('');

                _listEl.appendChild(_item);
                _item.setAttribute('for', 'for' + list[i].id);
            }

            return this;
        },

        init: function(){
            var me = this, i,
                list = this.list,
                _length = list.length;

            _listElItems = _groopEl.getElementsByTagName('input');

            _headEl.onclick = function() {
                me.collapsible(this.parentNode);
            };
            _footBtn.onclick = function(parent) {
                return function() {
                    me.collapsible(parent);
                };
            }(_headEl.parentNode);

            for (i = 0; i < _length; i = i + 1) {
                this.bindOnChangeEvent(_listElItems[i], list[i], _headEl, _footBtn);
            }

            this.bindEvents();
            return this;
        },

        template: [
            '<div class="name"><%= group %></div>',
            '<div class="option colors-category" id="<%= baseId %>_colors_<%= group %>">',
                '<div class="head"><span class="price">$0</span><span class="pic default"><span class="secondary"></span></span><span class="value">Select a Color</span></div>',
                '<div class="option-wrap">',
                    '<div class="list"></div>',
                    '<div class="foot"><button type="button" class="button-small button-light">OK</button></div>',
                '</div>',
            '</div>'
        ].join('')

    };

    return RadioGroup;

}());

$.extend(EDM.nvc.RadioGroup.prototype, EDM.nvc.OptionGroup.prototype);

/**
 * 
 * @class CheckboxGroup
 * @namespace EDM
 * @example
 *              
 * @constructor
 * @extends EDM.Widget
 */
 EDM.namespace('nvc').CheckboxGroup = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDMUNDSAPI.Vehicle,
        bind = EDM.util.Function.bind,
        FunctionUtil = EDM.util.Function,
        ArrayUtil = EDM.util.Array,
        template = EDM.template,
        _groopEl,
        _headEl,
        _listEl,
        _footEl,
        _priceEl,
        _listElItems,
        _footBtn,
        _contentId,
        _length,
        _price,
        _item;



    function CheckboxGroup(root, baseId, group, list, category) {
        Observable.call(this);

        this.baseId = baseId;
        this.root = root;
        this.group = group;
        this.list = list;
        this.category = category;

        this.template = template(this.template);
    }

    CheckboxGroup.prototype = {

        render: function (){
            var content = document.createElement('div');
            _contentId = this.baseId + '_options_' + this.group;

            // render from template
            content.className = 'option';
            content.id = _contentId;
            content.innerHTML = this.template({
                baseId: this.baseId,
                group: this.group
            });
            this.root.appendChild(content);

            // render from template
            this.renderList();
            return this;
        },

        renderList: function(){
            var i,
                _length = this.list.length,
                list = this.list,
                priceHtml; 
            // cache elements
            _groopEl    = document.getElementById(_contentId);
            _headEl     = getElementsByClassName('head', '', _groopEl)[0];
            _priceEl    = getElementsByClassName('price', '', _groopEl)[0];
            _listEl     = getElementsByClassName('list', '', _groopEl)[0];
            _footEl     = getElementsByClassName('foot', '', _groopEl)[0];
            _footBtn    = _footEl.getElementsByTagName('button')[0];

            for (i = 0; i < _length; i = i + 1) {
                _price = list[i].price;
                if (list[i].price === 0) {
                    _price = 0;
                } else {
                    _price = list[i].price.baseMSRP;
                }
                priceHtml = _price < 0 ? '($' + _price.toString().replace(/-/,'') + ')' : '$' + _price;
                _item = document.createElement('label');
                _item.innerHTML = '<span class="price">' + priceHtml + '</span><input type="checkbox" data-id="' + list[i].id + '" id="for' + list[i].id + '" value="' + _price + '" name="group_options_' + this.group + '"><span class="value">' + list[i].name + '</span>';
                _listEl.appendChild(_item);
                _item.setAttribute('for', 'for' + list[i].id);
            }

            return this;
        },

        init: function(){
            var me = this, i,
                list = this.list,
                _length = this.list.length;

            _listElItems = _groopEl.getElementsByTagName('input');

            _headEl.onclick = function() {
                me.collapsible(this.parentNode);
            };
            _footBtn.onclick = function(parent) {
                return function() {
                    me.collapsible(parent);
                };
            }(_headEl.parentNode);

            for (i = 0; i < _length; i = i + 1) {
                this.bindOnChangeEvent(_listElItems[i], list[i], _headEl, _footBtn);
            }

            this.bindEvents();
            return this;
        },

        template: [
            '<div class="head"><span class="price">$0</span><span class="value"><%= group %></span></div>',
            '<div class="option-wrap">',
                '<div class="list"></div>',
                '<div class="foot"><button type="button" class="button-small button-light">OK</button></div>',
            '</div>'
        ].join('')

    };

    return CheckboxGroup;

}());

$.extend(EDM.nvc.CheckboxGroup.prototype, EDM.nvc.OptionGroup.prototype);

/**
 * 
 * @class FeesGroup
 * @namespace EDM
 * @example
 *              
 * @constructor
 * @extends EDM.Widget
 */
 EDM.namespace('nvc').FeesGroup = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDMUNDSAPI.Vehicle,
        bind = EDM.util.Function.bind,
        FunctionUtil = EDM.util.Function,
        ArrayUtil = EDM.util.Array,
        template = EDM.template,
        _groopEl,
        _headEl,
        _listEl,
        _footEl,
        _priceEl,
        _listElItems,
        _footBtn,
        _length,
        _price,
        _item;



    function FeesGroup(root, baseId, group, list, category) {
        Observable.call(this);

        this.baseId = baseId;
        this.root = root;
        this.group = group;
        this.list = list;
        this.category = category;

        this.template = template(this.template);
    }

    FeesGroup.prototype = {

        render: function (){
            var templateElement = document.createElement('div');

            // render from template
            templateElement.innerHTML = this.template({
                baseId: this.baseId,
                group: this.group
            });
            templateElement.className = 'option-group';
            this.root.appendChild(templateElement);

            // render elements list
            this.renderList();
            return this;
        },

        renderList: function(){
            var i,
                _length = this.list.length,
                list = this.list,
                priceHtml; 
            // cache elements
            _groopEl    = document.getElementById(this.baseId + '_fees');
            _headEl     = getElementsByClassName('head', '', _groopEl)[0];
            _priceEl    = getElementsByClassName('price', '', _groopEl)[0];
            _listEl     = getElementsByClassName('list', '', _groopEl)[0];
            _footEl     = getElementsByClassName('foot', '', _groopEl)[0];
            _footBtn    = _footEl.getElementsByTagName('button')[0];

            for (i = 0; i < _length; i = i + 1) {
                _price = list[i].price;
                priceHtml = _price < 0 ? '($' + _price.toString().replace(/-/,'') + ')' : '$' + _price;
                _item = document.createElement('label');
                _item.innerHTML = [
                    '<span class="price">' + priceHtml + '</span>',
                    '<input type="checkbox" disabled="disabled" checked value="' + _price + '" name="group_' + this.group + '">',
                    '<span>' + list[i].name + '</span>'
                    ].join('');

                _listEl.appendChild(_item);
            }

            return this;
        },

        init: function(){
            this.bindEvents();
            return this;
        },

        template: [
            '<div class="name"><%= group %></div>',
            '<div class="option emptybg" id="<%= baseId %>_fees">',
                '<div class="list"></div>',
                '<div class="foot"><button type="button" class="button-small" disabled="disabled">OK</button></div>',
            '</div>'
        ].join('')

    };

    return FeesGroup;

}());

$.extend(EDM.nvc.FeesGroup.prototype, EDM.nvc.OptionGroup.prototype);

EDM.namespace('nvc').ZipLocation = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDMUNDSAPI.Vehicle,
        bind = EDM.util.Function.bind,
        template = EDM.template;

    function ZipLocation(root, apiKey) {
        Observable.call(this);
        this.el = root;
        //this.initialize.apply(this, arguments);
        this.apiKey = apiKey;
        this.initialize(apiKey);
        this.bindEvents();
    }

    ZipLocation.prototype = {

        initialize: function(apiKey) {
            this.vehicleApi = new VehicleApi(apiKey);
            this.template = template(this.template);
        },

        bindEvents: function() {
            this.on('update-zip', this.loadlocation, this);
        },

        render: function(apiKey) {
            var zipElement,
                me = this;

            this.el.innerHTML = this.template({});
            zipElement = getElementsByClassName('zip-code', '', this.el)[0];

            // render Zip field
            this.zipField = new EDM.ui.ZipField({ apiKey: apiKey });
            zipElement.appendChild(this.zipField.el);
            this.zipField.render();
            this.zipField.valid = true;

            this.button = this.el.getElementsByTagName('button')[0];

            this.button.onclick = function(){
                me.trigger('update-zip');
            };

            this.zipField.on('valid', function(){
                me.zipField.valid = true;
                me.validate();
            });

            this.zipField.on('error', function(){
                me.zipField.valid = false;
                me.validate();
            });

            return this;
        },

        loadlocation: function() {
            var callback = bind(this.onLocationLoad, this),
                zip = this.zipField.el.value;
            this.vehicleApi.getUpdateLocation(zip, callback);
        },

        onLocationLoad: function(response) {
            var location = this.parseLocation(response);
            this.renderLocation(location);
            this.trigger('location-load');
        },

        parseLocation: function(response) {
            var location = {
                state: response.regionsHolder ? response.regionsHolder[0].name : null,
                stateCode:  response.regionsHolder ? response.regionsHolder[0].stateCode : null
            };
            return location;
        },

        renderLocation: function(location){
            this.locationElement = getElementsByClassName('state', '', this.el)[0];
            this.locationElement.innerHTML = location.state ? location.state + ', ' + location.stateCode : 'Please click UPDATE button one more time.';
        },

        validate: function(){
            if (this.zipField.valid) {
                this.enableButton();
                return;
            }
            this.disabledButton();
        },

        enableButton: function(){
            this.button.disabled = false;
        },

        disabledButton: function(){
            this.button.disabled = true;
        },

        template: [
            '<span class="name">Prices for Zip code</span>',
            '<div class="zip-code tab2-zip"></div>',
            '<button type="button" class="button-light">UPDATE</button>',
            '<span class="state">&nbsp;</span>'
        ].join('')

    };

    return ZipLocation;

}());


EDM.namespace('nvc').OptionsList = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDMUNDSAPI.Vehicle,
        bind = EDM.util.Function.bind,
        template = EDM.template;

    function OptionsList(root, apiKey) {
        Observable.call(this);
        this.el = root;
        root.innerHTML = '';
        //this.initialize.apply(this, arguments);
        this.totalPrice = {};
        this.initialize(apiKey);
        this.bindEvents();
    }

    OptionsList.prototype = {

        initialize: function(apiKey) {
            this.vehicleApi = new VehicleApi(apiKey);
            this.template = template(this.template);
        },

        bindEvents: function() {
            this.off();
        },

        render: function(list) {
            var delLinks, i, length, id,
                me = this;

            this.el.innerHTML = this.template({
                options: list.options,
                basePrice: list.basePrice,
                fees: list.fees,
                totalPrice: list.totalPrice
            });

            // remember total prices for render price template
            this.totalPrice = list.totalPrice;

            delLinks = getElementsByClassName('remove', '', this.el);
            length = delLinks.length;

            for (i = 0; i < length; i = i + 1) {
                id = delLinks[i].getAttribute('data-id');
                delLinks[i].onclick = bindClickEvent(id);
            }

            function bindClickEvent(idElement) {
                return function() {
                    me.trigger('del-option', { id: idElement, element: this });
                };
            }

            this.trigger('render');

            return this;
        },

        resize: function() {
            var childrens = this.el.children,
                header, body, footer, bodyWidth, value;
            if (childrens.length < 2) {
                return;
            }
            header = childrens[0];
            body = childrens[1].children[0];
            footer = childrens[2];
            bodyWidth = body.offsetWidth;
            // reset margins
            header.style.marginRight = 0;
            footer.style.marginRight = 0;
            // set new margins
            value = header.offsetWidth - bodyWidth;
            header.style.marginRight = (value < 0 ? 0 : value) + 'px';
            value = footer.offsetWidth - bodyWidth;
            footer.style.marginRight = (value < 0 ? 0 : value) + 'px';
        },

        loadList: function(zip, styleid, list) {
            var successCallback = bind(this.onListLoad, this),
                errorCallback = bind(this.onListLoadError, this),
                url = '', opt;

            this.list = list;
            this.zip = zip;
            this.styleid = styleid;

            for (opt in list) {
                url = url + '&optionid=' + opt;
            }
            url = url + '&';
            this.el.innerHTML = '<div class="loading">Loading options...</div>';
            this.vehicleApi.getOptionsList(url, zip, styleid, successCallback, errorCallback);
        },

        onListLoad: function(response) {
            var list = this.parseList(response);
            this.trigger('listLoad', list.totalPrice);
            this.render(list);
        },

        onListLoadError: function() {
            this.trigger('listloaderror');
            this.render([]);
        },

        parseList: function(response) {
            var i, opt,
                options = [],
                basePrice,
                totalPrice,
                fees,
                item,
                list = this.list,
                nationalBasePrice = response.tmv.nationalBasePrice,
                totalWithOptions = response.tmv.totalWithOptions,
                tmvPrices = response.tmv.optionTMVPrices;
            for (opt in tmvPrices) {
                item = list[opt][0] ? list[opt][0] : list[opt];
                options.push({
                    id: opt,
                    name: item.name,
                    required: item.required ? true : false,
                    nullprice: item.nullprice ? item.nullprice : false,
                    available: item.available === false ? false : true,
                    invioce: tmvPrices[opt].baseInvoice ? ( tmvPrices[opt].baseInvoice < 0 ? '($' + tmvPrices[opt].baseInvoice.toString().replace(/-/,'') + ')' : '$' + tmvPrices[opt].baseInvoice ) : 0,
                    tmv: tmvPrices[opt].tmv ? ( tmvPrices[opt].tmv < 0 ? '($' + tmvPrices[opt].tmv.toString().replace(/-/,'') + ')' : '$' + tmvPrices[opt].tmv ) : 0,
                    msrp: tmvPrices[opt].baseMSRP ? ( tmvPrices[opt].baseMSRP < 0 ? '($' + tmvPrices[opt].baseMSRP.toString().replace(/-/,'') + ')' : '$' + tmvPrices[opt].baseMSRP ) : 0
                });
            }

            basePrice = {
                invoice: nationalBasePrice.baseInvoice,
                tmv: nationalBasePrice.tmv,
                msrp: nationalBasePrice.baseMSRP
            };

            fees = {
                destinationCharge: response.tmv.destinationCharge || 0,
                gasGuzzlerTax: response.tmv.gasGuzzlerTax || 0,
                regionalAdFee: response.tmv.regionalAdFee || 0
            };

            totalPrice = {
                invoice: totalWithOptions.baseInvoice,
                tmv: totalWithOptions.tmv,
                msrp: totalWithOptions.baseMSRP
            };

            return {
                options: options,
                basePrice :basePrice,
                fees: fees,
                totalPrice: totalPrice
            };
        },

        reset: function() {
            this.el.innerHTML = '';
            return this;
        },

        template: [
            '<div class="list-header">',
                '<table>',
                    '<thead>',
                        '<tr><th class="desc">Description</th><th class="price">MSRP</th></tr>',
                        '<tr class="base-price"><td class="desc"><div>Base Price</div></td><td class="price">$<%= basePrice.msrp %></td></tr>',
                    '</thead>',
                '</table>',
            '</div>',
            '<div class="list-body scroll">',
                '<table>',
                    '<tbody>',
                        '<% for (var i = 0, length = options.length; i < length; i++) { %>',
                            '<tr class="option-item" data-id="<%= options[i].id %>">',
                                '<td class="desc"><div><% if (options[i].available) { %><a data-id="<%= options[i].id %>" class="remove"><div class="nvcwidget-tooltip"><div class="arrow-left"></div>Delete</div></a><% } %><%= options[i].name %></div></td>',
                                '<td class="price"><% if (options[i].msrp === 0 && !options[i].nullprice && !options[i].required) { %><span>included</spat><% } else { %><%= options[i].msrp %><% } %></td></tr>',
                        '<% } %>',
                        '<% if (fees.destinationCharge !== 0) { %>',
                            '<tr><td class="desc"><div>Destination Fee</div></td><td class="price">$<%= fees.destinationCharge %></td></tr>',
                        '<% } %>',
                        '<% if (fees.gasGuzzlerTax !== 0) { %>',
                            '<tr><td class="desc"><div>Gas Guzzler Tax</div></td><td class="price">$<%= fees.gasGuzzlerTax %></td></tr>',
                        '<% } %>',
                        '<% if (fees.regionalAdFee !== 0) { %>',
                            '<tr><td class="desc"><div>Advertising Fee</div></td><td class="price">$<%= fees.regionalAdFee %></td></tr>',
                        '<% } %>',
                    '</tbody>',
                '</table>',
            '</div>',
            '<div class="list-footer">',
                '<table>',
                    '<tfoot>',
                        '<tr class="total-price"><td class="desc"><div>Total Price</div></td><td class="price">$<%= totalPrice.msrp %></td></tr>',
                    '</tfoot>',
                '</table>',
            '</div>'
        ].join('')

    };

    return OptionsList;

}());
EDM.namespace('nvc').VehicleDealers = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDMUNDSAPI.Vehicle,
        bind = EDM.util.Function.bind,
        template = EDM.template;

    function VehicleDealers(apiKey) {
        Observable.call(this);
        //this.initialize.apply(this, arguments);
        this.dealersChoiced = {};
        this.initialize(apiKey);
        this.bindEvents();
    }

    VehicleDealers.prototype = {

        initialize: function(apiKey) {
            this.vehicleApi = new VehicleApi(apiKey);
            this.template = template(this.template);
        },

        bindEvents: function() {
            this.off();
            this.on('choice-dealer', this.updateDealerList, this);
        },

        render: function(dealers) {
            var dealersList,
                length, id, name, i,
                me = this;
            if (dealers.length) {
                if (dealers.length === 1) {
                    dealers[0].checked = true;
                    this.addDealer(dealers[0]);
                    this.trigger('dealer-selected', this.dealersChoiced);
                }
                this.el.innerHTML = this.template({ dealers: dealers });
                this.trigger('dealers-available', true);
            } else {
                this.el.innerHTML = '<div class="loading">There are no dealers in our network that are located within your location.</div>';
                this.trigger('dealers-available', false);
            }
            dealersList = this.el.getElementsByTagName('input');
            length = dealersList.length;

            for (i = 0; i < length; i = i + 1) {
                dealersList[i].onchange = bindChangeEvent();
            }

            function bindChangeEvent(idElement, nameElement) {
                return function() {
                    me.trigger('choice-dealer', this);
                };
            }

            this.trigger('render');

            return this;
        },

        updateDealerList: function(element){
            var id = element.value,
                name = element.title;

            this[element.checked ? 'addDealer' : 'removeDealer']({id: id, name: name});
            this.trigger('dealer-selected', this.dealersChoiced);
        },

        removeDealer: function(options){
            if (this.dealersChoiced.hasOwnProperty(options.id)) {
                delete this.dealersChoiced[options.id];
            }
        },

        addDealer: function (options) {
            var opt;

            if (this.dealersChoiced.hasOwnProperty(options.id)) {
                delete this.dealersChoiced[options.id];
            }

            this.dealersChoiced[options.id] = {
                id: options.id,
                name: options.name
            };
        },

        loadDealers: function(root, options) {
            var successCallback = bind(this.onDealersLoad, this),
                errorCallback = bind(this.onDealersLoadError, this),
                makeName = options.makeName,
                model = options.model,
                styleid = options.styleId,
                zipcode = options.zipcode,
                radius = options.radius,
                rows = options.rows,
                isPublic = options.isPublic,
                bookName = options.bookName,
                apikey = options.apikey,
                keywords = encodeKeywords(options.keywords || []).join(','),
                premierOnly = options.premierOnly;

            function encodeKeywords(keywords) {
                var result = [],
                    length = keywords.length,
                    i = 0,
                    keyword;
                for ( ; i < length; i++) {
                    keyword = encodeURIComponent(decodeURIComponent(keywords[i]));
                    result.push(keyword);
                }
                return result;
            }

            this.el = root;
            this.options = options;

            this.el.innerHTML = '<div class="loading">Loading dealers...</div>';
            this.dealersChoiced = {};
            this.vehicleApi.getDealersList(makeName, model, styleid, zipcode, radius, rows, isPublic, bookName, keywords, premierOnly, successCallback, errorCallback);
        },

        onDealersLoad: function(response) {
            if (response.error) {
                return this.onDealersLoadError();
            }
            var dealers = this.parseDealers(response);
            this.trigger('dealersLoad');
            this.render(dealers);
        },

        onDealersLoadError: function() {
            this.el.innerHTML = '<div class="loading"><p>The dealers have not been loaded.</p><p>Please press the "Update" button to reload dealers.</p></div>';
            return this;
        },

        parseDealers: function(response) {
            var dealers = [], i, item, length,
                rating, review, ratingFull,
                dealersList = response.dealerHolder;

            if (dealersList){
                length = dealersList.length;
                for (i = 0; i < length; i = i + 1) {
                    item = dealersList[i];
                    if (item.ratings.SALES_OVERALL_RATING){
                        rating = parseInt(item.ratings.SALES_OVERALL_RATING, 10);
                        ratingFull = parseFloat(item.ratings.SALES_OVERALL_RATING);
                        review = parseInt(item.ratings.SALES_RECOMMENDED_REVIEW_COUNT, 10) + parseInt(item.ratings.SALES_NOT_RECOMMENDED_REVIEW_COUNT, 10);
                    } else {
                        rating = 0;
                        ratingFull = 0;
                        review = 0;
                    }
                    var fractal = (ratingFull - rating).toPrecision(1);
                    if (fractal >= 0.7) {
                        rating ++;
                    } else if (fractal >= 0.3) {
                        rating += '_5';
                    }

                    dealers.push({
                        id:         item.id,
                        name:       item.name,
                        logicalName:item.logicalName,
                        state:      item.address.stateName.replace(/ /g, ''),
                        city:       item.address.city.replace(/ /g, ''),
                        address:    item.address.city + ', ' + item.address.stateCode + ' ' + item.address.zipcode,
                        phone:      item.contactinfo.phone.split(', ').slice(0,1).join(', '),
                        distance:   parseFloat(item.displayinfo.dealer_distance).toFixed(2),
                        rating:     rating,
                        ratingFull: ratingFull,
                        review:     review,
                        checked:    false
                    });
                }
            }
            return dealers;
        },

        reset: function() {
            this.el.innerHTML = '';
        },

        template: [
            '<div class="list">',
            '<% for (var i = 0, length = dealers.length; i < length; i++) { %>',
                '<div class="item">',
                    '<input type="checkbox" value="<%= dealers[i].id %>" title="<%= dealers[i].name %>" name="dealers"<% if (dealers[i].checked) { %> checked="checked"<% } %>>',
                    '<div class="info">',
                        '<span class="name"><%= dealers[i].name %></span>',
                        '<span class="map"><span><%= dealers[i].distance %> mi</span><%= dealers[i].address %> <a href="http://www.edmunds.com/dealerships/<%= dealers[i].state %>/<%= dealers[i].city %>/<%= dealers[i].logicalName %>/" target="_blank"></a></span>',
                        '<span class="phone"><%= dealers[i].phone %></span>',
                        '<span class="rating r<%= dealers[i].rating %>" title="<%= dealers[i].ratingFull %>"></span>',
                        '<span class="reviews">',
                            '(<a href="http://www.edmunds.com/dealerships/<%= dealers[i].state %>/<%= dealers[i].city %>/<%= dealers[i].logicalName %>/sales.1.html" target="_blank"><%= dealers[i].review %> consumer review<% if (dealers[i].review > 1) { %>s<% } %></a>)',
                        '</span>',
                    '</div>',
                '</div>',
            '<% } %>',
            '</div>'
        ].join('')

    };

    return VehicleDealers;

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
            this.el.innerHTML = '';
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
                            '<li><%= options.dealers[i]%></li>',
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
