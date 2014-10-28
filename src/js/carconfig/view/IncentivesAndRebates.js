EDM.namespace('view').IncentivesAndRebates = Backbone.View.extend({

    className: 'incentives',

    events: {
        'click .switcher': 'toggleState'
    },

    template: [
        '<div class="incentive-toggle">',
            '<div class="switcher-wrapper">',
                '<span class="">Include in TMV<sup>&reg;</sup></span>',
                '<div class="switcher"></div>',
            '</div>',
            '<div class="incentive-label"><i class="icon-incentive"></i>Incentives</div>',
        '</div>',
        '<div class="incentive-info">',
            '<span class="incentive-price"><%= _.currency(incentive) %></span>',
            '<span class="incentive-subprogram">Customer Cash<div class="nvcwidget-tooltip"><div class="arrow-left"></div><%= description %></div></span>',
        '</div>'
    ].join(''),

    render: function() {
        this.$el.html(_.template(this.template, {
            incentive: this.options.incentive,
            description: NVC.TOOLTIP_CUSTOMERCASH
        }));
        this.switcher = this.$('.switcher');
        if (this.options.turnedOn) {
            this.switcher.removeClass('off').addClass('on');
        } else {
            this.switcher.removeClass('on').addClass('off');
        }
        return this;
    },

    toggleState: function() {
        this.switcher.toggleClass('on off');
        this.trigger('change', this.switcher.hasClass('on'));
        return this;
    }

});
