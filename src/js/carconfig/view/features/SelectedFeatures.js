EDM.namespace('view.features').SelectedFeatures = Backbone.View.extend({

    className: 'selected-features',

    headerTemplate: [
        '<div class="selected-features-header">',
            '<div class="headers-row">',
                '<div class="price-dropdown">',
                    '<div class="arrow"></div>',
                    '<ul>',
                        '<li data-price-type="msrp">MSRP</li>',
                        '<li data-price-type="tmv">TMV&reg;</li>',
                        '<li data-price-type="invoice">Invoice</li>',
                    '</ul>',
                '</div>',
                '<div class="feature-price feature-price-msrp">MSRP</div>',
                '<div class="feature-price feature-price-tmv">TMV&reg;</div>',
                '<div class="feature-price feature-price-invoice">Invoice</div>',
                '<div class="feature-name">Description</div>',
            '</div>',
            '<div class="base-price-row">',
                '<div class="feature-price feature-price-msrp">$0</div>',
                '<div class="feature-price feature-price-tmv">$0</div>',
                '<div class="feature-price feature-price-invoice">$0</div>',
                '<div class="feature-name">Base Price</div>',
            '</div>',
        '</div>'
    ].join(''),

    footerTemplate: [
        '<div class="selected-features-footer">',
            '<div class="total-price-row">',
                '<div class="feature-price feature-price-msrp">$0</div>',
                '<div class="feature-price feature-price-tmv">$0</div>',
                '<div class="feature-price feature-price-invoice">$0</div>',
                '<div class="feature-name">Total Price</div>',
            '</div>',
        '</div>'
    ].join(''),

    initialize: function(options) {
        this.basePrice = this.setBasePrice(options.basePrice);
        this.list = new EDM.view.features.SelectedList({
            collection: this.collection
        });
    },

    render: function() {
        var header = _.template(this.headerTemplate, { baseMSRP: this.baseMSRP }),
            footer = _.template(this.footerTemplate, { totalPrice: this.totalPrice });
        // header
        this.$el.append(header);
        this.initPriceDropdown();
        // list
        this.$el.append(this.list.el);
        // footer
        this.$el.append(footer);
        return this;
    },

    initPriceDropdown: function() {
        var me = this,
            dropdown = this.$('.price-dropdown'),
            list = dropdown.find('ul');
        function showPriceRowsByType(type) {
            var priceRows = me.$('.feature-price');
            priceRows.hide();
            priceRows.filter(function() {
                return $(this).hasClass('feature-price-' + type);
            }).show();
        }
        dropdown.on({
            mouseenter: function() {
                list.show();
            },
            mouseleave: function() {
                list.hide();
            }
        });
        list.find('li').on('click', function() {
            showPriceRowsByType($(this).data('priceType'));
            list.hide();
        });
        return this;
    },

    resize: function() {
        var parentHeight = this.$el.parent().height(),
            header = this.$('.selected-features-header'),
            footer = this.$('.selected-features-footer'),
            headerHeight = header.height(),
            footerHeight = footer.height(),
            listItem = this.$('.selected-features-list > :first'),
            listWidth, padding;
        if (this.$el.closest('.nvcwidget').hasClass('nvcwidget-wide') || this.$el.closest('.nvcwidget').hasClass('nvcwidget-x-wide')) {
            parentHeight = this.$el.closest('.w1').height();
        }
        this.list.$el.css('max-height', parentHeight - (headerHeight + footerHeight));
        if (listItem.length === 1) {
            listWidth = listItem.outerWidth();
            padding = Math.max(footer.outerWidth() - listWidth, 0);
            header.css('padding-right', padding);
            footer.css('padding-right', padding);
        }
        return this;
    },

    setBasePrice: function(basePrice) {
        var row = this.$('.selected-features-header .base-price-row');
        this.basePrice = basePrice || {
            tmv: 0,
            baseMSRP: 0,
            baseInvoice: 0
        };
        row.find('.feature-price-msrp').text(_.currency(this.basePrice.baseMSRP));
        row.find('.feature-price-tmv').text(_.currency(this.basePrice.tmv));
        row.find('.feature-price-invoice').text(_.currency(this.basePrice.baseInvoice));
        this.updateTotalPrice();
        return this;
    },

    updateTotalPrice: function() {
        var totalPrice = this.collection.getTotalPrice(),
            basePrice = this.basePrice,
            footer = this.$('.selected-features-footer');
        footer.find('.feature-price-msrp').text(_.currency(basePrice.baseMSRP + totalPrice.baseMSRP));
        footer.find('.feature-price-tmv').text(_.currency(basePrice.tmv + totalPrice.tmv));
        footer.find('.feature-price-invoice').text(_.currency(basePrice.baseInvoice + totalPrice.baseInvoice));
        return this;
    }

});
