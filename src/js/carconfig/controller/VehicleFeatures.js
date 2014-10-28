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
