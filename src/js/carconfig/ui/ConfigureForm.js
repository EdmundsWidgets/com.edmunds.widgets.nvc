/** @deprecated */
NVC.ConfigureForm = (function() {

    var
        VehicleAPI = EDM.api.Vehicle,

        Element = EDM.dom.Element,
        Observable = EDM.mixin.Observable,

        FunctionUtil = EDM.util.Function,
        ArrayUtil = EDM.util.Array,

        Select = NVC.Select;

    function ConfigureForm(apiKey) {
        var el = document.createElement('div'),
            $el = new Element(el);
        $el.addClass('configure-form');
        Observable.call(this);
        this.el = el;
        this.$el = $el;
        this.initialize.apply(this, arguments);
        this.bindEvents();
    }

    ConfigureForm.prototype = {

        initialize: function(apiKey) {
            // define Vehicle API
            this.vehicleApi = new VehicleAPI(apiKey);
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
                className: 'nvcwidget-year',
                defaultText: 'List of Years',
                noItemsText: 'Years not found'
            });
            this.styleSelect = new Select({
                title: 'List of Styles',
                disabled: true,
                defaultText: 'List of Styles',
                noItemsText: 'Styles not found'
            });
        },

        bindEvents: function() {
            this.on('render', this.loadMakes, this);
            // change events
            this.makeSelect.on('change', this.onMakeChange, this);
            this.modelSelect.on('change', this.onModelChange, this);
            this.yearSelect.on('change', this.onYearChange, this);
            this.styleSelect.on('change', this.onStyleChange, this);
            // reset events
            this.makeSelect.on('reset', this.modelSelect.reset, this.modelSelect);
            this.modelSelect.on('reset', this.yearSelect.reset, this.yearSelect);
            this.yearSelect.on('reset', this.styleSelect.reset, this.styleSelect);
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
        },

        loadMakes: function() {
            var callback = FunctionUtil.bind(this.onMakesLoad, this);
            this.makeSelect.reset('Loading Makes...');
            this.vehicleApi.getListOfMakes(callback);
        },

        loadModelsAndYears: function(makeId) {
            var callback = FunctionUtil.bind(this.onModelsAndYearsLoad, this);
            this.modelSelect.reset('Loading Models...');
            this.vehicleApi.getListOfModelsByMake(makeId, callback);
        },

        loadStyles: function(makeId, modelId, yearId) {
            var callback = FunctionUtil.bind(this.onStylesLoad, this);
            this.vehicleApi.getVehicle(makeId, modelId, yearId, callback);
        },

        // Load callbacks

        onMakesLoad: function(request) {
            var items = this.parseMakes(request);
            this.makeSelect.render(items, 'Select a Make');
            this.trigger('load:makes', items, request);
            return this;
        },

        onModelsAndYearsLoad: function(request) {
            var items = this.parseModels(request);
            this.modelSelect.render(items, 'Select a Model');
            this.models = request.models;
            this.trigger('load:models', items, request);
            return this;
        },

        onStylesLoad: function(request) {
            var items = this.parseStyles(request);
            this.styleSelect.render(items, 'Select a Style');
            this.trigger('load:styles', items, request);
            return this;
        },

        // Change callbacks

        onMakeChange: function(makeId) {
            this.makeId = makeId;
            if (!makeId) {
                this.modelSelect.reset();
                return;
            }
            this.loadModelsAndYears(makeId);
            return this;
        },

        onModelChange: function(modelId) {
            this.modelId = modelId;
            if (!modelId) {
                this.yearSelect.reset();
                return;
            }
            var years = this.parseYears(this.models[modelId]);
            this.yearSelect.render(years, 'Select Year');
            return this;
        },

        onYearChange: function(yearId) {
            var modelId = this.modelId,
                model = modelId.substring(0, modelId.indexOf(':'));
            this.yearId = yearId;
            if (!yearId) {
                this.styleSelect.reset();
                return;
            }
            this.loadStyles(this.makeId, model, parseInt(this.yearId, 10));
            return this;
        },

        onStyleChange: function(styleId) {
            this.styleId = styleId;
            if (styleId) {
                this.trigger('complete', {
                    makeId: this.makeId,
                    modelId: this.modelId,
                    yearId: this.yearId,
                    styleId: this.styleId
                });
            }
        },

        // Parsers
        // TODO this.getOptions().includedMakes
        parseMakes: function(request) {
            var result = [],
                records = request.makes,
                includedMakes = 'all',
                makes = (typeof includedMakes === 'string') ? includedMakes.split(',') : [],
                includeAll = includedMakes === 'all',
                key, record;
            for (key in records) {
                record = records[key];
                if (includeAll || ArrayUtil.contains(makes, record.niceName)) {
                    result.push({
                        id: record.niceName,
                        name: record.name
                    });
                }
            }
            return result;
        },

        // TODO this.getOptions().showVehicles
        parseModels: function(request) {
            var records = request.models,
                showVehicles = '';//this.getOptions().showVehicles;
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
                years = ArrayUtil.isArray(years) ? years : [];
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
                result.push({
                    id: record.id,
                    name: record.name
                });
            }
            return result;
        }

    };

    return ConfigureForm;

}());
