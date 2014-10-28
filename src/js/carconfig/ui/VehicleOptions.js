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

            var rootOptions = document.getElementById(this.baseId + '_options');
            rootOptions.className = rootOptions.className.replace(/\s*expanded\s*/, ' ');
            rootOptions.parentNode.parentNode.style.overflow = 'auto';

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

            function onExpand() {
                if (rootOptions.className.indexOf('expanded') === -1) {
                    rootOptions.className += ' expanded';
                }
                var root = rootOptions.parentNode.parentNode;
                root.style.overflow = 'hidden';
                this.listEl.style.height = root.offsetHeight - 20 - 30 - 20 + 'px';
            }

            function onCollapse() {
                if (rootOptions.className.indexOf('expanded') > -1) {
                    rootOptions.className = rootOptions.className.replace(/\s*expanded\s*/, ' ');
                }
                rootOptions.parentNode.parentNode.style.overflow = 'auto';
            }

            if (options.colors) {
                for (k in options.colors) {
                    var radioGroup = new EDM.nvc.RadioGroup(rootOptions, baseId, k, options.colors[k], 'colors');
                    radioGroup.render();
                    radioGroup.init();
                    radioGroup.on('change', this.loadDependencies, this);
                    radioGroup.on('change', triggerChangeEvent, this);

                    radioGroup.on('expand', onExpand, radioGroup);
                    radioGroup.on('collapse', onCollapse, radioGroup);

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

                    checkboxGroup.on('expand', onExpand, checkboxGroup);
                    checkboxGroup.on('collapse', onCollapse, checkboxGroup);

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
                this.el.innerHTML = '<div class="loading">' + "<p>Sorry, we don't have configurable options for this vehicle.</p>" + '</div>';
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
            element.parentNode.parentNode.parentNode.parentNode.appendChild(mask);
            this.maskEl = mask;
        },

        hideDisableMask: function() {
            if (this.maskEl && this.maskEl.parentNode) {
                this.maskEl.parentNode.removeChild(this.maskEl);
            }
        },

        loadDependencies: function(options){
            var url ='',
                prop = options.options[0] ? options.options[0] : options.options,
                featureId = prop.id,
                group = prop.group,
                category = prop.category,
                isChecked = options.element.checked,
                callback = FunctionUtil.bind(this.onLoadDependencies, this);

            this.hideDisableMask();
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

            this.removeNotification();

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

                var changedFeatureId = response.selectedOption || response.deselectedOption,
                    changedEl = this.getFeatureElementById(changedFeatureId),
                    feature = this.getFeatureById(),
                    okCallback = bind(function() {
                        this.processHandling(response);
                        this.removeNotification();
                    }, this),
                    cancelCallback = bind(function() {
                        this.lastActionOption.checked = !this.lastActionOption.checked;
                        this.removeNotification();
                    }, this);

                if ((response.requiredItems.length || response.furtherRemovals.length) && preselect !== 'preselect') {
                    this.addNotification(changedEl, response, okCallback, cancelCallback);
                } else {
                    this.processHandling(response);
                }

            } else {
                if (this.lastActionOption){
                    this.lastActionOption.checked = !this.lastActionOption.checked;
                }
            }
            if (preselect !== 'preselect'){
                this.hideDisableMask();
            }
        },

        addNotification: function(optionEl, response, okCallback, cancelCallback) {
            var currencyReg = /(?=(?:\d{3})+(?:\.|$))/g,
                el, innerHTML, i, featureId, feature, name, price;
            // required
            if (response.requiredItems.length) {
                innerHTML = '<p>Your selection requires the following:</p><ul>';
                for (i = 0; i < response.requiredItems.length; i++) {
                    featureId = response.requiredItems[i];
                    feature = this.getFeatureById(featureId);
                    name = response.name[featureId];
                    price = '$' + (feature.price.baseMSRP || 0).toString().split(currencyReg).join(',');
                    innerHTML += [
                        '<li>',
                            '<span class="feature-price">' + price + '</span>',
                            '<span class="feature-name">' + name + '</span>',
                        '</li>'
                    ].join('');
                }
                innerHTML += '</ul><p>which will be selected.</p>';
            }
            // removals
            if (response.furtherRemovals.length) {
                if (!response.requiredItems.length) {
                    innerHTML = '<p>Your selection excludes the following:</p><ul>';
                } else {
                    innerHTML += '<p>And excludes the following:</p><ul>';
                }
                for (i = 0; i < response.furtherRemovals.length; i++) {
                    featureId = response.furtherRemovals[i];
                    feature = this.getFeatureById(featureId);
                    name = response.name[featureId];
                    price = '$' + (feature.price.baseMSRP || 0).toString().split(currencyReg).join(',');
                    innerHTML += [
                        '<li>',
                            '<span class="feature-price">' + price + '</span>',
                            '<span class="feature-name">' + name + '</span>',
                        '</li>'
                    ].join('');
                }
                innerHTML += '</ul><p>which will be unchecked.</p>';
            }
            innerHTML += '<p>Continue with these changes?</p>';
            // buttons
            var buttons = document.createElement('div');
            var okButton = document.createElement('button');
            var cancelButton = document.createElement('button');
            buttons.className = 'feature-notification-buttons';
            okButton.innerHTML = 'Yes, continue';
            cancelButton.innerHTML = 'Do not change';
            okButton.setAttribute('type', 'button');
            cancelButton.setAttribute('type', 'button');
            buttons.appendChild(okButton);
            buttons.appendChild(cancelButton);
            okButton.onclick = function() {
                okCallback(response);
            };
            cancelButton.onclick = function() {
                cancelCallback(response);
            };
            //
            el = this.notificationEl = document.createElement('div');
            el.className = 'feature-notification';
            el.innerHTML = innerHTML;
            el.appendChild(buttons);
            optionEl.disabled = true;
            this.lastDisabledOption = optionEl;
            optionEl.parentNode.parentNode.insertBefore(el, optionEl.parentNode.nextSibling);
            if (!/active/.test(el.parentNode.className)) {
                el.parentNode.className += ' active';
            }
        },

        removeNotification: function() {
            if (this.notificationEl) {
                this.notificationEl.parentNode.className = this.notificationEl.parentNode.className.replace(/active/, ' ');
                this.notificationEl.parentNode.removeChild(this.notificationEl);
                this.notificationEl = null;
                this.lastDisabledOption.disabled = false;
            }
        },

        processHandling: function(response) {
            this.resetUnavailable();
            this.resetIncluded();
            // selected
            if (response.selectedOption){
                this.handleSelected(response.selectedOption);
            }
            // deselected
            if (response.deselectedOption){
                this.handleDeselected(response.deselectedOption);
            }
            // included
            if (response.includedItems.length){
                this.handleIncluded(response);
            }
            // required
            if (response.requiredItems.length){
                this.handleRequired(response);
            }
            // further removals
            if(response.furtherRemovals.length){
                this.handleRemovals(response);
            }
            // excluded
            if(response.excludedItems && response.excludedItems.length) {
                this.handleExcluded(response);
            }
            this.includedItems = response.includedItems;
            this.excludedItems = response.excludedItems;

            this.trigger('update-selected', this.selectedList, response);
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
        handleSelected: function(featureId) {
            if(this.getFeatureById(featureId) !== null){
                this.addFeature(featureId);
                this.removeOldFeature(featureId);
                this.handleIncludedExcludedFeatureUI(featureId, 'checked');    // setChecked // checked calculate
            }
        },

        // Handler handleDeselected: rewrite method
        handleDeselected: function(featureId) {
            if(this.getFeatureById(featureId) !== null){
                this.removeFeature(featureId);
                this.addOldFeature(featureId);
                this.handleIncludedExcludedFeatureUI(featureId, 'unincluded');    // setUnincluded    // unchecked enabled calculate
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
            new Element(element.parentNode.parentNode).removeClass('included selected disabled');
            if (feature.included && !element.disabled){
                this.reCalculate(element, feature, 'calculate');
            }
            feature.included = false;
            element.disabled = false;
        },

        setChecked: function(element, feature) {
            element.checked = true;
            new Element(element.parentNode.parentNode).addClass('selected');
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
            new Element(element.parentNode.parentNode).addClass('included selected');
            if (!feature.included || feature.category === 'colors'){
                this.reCalculate(element, feature, 'change-color');
            }
            if (feature.category === 'options'){
                element.disabled = true;
            }
            feature.included = true;
        },

        setAvailable: function(element, feature) {
            new Element(element.parentNode.parentNode).removeClass('disabled');
            element.disabled = false;
            feature.status = 'available';
        },

        setUnAvailable: function(element, feature) {
            new Element(element.parentNode.parentNode).addClass('disabled');
            feature.status = 'unavailable';
        }

    };

    return VehicleOptions;

}());