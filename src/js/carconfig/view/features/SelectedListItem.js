EDM.namespace('view.features').SelectedListItem = EDM.view.features.ListItem.extend({

    events: {
        'click [data-action="remove"]': 'onRemoveClick'
    },

    template: [
        '<a href="#" class="icon-remove" data-action="remove">',
            '<div class="nvcwidget-tooltip"><div class="arrow-left"></div>Delete</div>',
        '</a>',
        '<span class="feature-price feature-price-msrp"><%= _.currency(data.feature.get("price").baseMSRP) %></span>',
        '<span class="feature-price feature-price-tmv"><%= _.currency(data.feature.get("price").tmv) %></span>',
        '<span class="feature-price feature-price-invoice"><%= _.currency(data.feature.get("price").baseInvoice) %></span>',
        '<span class="feature-name"><span class="notification-icon"></span><%= data.feature.get("name") %></span>'
    ].join(''),

    onRemoveClick: function(event) {
        event.preventDefault();
        this.trigger('select', this.model.get('id'), false, this);
    }

});
