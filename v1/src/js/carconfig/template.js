    /**
     * `template` HTML template - widget view
     * @property template
     * @static
     * @type {HTMLDivElement}
     */
    NVC.template = [
        '<div class="<%= baseClass %>-inner <%= nav %>">',
            '<div class="<%= baseClass %>-header noise-bg">',
                '<span class="title">NEW VEHICLE CONFIGURATOR</span><span class="question" onclick=""><sup>?</sup><div class="nvcwidget-tooltip"><div class="arrow-left"></div><%= titleTooltip %></div></span>',
            '</div>',
            '<div class="<%= baseClass %>-tabs" id="<%= baseId %>_tabs">',
                '<div class="tab1 active" id="<%= baseId %>-tab1">Configure</div>',
                '<div class="tab2 disable" id="<%= baseId %>-tab2">TMV&reg;</div>',
                '<div class="tab3 disable" id="<%= baseId %>-tab3">Price Quotes</div>',
            '</div>',
            '<div class="<%= baseClass %>-tab-content" id="<%= baseId %>_tab_content">',
                '<div class="<%= baseClass %>-tab-inner" id="<%= baseId %>_tab1">',
                    '<div class="noise-bg">',
                        '<div class="<%= baseClass %>-filters bottom-shadow">',
                            '<div class="filters" id="<%= baseId %>_filters"></div>',
                            '<div class="zip-code" id="<%= baseId %>_zip_configure"></div>',
                            '<div class="<%= baseClass %>-image" id="<%= baseId %>_vehicle_details"></div>',
                        '</div>',
                    '</div>',
                    '<div class="<%= baseClass %>-options-outer">',
                        '<form onclick=""><div class="<%= baseClass %>-options" id="<%= baseId %>_options"></div></form>',
                    '</div>',
                    '<div class="<%= baseClass %>-nav-bottom">',
                        '<button type="button" disabled="disabled" id="<%= baseId %>_button" class="button-block">Get Price</button>',
                    '</div>',
                '</div>',
                '<div class="<%= baseClass %>-tab-inner hide" id="<%= baseId %>_tab2">',
                    '<div class="<%= baseClass %>-inner-header">',
                        '<div class="<%= baseClass %>-image" id="<%= baseId %>_vehicle_details3"></div>',
                    '</div>',
                    '<div class="shadow-top noise-bg">',
                        '<div class="<%= baseClass %>-body">',
                            '<div class="<%= baseClass %>-inner-zip zip-location" id="<%= baseId %>_zip_location"></div>',
                            '<div class="<%= baseClass %>-list-options" id=<%= baseId %>_list_options></div>',
                            '<div class="<%= baseClass %>-price" id="<%= baseId %>_price"></div>',
                            /*
                            '<div class="<%= baseClass %>-body-bottom">',
                                '<div class="top"><span>Incentives</span><button type="button" class="button-light">INCLUDE IN TMV&reg;</button></div>',
                                '<div class="bottom"><a href="#">Customer Cash</a><span>$896</span></div>',
                            '</div>',
                            '<div class="<%= baseClass %>-body-foot"><a href="#" class="print">print</a><a href="#" class="email">e-mail</a></div>',
                            */
                        '</div>',
                    '</div>',
                    '<div class="<%= baseClass %>-top-footer"><button type="button" id="<%= baseId %>_button2">GET PRICE QUOTE</button><span>Next Step</span></div>',
                '</div>',
                '<div class="<%= baseClass %>-tab-inner hide" id="<%= baseId %>_tab3">',
                    '<div class="<%= baseClass %>-inner-header">',
                        '<div class="<%= baseClass %>-image" id="<%= baseId %>_vehicle_details2"></div>',
                        '<div class="tmvprice" id="<%= baseId %>_tmvprice"></div>',
                    '</div>',
                    '<div class="shadow-top noise-bg">',
                        '<div class="<%= baseClass %>-body">',
                            '<div class="<%= baseClass %>-inner-zip" id="<%= baseId %>_zip_mi"></div>',
                            '<div class="<%= baseClass %>-list-dealer"></div>',
                            '<div class="<%= baseClass %>-body-foot"><a href="#" class="print">print</a><a href="#" class="email">e-mail</a></div>',
                        '</div>',
                    '</div>',
                    '<div class="<%= baseClass %>-top-footer" id="<%= baseId %>_form">',
                    '</div>',
                    '<div class="<%= baseClass %>-nav-bottom">',
                        '<button type="button" disabled class="button-green" id="<%= baseId %>_button3">GET DEALER QUOTE</button>',
                    '</div>',
                '</div>',
            '</div>',
            '<div class="<%= baseClass %>-footer">',
                '<a href="http://developer.edmunds.com/tmv_widget_terms" class="copy" target="_blank">Legal Notice</a>',
                '<div class="logo">Built by<a href="http://www.edmunds.com/" target="_blank"></a></div>',
            '</div>',
        '</div>'
    ].join('');

    /**
     * @property TOOLTIP_TITLE
     * @static
     * @final
     * @type {String}
     */
    NVC.TOOLTIP_TITLE        = 'The New Vehicle Configurator is a tool that helps you customize a new vehicle, see what others in your area are paying for it on average, and get a FREE price quote from a dealership near you.';

    /**
     * @property TOOLTIP_TMV
     * @static
     * @final
     * @type {String}
     */
    NVC.TOOLTIP_TMV          = 'The Edmunds.com TMV® (Edmunds.com True Market Value®) price is the average price that others have paid for this car in the zip code provided.';

    /**
     * @property TOOLTIP_INVOICE
     * @static
     * @final
     * @type {String}
     */
    NVC.TOOLTIP_INVOICE      = 'This is the price the dealer paid for this car, including destination charges.';

    /**
     * @property TOOLTIP_MSRP
     * @static
     * @final
     * @type {String}
     */
    NVC.TOOLTIP_MSRP         = 'This is the price the manufacturer recommends selling the car for. Most consumers end up purchasing their car for less than MSRP.';

    /**
     * @property TOOLTIP_TRADEIN
     * @static
     * @final
     * @type {String}
     */
    NVC.TOOLTIP_TRADEIN      = 'This is the amount you can expect to receive when you trade in your used car and purchase a new car. The trade-in price is usually credited as a down payment on the new car.';

    /**
     * @property TOOLTIP_PRIVATEPARTY
     * @static
     * @final
     * @type {String}
     */
    NVC.TOOLTIP_PRIVATEPARTY = 'This is the amount at which the car is sold to or purchased by a private party, not a car dealer. This amount is usually more than the trade-in price but less than the dealer retail price.';

    /**
     * @property TOOLTIP_TMVRETAIL
     * @static
     * @final
     * @type {String}
     */
    NVC.TOOLTIP_TMVRETAIL    = 'This is the average price that others have paid for this car in the zip code provided. Dealer retail will usually be higher than private party prices and much higher than trade-in prices.';
