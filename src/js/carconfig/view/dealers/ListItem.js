EDM.namespace('view.dealers').ListItem = Backbone.View.extend({

    className: 'item',

    template: [
        '<div class="item-inner"><div class="item-inner-bg">',
            '<input type="checkbox" value="<%= dealer.get("id") %>" <% if (dealer.isSelected()) { %> checked="checked"<% } %>>',
            '<div class="info">',
                '<span class="name"><%= dealer.get("name") %></span>',
                '<span class="map"><span><%= dealer.getDistance() %> mi</span><%= dealer.getAddress() %> <a href="<%= dealer.getUrl() %>" target="_blank"></a></span>',
                '<span class="phone"><%= dealer.getPhone() %></span>',
                '<span class="rating r<%= dealer.getRatingClassName() %>" title="<%= dealer.getFullRating() %>"></span>',
                '<span class="reviews">',
                    '(<a href="<%= dealer.getSalesReviewsUrl() %>" target="_blank"><%= dealer.getReviewsCount() %> consumer review<% if (dealer.getReviewsCount() > 1) { print("s"); } %></a>)',
                '</span>',
            '</div>',
        '</div></div>'
    ].join(''),

    initialize: function() {
        this.model.on('change', this.render, this);
    },

    render: function() {
        this.el.innerHTML = _.template(this.template, { dealer: this.model });
        if (this.model.isPremier()) {
            this.$el.addClass('premier-dealer');
        }
        return this;
    }

});
