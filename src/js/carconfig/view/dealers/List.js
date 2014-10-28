EDM.namespace('view.dealers').List = Backbone.View.extend({

    className: 'list',

    events: {
        'click [data-action="select-all"]': 'onSelectAllClick',
        'click [type="checkbox"]': 'onChange'
    },

    initialize: function() {
        this.collection.on('reset', this.render, this);
        this.collection.on('request', this.onRequest, this);
    },

    render: function() {
        if (this.collection.length === 0) {
            return this.showMessage('There are no dealers in our network that are located within your location.');
        }
        if (this.collection.length === 1) {
            this.collection.at(0).set('selected', true);
            this.trigger('change', this.collection.at(0), true);
        }
        this.$el.empty();
        this.collection.each(this.add, this);
        return this;
    },

    add: function(model) {
        var item = new EDM.view.dealers.ListItem({
            model: model
        });
        this.el.appendChild(item.render().el);
        return this;
    },

    showMessage: function(text) {
        this.$el.html('<div class="loading">' + text + '</div>');
        return this;
    },

    onChange: function(event) {
        var el = event.target,
            dealer = this.collection.get(el.value);
        event.preventDefault();
        dealer.set('selected', el.checked);
        this.trigger('change', dealer, el.checked);
    },

    onRequest: function() {
        this.$el.html('<div class="loading">Loading dealers...</div>');
        return this.showMessage('Loading dealers...');
    }

});
