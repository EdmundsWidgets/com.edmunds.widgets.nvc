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
            '<span class="name"><%= details.name %></span>',
            '<span class="desc"><%= details.description %></span>',
            '<% if(showPrice) { %>',
            '<span class="price">Base MSRP:<sup>$</sup>',
                '<span class="value" onclick="">',
                    '<%= details.price %>',
                    '<div class="nvcwidget-tooltip"><div class="arrow-left"></div><%= msrpTooltip %></div>',
                '</span>',
            '</span>',
            '<% } %>'
        ].join('')

    });

}());
