EDM.namespace('view.features').Notification = Backbone.View.extend({

    className: 'feature-notification',

    events: {
        'click [data-action="ok"]': 'onOkClick',
        'click [data-action="cancel"]': 'onCancelClick'
    },

    itemTemplate: [
        '<li>',
            '<span class="feature-price"><%= _.currency(feature.get("price").baseMSRP) %></span>',
            '<span class="feature-name"><%= feature.get("name") %></span>',
        '</li>'
    ].join(''),

    render: function() {
        var list, listItem;
        // required
        if (this.options.required.length) {
            this.$el.append('<p>Your selection requires the following:</p>');
            list = $('<ul/>').appendTo(this.el);
            _.each(this.options.required, function(feature) {
                listItem = _.template(this.itemTemplate, feature, { variable: 'feature' });
                list.append(listItem);
            }, this);
            this.$el.append('<p>which will be selected.</p>');
        }
        // excluded
        if (this.options.excluded.length) {
            if (!this.options.required.length) {
                this.$el.append('<p>Your selection excludes the following:</p>');
            } else {
                this.$el.append('<p>And excludes the following:</p>');
            }
            list = $('<ul/>').appendTo(this.el);
            _.each(this.options.excluded, function(feature) {
                listItem = _.template(this.itemTemplate, feature, { variable: 'feature' });
                list.append(listItem);
            }, this);
        }
        this.$el.append('<p>Continue with these changes?</p>');
        // buttons
        this.$el.append([
            '<div class="feature-notification-buttons">',
                '<button type="button" data-action="ok">Yes, continue</button>',
                '<button type="button" data-action="cancel">Do not change</button>',
            '</div>'
        ].join(''));
        return this;
    },

    onOkClick: function() {
        this.trigger('ok');
    },

    onCancelClick: function() {
        this.trigger('cancel');
    }

});
