EDM.namespace('view.features').CategoryList = Backbone.View.extend({

    className: 'features-category',

    events: {
        '[data-action="close"]': 'onCloseClick'
    },

    initialize: function() {
        this.head = new EDM.view.features.Category({
            categoryName: this.options.categoryName,
            collection: this.collection
        });
        this.list = new EDM.view.features.List({
            collection: this.collection
        });
        this.button = new EDM.view.form.Button({
            className: 'button-small button-light',
            text: 'Close'
        });
        this.button.on('click', this.close, this);
    },

    render: function() {
        this.$el.html(this.head.render().el);
        this.$el.append(this.list.el);
        this.$el.append('<div class="features-category-footer"></div>');
        this.$('.features-category-footer').append(this.button.render().el);
        return this;
    },

    close: function() {
        return this.trigger('close');
    }

});
