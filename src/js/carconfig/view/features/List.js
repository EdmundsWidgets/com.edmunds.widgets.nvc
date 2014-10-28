EDM.namespace('view.features').List = Backbone.View.extend({

    tagName: 'ul',

    className: 'features-list',

    loadingText: 'Loading options...',

    emptyText: 'Sorry, we don\'t have configurable options for this vehicle.',

    initialize: function() {
        this.collection.on('reset', this.render, this);
        this.collection.on('request', this.onRequest, this);
    },

    render: function() {
        this.$el.empty();
        if (!this.collection.length) {
            this.$el.html(this.emptyText);
            return this;
        }
        this.setClassName();
        this.collection.each(this.add, this);
        return this;
    },

    add: function(model) {
        var item;
        if (_.isNull(model.get('price').baseMSRP)) {
            return this;
        }
        item = new EDM.view.features.ListItem({
            model: model
        });
        item.on('select', this.onSelect, this);
        this.$el.append(item.render().el);
        return this;
    },

    showLoadingOverlay: function() {
        if (!this.loadingOverlay) {
            this.loadingOverlay = $('<li class="overlay"></li>');
        }
        this.loadingOverlay.appendTo(this.$el);
    },

    hideLoadingOverlay: function() {
        if (this.loadingOverlay) {
            this.loadingOverlay.remove();
        }
    },

    onSelect: function(featureId, selected, view) {
        this.trigger('select', featureId, selected, view);
    },

    onRequest: function() {
        this.showLoadingOverlay();
    },

    setClassName: function() {
        var className = 'category-' + (this.collection.at(0).get('category') || '').toLowerCase().replace(/[\s_]+/g, '-');
        this.$el
            .removeClass()
            .addClass(this.className)
            .addClass(className);
        return this;
    }

});
