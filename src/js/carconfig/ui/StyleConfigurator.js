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
            items = this.parseStylesBySubmodel(request, this.submodel);
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
            var model = this.getModelObjectById(modelId);
            this.modelId = modelId;
            this.modelName = this.getModelNameById(modelId);
            this.submodel = model.submodel;
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

        getModelObjectById: function(id) {
            var records = this.parserdModels,
                length = records.length,
                i = 0;
            for ( ; i < length; i++) {
                if (records[i].id === id) {
                    return records[i];
                }
            }
            return;
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
                            name: record.name,
                            submodel: record.submodel
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
        },

        parseStylesBySubmodel: function(request, submodel) {
            var model = request.modelYearHolder[0] || {},
                subModels = model.subModels || [],
                styleIds;
            if (!submodel) {
                return _.filter(model.styles, function(style) {
                    return style.publicationState === 'NEW' || style.publicationState === 'NEW_USED';
                });
            }
            _.every(subModels, function(obj, i) {
                if (obj.identifier.toLowerCase().replace(/\s+/g, '-') === submodel && subModels[i]) {
                    styleIds = subModels[i].styleIds;
                    return false;
                }
                return true;
            });
            if (!styleIds) {
                return _.filter(model.styles, function(style) {
                    return style.publicationState === 'NEW' || style.publicationState === 'NEW_USED';
                });
            }
            return _.filter(model.styles, function(style) {
                return _.contains(styleIds, +style.id) && (style.publicationState === 'NEW' || style.publicationState === 'NEW_USED');
            });
        }

    };

    StyleConfigurator.MAKES_LOAD_ERROR_TEXT = '<p>The makes have not been loaded.</p><p>Please return and try again or <a href="Mailto:api@edmunds.com">contact</a> us directly.</p>';

    StyleConfigurator.MODELS_LOAD_ERROR_TEXT = '<p>The models have not been loaded.</p><p>Please return and try again or <a href="Mailto:api@edmunds.com">contact</a> us directly.</p>';

    StyleConfigurator.STYLES_LOAD_ERROR_TEXT = '<p>The styles have not been loaded.</p><p>Please return and try again or <a href="Mailto:api@edmunds.com">contact</a> us directly.</p>';

    return StyleConfigurator;

}());
