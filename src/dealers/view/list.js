define([
    'dealers/collection/dealers',
    'dealers/view/list-item'
], function(DealersCollection, ListItemView) {

    return Backbone.View.extend({

        className: 'edm-dealers-list',

        collection: new DealersCollection(),

        loadingText: 'Loading...',

        notFoundText: 'There are no dealers in our network that are located within your location.',

        initialize: function(options) {
            this.initializeCollection(options);
        },

        initializeCollection: function(options) {
            var collection = this.collection,
                searchCriteria = collection.searchCriteria;
            searchCriteria.set({
                api_key:    options.api_key,
                makeName:   options.makeName,
                model:      options.model,
                styleid:    options.styleid,
                zipcode:    options.zipcode,
                radius:     options.radius,
                keywords:   options.keywords
            });
            this.listenTo(searchCriteria, 'change', this.load);
            this.listenTo(collection, {
                'change:selected': this.onChangeSelection,
                'reset': this.render,
                'error': this.onLoadError
            });
        },

        render: function() {
            this.$el.empty();
            if (this.collection.length === 0) {
                this.$el.html(this.notFoundText);
                return this;
            }
            if (this.collection.length === 1) {
                this.collection.at(0).set('selected', true);
            }
            this.collection.each(this.add, this);
            return this;
        },

        add: function(model) {
            var item = new ListItemView({ model: model });
            this.$el.append(item.render().el);
            return this;
        },

        load: function() {
            this.$el.html(this.loadingText);
            return this.collection.load();
        },

        onChangeSelection: function() {
            this.trigger('change', this.collection.getSelectedIds());
        }

    });

});
