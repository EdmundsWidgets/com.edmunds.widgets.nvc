
define('underscore', function() {
    return window._;
});

define('backbone', function() {
    return window.Backbone;
});

define('api/Core',[
    'jquery',
    'underscore'
], function($, _) {

    var slice = [].slice;

    /**
     * @class
     * @param apiKey
     * @constructor
     */
    function Api(apiKey) {

        var
            /**
             * @property _apiKey
             * @type {String}
             * @private
             */
            _apiKey =   apiKey,

            /**
             * @property _baseUrl
             * @type {String}
             * @private
             */
            _baseUrl =  'http://api.edmunds.com';

        /**
         * @return {String}
         */
        this.getApiKey = function() {
            return _apiKey;
        };

        /**
         * @return {String}
         */
        this.getBaseUrl = function() {
            return _baseUrl;
        };

    }

    /**
     * @static
     * @method mixin
     * @chainable
     */
    Api.mixin = function mixin() {
        _.each(slice.call(arguments), function(obj) {
            if (_.isArray(obj)) {
                return mixin.apply(this, obj);
            }
            _.extend(this.prototype, _.pick(obj, _.functions(obj)));
        }, this);
        return this;
    };

    Api.mixin({

        /**
         * @method get
         * @param {String} method
         * @param {Object} data
         * @param {Object} options
         * @returns {jQuery.Deferred}
         */
        get: function(method, data, options) {
            var deferred = $.Deferred();
            data = _.defaults(data || {}, {
                'api_key':  this.getApiKey(),
                fmt:        'json'
            });
            options = _.defaults(options || {}, {
                cache:          false,
                timeout:        5000,
                traditional:    true
            });
            deferred.done(options.success).fail(options.error);
            $.ajax({
                url:        this.getBaseUrl() + method,
                data:       data,
                dataType:   'jsonp',
                timeout:    options.timeout,
                success:    function(response) {
                    // api v2 response
                    if (response.errorType) {
                        deferred.reject({ message: response.message });
                        return;
                    }
                    // mashery response
                    if (response.error) {
                        deferred.reject({ message: response.error.message });
                        return;
                    }
                    // api v1 response can contain errorMessage field
                    if (response.errorMessage) {
                        deferred.reject({ message: response.errorMessage });
                        return;
                    }
                    deferred.resolve(response);
                },
                error:      function() {
                    deferred.reject({ message: 'timeout' });
                }
            });
            return deferred.promise();
        }

    });

    return Api;

});

define('api/helper/PublicationState',[], {

    NEW:    'new',

    USED:   'used',

    FUTURE: 'future'

});

define('api/mixin/find-vehicle-makes',[
    'api/helper/PublicationState'
], function(PublicationState) {

    return {

        findVehicleMakes: function(publicationState) {
            return this.get('/api/vehicle/v2/makes', { state: publicationState });
        },

        findNewVehicleMakes: function() {
            return this.findVehicleMakes(PublicationState.NEW);
        },

        findUsedVehicleMakes: function() {
            return this.findVehicleMakes(PublicationState.USED);
        },

        findFutureVehicleMakes: function() {
            return this.findVehicleMakes(PublicationState.FUTURE);
        },

        findNewUsedVehicleMakes: function() {
            return this.findVehicleMakes([PublicationState.NEW, PublicationState.USED]);
        }

    };

});

define('api/mixin/find-vehicle-models',[
    'api/helper/PublicationState'
], function(PublicationState) {

    return {

        findVehicleModels: function(makeNiceName, publicationState) {
            var method = [
                '/api/vehicle/v2',
                makeNiceName,
                'models'
            ].join('/');
            return this.get(method, { state: publicationState });
        },

        findNewVehicleModels: function(makeNiceName) {
            return this.findVehicleModels(makeNiceName, PublicationState.NEW);
        },

        findUsedVehicleModels: function(makeNiceName) {
            return this.findVehicleModels(makeNiceName, PublicationState.USED);
        },

        findFutureVehicleModels: function(makeNiceName) {
            return this.findVehicleModels(makeNiceName, PublicationState.FUTURE);
        },

        findNewUsedVehicleModels: function(makeNiceName) {
            return this.findVehicleModels(makeNiceName, [PublicationState.NEW, PublicationState.USED]);
        }

    };

});

define('api/mixin/find-vehicle-years',[
    'api/helper/PublicationState'
], function(PublicationState) {

    return {

        findVehicleYears: function(makeNiceName, modelNiceName, subModelNiceName, publicationState) {
            var method = [
                '/api/vehicle/v2',
                makeNiceName,
                modelNiceName,
                'years'
            ].join('/');
            return this.get(method, {
                state:      publicationState,
                submodel:   subModelNiceName
            });
        },

        findNewVehicleYears: function(makeNiceName, modelNiceName, subModelNiceName) {
            return this.findVehicleYears(makeNiceName, modelNiceName, subModelNiceName, PublicationState.NEW);
        },

        findUsedVehicleYears: function(makeNiceName, modelNiceName, subModelNiceName) {
            return this.findVehicleYears(makeNiceName, modelNiceName, subModelNiceName, PublicationState.USED);
        },

        findFutureVehicleYears: function(makeNiceName, modelNiceName, subModelNiceName) {
            return this.findVehicleYears(makeNiceName, modelNiceName, subModelNiceName, PublicationState.FUTURE);
        },

        findNewUsedVehicleYears: function(makeNiceName, modelNiceName, subModelNiceName) {
            return this.findVehicleYears(makeNiceName, modelNiceName, subModelNiceName, [PublicationState.NEW, PublicationState.USED]);
        }

    };

});

define('api/mixin/find-vehicle-styles',[
    'api/helper/PublicationState'
], function(PublicationState) {

    return {

        findVehicleStyles: function(makeNiceName, modelNiceName, subModelNiceName, year, publicationState) {
            var method = [
                '/api/vehicle/v2',
                makeNiceName,
                modelNiceName,
                year,
                'styles'
            ].join('/');
            return this.get(method, {
                state:      publicationState,
                submodel:   subModelNiceName
            });
        },

        findNewVehicleStyles: function(makeNiceName, modelNiceName, subModelNiceName, year) {
            return this.findVehicleStyles(makeNiceName, modelNiceName, subModelNiceName, year, PublicationState.NEW);
        },

        findUsedVehicleStyles: function(makeNiceName, modelNiceName, subModelNiceName, year) {
            return this.findVehicleStyles(makeNiceName, modelNiceName, subModelNiceName, year, PublicationState.USED);
        },

        findFutureVehicleStyles: function(makeNiceName, modelNiceName, subModelNiceName, year) {
            return this.findVehicleStyles(makeNiceName, modelNiceName, subModelNiceName, year, PublicationState.FUTURE);
        },

        findNewUsedVehicleStyles: function(makeNiceName, modelNiceName, subModelNiceName, year) {
            return this.findVehicleStyles(makeNiceName, modelNiceName, subModelNiceName, year, [PublicationState.NEW, PublicationState.USED]);
        }

    };

});

define('api/Vehicle',[
    'api/Core',
    'api/mixin/find-vehicle-makes',
    'api/mixin/find-vehicle-models',
    'api/mixin/find-vehicle-years',
    'api/mixin/find-vehicle-styles'
], function(Api, findMakes, findModels, findYears, findStyles) {

    return Api.mixin([
        findMakes,
        findModels,
        findYears,
        findStyles
    ]);

});

define('view/vehicle/Select',[
    'underscore',
    'backbone',
    'api/Vehicle'
], function(_, Backbone, VehicleApi) {

    var viewOptions = [
        'defaultText',
        'loadingText',
        'selectText',
        'emptyText',
        'Collection'
    ];

    return Backbone.View.extend({

        tagName: 'select',

        className: 'form-select',

        /**
         * @property api
         */

        /**
         * @property defaultText
         * @type {String}
         */
        defaultText: 'List of Items',

        /**
         * @property emptyText
         * @type {String}
         */
        emptyText: 'Items not found',

        /**
         * @property selectText
         * @type {String}
         */
        selectText: 'Select an Item',

        /**
         * @property loadingText
         * @type {String}
         */
        loadingText: 'Loading Items...',

        /**
         * @property Collection
         * @type {Backbone.Collection}
         */
        Collection: Backbone.Collection,

        /**
         * @event change
         */

        /**
         * @event reset
         */

        events: {
            'change': 'onChange'
        },

        initialize: function(options) {
            _.extend(this, _.pick(options, viewOptions));
            this.api = new VehicleApi(options.apiKey);
            this.collection = new this.Collection();
            this.collection.on('reset', this.render, this);
        },

        render: function() {
            if (this.collection.length === 0) {
                this.empty(this.emptyText);
                return this;
            }
            this.empty(this.selectText);
            this.collection.each(this.add, this);
            this.enable();
            return this;
        },

        add: function(model) {
            this.$el.append('<option value="' + model.get('id') + '">' + model.get('name') + '</option>');
            return this;
        },

        reset: function() {
            this.empty(this.defaultText);
            this.collection.reset([], { silent: true });
            this.trigger('reset');
            return this;
        },

        disable: function() {
            this.el.setAttribute('disabled', 'disabled');
            return this;
        },

        enable: function() {
            this.el.removeAttribute('disabled');
            return this;
        },

        empty: function(text) {
            this.$el.html('<option value="-1">' + text + '</option>');
            this.disable();
            return this;
        },

        onChange: function() {
            var model = this.collection.get(this.$el.val());
            this.trigger('change', model);
        }

    });

});

define('model/vehicle/Make',[
    'backbone'
], function(Backbone) {

    return Backbone.Model.extend({

        defaults: {

        }

    });

});

define('collection/vehicle/Makes',[
    'backbone',
    'model/vehicle/Make'
], function(Backbone, Model) {

    return Backbone.Collection.extend({

        model: Model,

        comparator: function(model) {
            return model.get('name');
        }

    });

});

define('view/vehicle/Makes',[
    'underscore',
    'view/vehicle/Select',
    'collection/vehicle/Makes'
], function(_, SelectView, MakesCollection) {

    return SelectView.extend({

        Collection: MakesCollection,

        defaultText: 'List of Makes',

        emptyText: 'Makes not found',

        selectText: 'Select a Make',

        loadingText: 'Loading Makes...',

        /**
         * @event error
         */

        /**
         * @method find
         * @return {jQuery.Deferred}
         */
        find: function() {
            this.reset();
            this.empty(this.loadingText);
            return this.api.findNewVehicleMakes()
                .done(_.bind(this.onFindDone, this))
                .fail(_.bind(this.onFindFail, this));
        },

        filterMakes: function(makes, whiteList) {
            if (whiteList === 'all') {
                return makes;
            }
            if (_.isString(whiteList)) {
                whiteList = whiteList.split(',');
            }
            return _.filter(makes, function(make) {
                return _.contains(whiteList, make.niceName);
            });
        },

        /**
         * @method onFindDone
         * @param {Object} response
         */
        onFindDone: function(response) {
            var makes = this.filterMakes(response.makes, this.options.includedMakes);
            this.collection.reset(makes);
        },

        /**
         * @method onFindFail
         */
        onFindFail: function() {
            this.collection.reset();
            this.trigger('error', { message: 'Makes has not been loaded' });
        }

    });

});

define('model/vehicle/SubModel',[
    'backbone'
], function(Backbone) {

    return Backbone.Model.extend({

        defaults: {

        }

    });

});

define('collection/vehicle/SubModels',[
    'backbone',
    'model/vehicle/SubModel'
], function(Backbone, Model) {

    return Backbone.Collection.extend({

        model: Model,

        comparator: function(model) {
            return model.get('modelName');
        }

    });

});

define('view/vehicle/SubModels',[
    'backbone',
    'collection/vehicle/SubModels'
], function(Backbone, SubModelsCollection) {

    return Backbone.View.extend({

        /**
         * @override
         */
        tagName: 'optGroup',

        /**
         * @override
         */
        initialize: function(options) {
            this.el.setAttribute('label', options.modelName);
            this.collection = new SubModelsCollection();
            this.collection.on('reset', this.render, this);
        },

        /**
         * @override
         */
        render: function() {
            this.collection.each(this.add, this);
            return this;
        },

        /**
         * @method add
         * @param {Backbone.Model} subModel
         * @chainable
         */
        add: function(subModel) {
            var value = this.options.modelId + ':' + subModel.get('niceName');
            this.$el.append('<option value="' + value + '">' + subModel.get('modelName') + '</option>');
            return this;
        }

    });

});

define('model/vehicle/Model',[
    'underscore',
    'backbone'
], function(_, Backbone) {

    return Backbone.Model.extend({

        /**
         * @method getSubModels
         * @returns {Array}
         */
        getSubModels: function() {
            var subModels = {};
            _.each(this.attributes.years, function(year) {
                _.each(year.styles, function(style) {
                    var subModel = style.submodel;
                    if (!subModels[subModel.niceName]) {
                        subModels[subModel.niceName] = subModel;
                    }
                });
            });
            return _.values(subModels);
        }

    });

});

define('collection/vehicle/Models',[
    'backbone',
    'model/vehicle/Model'
], function(Backbone, Model) {

    return Backbone.Collection.extend({

        model: Model,

        comparator: function(model) {
            return model.get('name');
        }

    });

});

define('view/vehicle/Models',[
    'underscore',
    'view/vehicle/Select',
    'view/vehicle/SubModels',
    'collection/vehicle/Models'
], function(_, SelectView, SubModelsView, ModelsCollection) {

    return SelectView.extend({

        Collection: ModelsCollection,

        defaultText: 'List of Models',

        emptyText: 'Models not found',

        selectText: 'Select a Model',

        loadingText: 'Loading Models...',

        /**
         * @event error
         */

        /**
         * @overrride
         */
        add: function(model) {
            var subModels = new SubModelsView({
                modelId:    model.get('id'),
                modelName:  model.get('name')
            });
            this.$el.append(subModels.el);
            subModels.collection.reset(model.getSubModels());
            return this;
        },

        /**
         * @method find
         * @return {jQuery.Deferred}
         */
        find: function(makeNiceName) {
            this.reset();
            this.empty(this.loadingText);
            return this.api.findNewVehicleModels(makeNiceName)
                .done(_.bind(this.onFindDone, this))
                .fail(_.bind(this.onFindFail, this));
        },

        /**
         * @method onFindDone
         * @param {Object} response
         */
        onFindDone: function(response) {
            this.collection.reset(response.models);
        },

        /**
         * @method onFindFail
         */
        onFindFail: function() {
            this.collection.reset();
            this.trigger('error', { message: 'Models has not been loaded' });
        },

        /**
         * @override
         */
        onChange: function() {
            var value = this.$el.val().split(':'),
                modelId = value[0],
                subModelNiceName = value[1],
                model = this.collection.get(modelId);
            this.trigger('change', model, subModelNiceName);
        }

    });

});

define('model/vehicle/Year',[
    'backbone'
], function(Backbone) {

    return Backbone.Model.extend({

        defaults: {

        }

    });

});

define('collection/vehicle/Years',[
    'backbone',
    'model/vehicle/Year'
], function(Backbone, Model) {

    return Backbone.Collection.extend({

        model: Model,

        comparator: function(model) {
            return model.get('year');
        }

    });

});

define('view/vehicle/Years',[
    'underscore',
    'view/vehicle/Select',
    'collection/vehicle/Years'
], function(_, SelectView, YearsCollection) {

    return SelectView.extend({

        Collection: YearsCollection,

        defaultText: 'List of Years',

        emptyText: 'Years not found',

        selectText: 'Select a Year',

        loadingText: 'Loading Years...',

        /**
         * @event error
         */

        /**
         * @override
         */
        add: function(model) {
            this.$el.append('<option value="' + model.get('id') + '">' + model.get('year') + '</option>');
            return this;
        },

        /**
         * @method find
         * @return {jQuery.Deferred}
         */
        find: function(makeNiceName, modelNiceName, subModelNiceName) {
            this.reset();
            this.empty(this.loadingText);
            return this.api.findNewVehicleYears(makeNiceName, modelNiceName, subModelNiceName)
                .done(_.bind(this.onFindDone, this))
                .fail(_.bind(this.onFindFail, this));
        },

        /**
         * @method onFindDone
         * @param {Object} response
         */
        onFindDone: function(response) {
            this.collection.reset(response.years);
        },

        /**
         * @method onFindFail
         */
        onFindFail: function() {
            this.collection.reset();
            this.trigger('error', { message: 'Years has not been loaded' });
        }

    });

});

define('model/vehicle/Style',[
    'backbone'
], function(Backbone) {

    return Backbone.Model.extend({

        defaults: {

        }

    });

});

define('collection/vehicle/Styles',[
    'backbone',
    'model/vehicle/Style'
], function(Backbone, Model) {

    return Backbone.Collection.extend({

        model: Model,

        comparator: function(model) {
            return model.get('name');
        }

    });

});

define('view/vehicle/Styles',[
    'underscore',
    'view/vehicle/Select',
    'collection/vehicle/Styles'
], function(_, SelectView, StylesCollection) {

    return SelectView.extend({

        Collection: StylesCollection,

        defaultText: 'List of Styles',

        emptyText: 'Styles not found',

        selectText: 'Select a Style',

        loadingText: 'Loading Styles...',

        /**
         * @event error
         */

        /**
         * @method find
         * @return {jQuery.Deferred}
         */
        find: function(makeNiceName, modelNiceName, subModelNiceName, year) {
            this.reset();
            this.empty(this.loadingText);
            return this.api.findNewVehicleStyles(makeNiceName, modelNiceName, subModelNiceName, year)
                .done(_.bind(this.onFindDone, this))
                .fail(_.bind(this.onFindFail, this));
        },

        /**
         * @method onFindDone
         * @param {Object} response
         */
        onFindDone: function(response) {
            this.collection.reset(response.styles);
        },

        /**
         * @method onFindFail
         */
        onFindFail: function() {
            this.collection.reset();
            this.trigger('error', { message: 'Styles has not been loaded' });
        }

    });

});

define('view/vehicle/StyleConfigurator',[
    'underscore',
    'backbone',
    'view/vehicle/Makes',
    'view/vehicle/Models',
    'view/vehicle/Years',
    'view/vehicle/Styles'
], function(_, Backbone, MakesView, ModelsView, YearsView, StylesView) {

    return Backbone.View.extend({

        className: 'vehicle-style-configurator',

        /**
         * @property makes
         */

        /**
         * @property models
         */

        /**
         * @property years
         */

        /**
         * @property styles
         */

        /**
         * @property selection
         */

        /**
         * @event complete
         */

        /**
         * @event reset
         */

        /**
         * @event error
         */

        /**
         * @override
         */
        initialize: function() {
            this.selection = new Backbone.Model();
            this.initializeViews();
            this.initializeEvents();
        },

        /**
         * @method initializeViews
         */
        initializeViews: function() {
            var options = this.options,
                apiKey = options.apiKey;
            this.makes  = new MakesView({
                apiKey: apiKey,
                includedMakes: options.includedMakes
            });
            this.models = new ModelsView({
                apiKey: apiKey
            });
            this.years  = new YearsView({
                apiKey: apiKey
            });
            this.styles = new StylesView({
                apiKey: apiKey
            });
        },

        /**
         * @method initializeViews
         */
        initializeEvents: function() {
            this.makes  .on('change', this.onChangeMake, this);
            this.models .on('change', this.onChangeModel, this);
            this.years  .on('change', this.onChangeYear, this);
            this.styles .on('change', this.onChangeStyle, this);

            this.makes  .on('reset', this.unsetMake, this);
            this.models .on('reset', this.unsetModel, this);
            this.years  .on('reset', this.unsetYear, this);
            this.styles .on('reset', this.unsetStyle, this);

            this.makes  .on('error', this.error, this);
            this.models .on('error', this.error, this);
            this.years  .on('error', this.error, this);
            this.styles .on('error', this.error, this);
        },

        /**
         * @override
         */
        render: function() {
            var el = this.el;
            el.appendChild(this.makes.el);
            el.appendChild(this.models.el);
            el.appendChild(this.years.el);
            el.appendChild(this.styles.el);
            this.reset();
            return this;
        },

        /**
         * @method reset
         */
        reset: function() {
            this.makes.reset();
            return this;
        },

        findMakes: function() {
            return this.makes.find();
        },

        findModels: function(makeNiceName) {
            this.onBeforeModelsFind();
            return this.models.find(makeNiceName)
                .always(_.bind(this.onAfterModelsFind, this));
        },

        findYears: function(makeNiceName, modelNiceName, subModelNiceName) {
            this.onBeforeYearsFind();
            return this.years.find(makeNiceName, modelNiceName, subModelNiceName)
                .always(_.bind(this.onAfterYearsFind, this));
        },

        findStyles: function(makeNiceName, modelNiceName, subModelNiceName, year) {
            this.onBeforeStylesFind();
            return this.styles.find(makeNiceName, modelNiceName, subModelNiceName, year)
                .always(_.bind(this.onAfterStylesFind, this));
        },

        /**
         * @method onChangeMake
         * @param {Backbone.Model} make
         */
        onChangeMake: function(make) {
            if (!make) {
                this.unsetMake();
                return;
            }
            this.setMake(make);
            this.findModels(make.get('niceName'));
        },

        /**
         * @method onChangeModel
         * @param {Backbone.Model} model
         * @param {String} subModelNiceName
         */
        onChangeModel: function(model, subModelNiceName) {
            var selectedMake = this.selection.get('make');
            if (!model) {
                this.unsetModel();
                return;
            }
            this.setModel(model, subModelNiceName);
            this.findYears(selectedMake.get('niceName'), model.get('niceName'), subModelNiceName);
        },

        /**
         * @method onChangeYear
         * @param {Backbone.Model} year
         */
        onChangeYear: function(year) {
            var selectedMake = this.selection.get('make'),
                selectedModel = this.selection.get('model'),
                subModelNiceName = this.selection.get('subModelNiceName');
            if (!year) {
                this.unsetYear();
                return;
            }
            this.setYear(year);
            this.findStyles(selectedMake.get('niceName'), selectedModel.get('niceName'), subModelNiceName, year.get('year'));
        },

        /**
         * @method onChangeStyle
         * @param {Backbone.Model} style
         */
        onChangeStyle: function(style) {
            if (!style) {
                this.unsetStyle();
                return;
            }
            this.setStyle(style);
            this.complete();
        },

        /**
         * @method onBeforeModelsFind
         */
        onBeforeModelsFind: function() {
            this.makes.disable();
        },

        /**
         * @method onBeforeYearsFind
         */
        onBeforeYearsFind: function() {
            this.makes.disable();
            this.models.disable();
        },

        /**
         * @method onBeforeStylesFind
         */
        onBeforeStylesFind: function() {
            this.makes.disable();
            this.models.disable();
            this.years.disable();
        },

        /**
         * @method onAfterModelsFind
         */
        onAfterModelsFind: function() {
            this.makes.enable();
        },

        /**
         * @method onAfterYearsFind
         */
        onAfterYearsFind: function() {
            this.makes.enable();
            this.models.enable();
        },

        /**
         * @method onAfterStylesFind
         */
        onAfterStylesFind: function() {
            this.makes.enable();
            this.models.enable();
            this.years.enable();
        },

        /**
         * @method setMake
         * @chainable
         */
        setMake: function(make) {
            this.selection.set('make', make);
            return this;
        },

        /**
         * @method setModel
         * @chainable
         */
        setModel: function(model, subModelNiceName) {
            this.selection.set({
                model: model,
                subModelNiceName: subModelNiceName
            });
            return this;
        },

        /**
         * @method setYear
         * @chainable
         */
        setYear: function(year) {
            this.selection.set('year', year);
            return this;
        },

        /**
         * @method setYear
         * @chainable
         */
        setStyle: function(style) {
            this.selection.set('style', style);
            return this;
        },

        /**
         * @method unsetMake
         * @chainable
         */
        unsetMake: function() {
            this.selection.unset('make');
            this.models.reset();
            return this;
        },

        /**
         * @method unsetModel
         * @chainable
         */
        unsetModel: function() {
            this.selection.unset('model').unset('subModelNiceName');
            this.years.reset();
            return this;
        },

        /**
         * @method unsetYear
         * @chainable
         */
        unsetYear: function() {
            this.selection.unset('year');
            this.styles.reset();
            return this;
        },

        /**
         * @method unsetStyle
         * @chainable
         */
        unsetStyle: function() {
            this.selection.unset('style');
            this.trigger('reset');
            return this;
        },

        /**
         * @method complete
         * @chainable
         */
        complete: function() {
            this.trigger('complete', this.selection);
            return this;
        },

        /**
         * @method error
         * @chainable
         */
        error: function(error) {
            this.trigger('error', error);
            return this;
        }

    });

});
