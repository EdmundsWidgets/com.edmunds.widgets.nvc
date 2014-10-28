EDM.namespace('nvc').VehicleDetails = (function() {

    var // dependencies
        View = EDM.ui.View,
        template = EDM.template;

    return View.extend({

        className: 'vehicle-description',

        render: function(details, showPrice) {
            this.el.innerHTML = template(this.template, { details: details, showPrice: showPrice, msrpTooltip: NVC.TOOLTIP_MSRP });
            this.trigger('render');
            return this;
        },

        reset: function() {
            this.el.innerHTML = '<span class="default-price">Base MSRP:&nbsp;---</span>';
            return this;
        },

        template: [
            '<div class="name"><%= details.name %></div>',
            '<div class="desc"><%= details.description %></div>',
            '<% if(showPrice) { %>',
            '<div class="price">',
                'Base MSRP:<sup>$</sup>',
                '<span class="value" onclick="">',
                    '<%= _.formatNumber(details.price) %>',
                    '<div class="nvcwidget-tooltip"><div class="arrow-left"></div><%= msrpTooltip %></div>',
                '</span>',
            '</div>',
            '<% } %>'
        ].join('')

    });

}());
