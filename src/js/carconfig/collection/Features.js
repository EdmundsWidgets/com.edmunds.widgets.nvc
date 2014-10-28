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

