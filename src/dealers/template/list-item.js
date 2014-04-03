define(function() {

    return _.template([

        '<input type="checkbox" <% if (selected) { print(" checked"); } %>>',
        '<div class="edm-dealer-details">',
            '<div class="edm-dealer-name"><%= name %></div>',
            '<div class="edm-dealer-address">',
                '<%= address %>',
                '<a href="<%= baseUrl %>"></a>',
            '</div>',
            '<div class="edm-dealer-phone"><%= phone %></div>',
            '<div class="edm-dealer-distance"><%= distance %></div>',
        '</div>'

    ].join(''));

});
