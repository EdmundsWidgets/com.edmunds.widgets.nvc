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
