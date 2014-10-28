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
