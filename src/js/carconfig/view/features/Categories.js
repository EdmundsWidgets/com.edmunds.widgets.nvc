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
