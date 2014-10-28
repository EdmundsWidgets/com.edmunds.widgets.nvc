EDM.namespace('nvc').VehiclePrice = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDMUNDSAPI.Vehicle,
        bind = EDM.util.Function.bind,
        template = EDM.template;

    function VehiclePrice(options) {
        //this.initialize.apply(this, arguments);
        this.initialize(options);
        this.bindEvents();
    }

    _.extend(VehiclePrice.prototype, Backbone.Events, {

        initialize: function(options) {
            this.options = options;
            this.el = options.el;
            this.template = template(this.template);
            this.vehicleApi = new VehicleApi(options.vehicleApiKey);
        },

        bindEvents: function() {},

        render: function(totalPrice) {
            var price = totalPrice,
                expr = /(?=(?:\d{3})+(?:\.|$))/g,
                graphWidth,
                graphDash;

            this.totalPrice = totalPrice;

            if (price.tmv > price.invoice && price.tmv <= price.msrp) {
                graphWidth = (price.tmv - price.invoice)*100 / (price.msrp - price.invoice);
                graphDash = 0;
            } else if (price.tmv < price.invoice) {
                graphWidth = 0;
                graphDash = (price.invoice - price.tmv)*100 / (price.msrp - price.tmv);
            } else if (price.tmv > price.msrp) {
                graphWidth = 100;
                graphDash = 0;
            } else {
                graphWidth = 0;
                graphDash = 0;
            }

            this.graphDash = graphDash;

            price = {
                tmv: price.tmv ? price.tmv.toString().split(expr).join(',') : 'N/A',
                invoice: price.invoice ? price.invoice.toString().split(expr).join(',') : 'N/A',
                msrp: price.msrp ? price.msrp.toString().split(expr).join(',') : 'N/A',
                width: graphWidth,
                leftDash: graphDash,
                tmvTooltip: NVC.TOOLTIP_TMV,
                msrpTooltip: NVC.TOOLTIP_MSRP,
                invoiceTooltip: NVC.TOOLTIP_INVOICE
            };

            this.el.innerHTML = this.template({ totalPrice: price });
            this.updateGraph();

            this.trigger('render');

            return this;
        },

        // Update after render. When value of invoice near of the msrp.
        updateGraph: function(){
            try {
            var bottomEl = getElementsByClassName('bottom', '', this.el)[0],
                invoiceEl = isIE ? bottomEl.childNodes[1] : getElementsByClassName('left', '', bottomEl)[0],
                msrpEl = isIE ? bottomEl.childNodes[0] : getElementsByClassName('right', '', bottomEl)[0],
                invoiceElWidth = getElementsByClassName('value', '', invoiceEl)[0].offsetWidth,
                msrpElWidth = getElementsByClassName('value', '', msrpEl)[0].offsetWidth,
                bottomElWidth = bottomEl.offsetWidth,
                graphDash = this.graphDash,
                space = 10,  // 10 px for  space between invoice and msrp price value
                correctLength;

            if (graphDash > 0) {
                correctLength = (invoiceElWidth + msrpElWidth + space) * 100 / bottomElWidth;
                if (correctLength > (100 - graphDash) && !isIE) {
                    invoiceEl.style.marginLeft = (100 - correctLength) + '%';
                }
            }
            } catch(e) {}
        },

        loadPrice: function(styleId, zipCode, featureIds) {
            var successCallback = _.bind(this.onPriceLoadSuccess, this),
                errorCallback = _.bind(this.onPriceLoadError, this),
                url = 'optionid=' + featureIds.join('&optionid=') + '&';
            this.vehicleApi.getOptionsList(url, zipCode, styleId, successCallback, errorCallback);
            return this;
        },

        onPriceLoadSuccess: function(response) {
            if (response.error || response.hasOwnProperty('errorType')) {
                return this.onPriceLoadError();
            }
                var totalPrice = {
                    invoice:    response.tmv.totalWithOptions.baseInvoice,
                    tmv:        response.tmv.totalWithOptions.tmv,
                    msrp:       response.tmv.totalWithOptions.baseMSRP
                };
                this.trigger('load', totalPrice, response);
        },
        onPriceLoadError: function() {
            this.trigger('loaderror');
        },

        reset: function() {
            this.el.innerHTML = '';
        },
        template: [
            '<div>',
                '<div>',
                    '<div class="nvcwidget-price-graph">',
                        // TMV
                        '<div class="top" style="width: <%= totalPrice.width %>%;">',
                            '<div class="top-inner">',
                                '<span class="name">True Market Value&reg;</span>',
                                '<span class="value" onclick=""><sup>$</sup><%= totalPrice.tmv %><div class="nvcwidget-tooltip"><div class="arrow-left"></div><%= totalPrice.tmvTooltip %></div></span>',
                            '</div>',
                        '</div>',
                        // graph
                        '<div class="graph">',
                            '<div class="left" style="width: <%= totalPrice.width %>%;">',
                                '<div class="middle"></div>',
                            '</div>',
                            '<div class="dash" style="left: <%= totalPrice.leftDash %>%;"></div>',
                            '<div class="dash rights"></div>',
                            '<div class="right"></div>',
                        '</div>',
                        // labels
                        '<div class="bottom">',
                            '<div class="right">',
                                '<span class="name">MSRP</span>',
                                '<span class="value" onclick=""><sup>$</sup><%= totalPrice.msrp %><div class="nvcwidget-tooltip"><div class="arrow-left"></div><%= totalPrice.msrpTooltip %></div></span>',
                            '</div>',
                            '<div class="left" style="margin-left: <%= totalPrice.leftDash %>%;">',
                                '<span class="name">Invoice</span>',
                                '<span class="value" onclick=""><sup>$</sup><%= totalPrice.invoice %><div class="nvcwidget-tooltip"><div class="arrow-left"></div><%= totalPrice.invoiceTooltip %></div></span>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('')

    });

    return VehiclePrice;

}());
