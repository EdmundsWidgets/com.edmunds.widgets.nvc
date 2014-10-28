EDM.namespace('view.features').ListItem = Backbone.View.extend({

    tagName: 'li',

    className: 'features-list-item',

    events: {
        'click [type="checkbox"]': 'onSelect'
    },

    template: [
        '<label for="feature-<%= data.cid %>-<%= data.feature.get("id") %>">',
            '<% if (data.feature.isColor()) { %>',
                '<div class="feature-color">',
                    '<% if (data.feature.has("secondaryColor")) { %>',
                        '<div class="feature-secondary-color" style="background-color: <%= _.rgb2hex(data.feature.get("secondaryColor")) %>"></div>',
                    '<% } %>',
                    '<% if (data.feature.has("primaryColor")) { %>',
                        '<div class="feature-primary-color" style="background-color: <%= _.rgb2hex(data.feature.get("primaryColor")) %>"></div>',
                    '<% } %>',
                    '<i></i>',
                '</div>',
            '<% } %>',
            '<input type="checkbox" id="feature-<%= data.cid %>-<%= data.feature.get("id") %>" value="<%= data.feature.get("id") %>">',
            '<span class="feature-price feature-price-msrp"><%= _.currency(data.feature.get("price").baseMSRP) %></span>',
            '<span class="feature-name"><span class="notification-icon"></span><%= data.feature.get("name") %></span>',
        '</label>'
    ].join(''),

    initialize: function() {
        this.model.on('change', this.render, this);
    },

    render: function() {
        var feature = this.model,
            checkbox, price;
        this.$el
            .html(_.template(this.template, {
                feature: feature,
                cid: this.cid
            }, { variable: 'data' }))
            .removeClass('available included excluded selected')
            .addClass(feature.get('status'))
            .addClass(feature.get('type'));
        // update checkbox state
        checkbox = this.$('[type="checkbox"]');
        if (feature.isSelected()) {
            checkbox.prop({
                checked: true,
                disabled: false
            });
        } else if (feature.isIncluded() || feature.isUnavailableSelected()) {
            checkbox.prop({
                checked: true,
                disabled: true
            });
        } else if (feature.isAvailable() || feature.isExcluded()) {
            checkbox.prop({
                checked: false,
                disabled: false
            });
        }
        function getTextPrice(value) {
            return _.isNull(value) ? 'N/A' : _.currency(value);
        }
        // update price
        if (feature.isIncluded()) {
            this.$('.feature-price').text('Included');
        } else {
            price = this.model.get('price');
            this.$('.feature-price-msrp').html(getTextPrice(price.baseMSRP));
            this.$('.feature-price-tmv').html(getTextPrice(price.tmv));
            this.$('.feature-price-invoice').html(getTextPrice(price.baseInvoice));
        }
        return this;
    },

    onSelect: function(event) {
        var el = event.target;
        event.preventDefault();
        this.trigger('select', el.value, el.checked, this);
    }

});
