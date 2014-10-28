EDM.namespace('nvc').OptionsList = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDMUNDSAPI.Vehicle,
        bind = EDM.util.Function.bind,
        template = EDM.template;

    function OptionsList(root, apiKey) {
        Observable.call(this);
        this.el = root;
        root.innerHTML = '';
        //this.initialize.apply(this, arguments);
        this.totalPrice = {};
        this.initialize(apiKey);
        this.bindEvents();
    }

    OptionsList.prototype = {

        initialize: function(apiKey) {
            this.vehicleApi = new VehicleApi(apiKey);
            this.template = template(this.template);
        },

        bindEvents: function() {
            this.off();
        },

        render: function(list) {
            var delLinks, i, length, id,
                me = this;

            this.el.innerHTML = this.template({
                options: list.options,
                basePrice: list.basePrice,
                fees: list.fees,
                totalPrice: list.totalPrice
            });

            // remember total prices for render price template
            this.totalPrice = list.totalPrice;

            delLinks = getElementsByClassName('remove', '', this.el);
            length = delLinks.length;

            for (i = 0; i < length; i = i + 1) {
                id = delLinks[i].getAttribute('data-id');
                delLinks[i].onclick = bindClickEvent(id);
            }

            function bindClickEvent(idElement) {
                return function() {
                    me.trigger('del-option', { id: idElement, element: this });
                };
            }

            this.trigger('render');

            return this;
        },

        resize: function() {
            var childrens = this.el.children,
                header, body, footer, bodyWidth, value;
            if (childrens.length < 2) {
                return;
            }
            header = childrens[0];
            body = childrens[1].children[0];
            footer = childrens[2];
            bodyWidth = body.offsetWidth;
            // reset margins
            header.style.marginRight = 0;
            footer.style.marginRight = 0;
            // set new margins
            value = header.offsetWidth - bodyWidth;
            header.style.marginRight = (value < 0 ? 0 : value) + 'px';
            value = footer.offsetWidth - bodyWidth;
            footer.style.marginRight = (value < 0 ? 0 : value) + 'px';
        },

        loadList: function(zip, styleid, list) {
            var successCallback = bind(this.onListLoad, this),
                errorCallback = bind(this.onListLoadError, this),
                url = '', opt;

            this.list = list;
            this.zip = zip;
            this.styleid = styleid;

            for (opt in list) {
                url = url + '&optionid=' + opt;
            }
            url = url + '&';
            this.el.innerHTML = '<div class="loading">Loading options...</div>';
            this.vehicleApi.getOptionsList(url, zip, styleid, successCallback, errorCallback);
        },

        onListLoad: function(response) {
            var list = this.parseList(response);
            this.trigger('listLoad', list.totalPrice);
            this.render(list);
        },

        onListLoadError: function() {
            this.trigger('listloaderror');
            this.render([]);
        },

        parseList: function(response) {
            var i, opt,
                options = [],
                basePrice,
                totalPrice,
                fees,
                item,
                list = this.list,
                nationalBasePrice = response.tmv.nationalBasePrice,
                totalWithOptions = response.tmv.totalWithOptions,
                tmvPrices = response.tmv.optionTMVPrices;
            for (opt in tmvPrices) {
                item = list[opt][0] ? list[opt][0] : list[opt];
                options.push({
                    id: opt,
                    name: item.name,
                    required: item.required ? true : false,
                    nullprice: item.nullprice ? item.nullprice : false,
                    available: item.available === false ? false : true,
                    invioce: tmvPrices[opt].baseInvoice ? ( tmvPrices[opt].baseInvoice < 0 ? '($' + tmvPrices[opt].baseInvoice.toString().replace(/-/,'') + ')' : '$' + tmvPrices[opt].baseInvoice ) : 0,
                    tmv: tmvPrices[opt].tmv ? ( tmvPrices[opt].tmv < 0 ? '($' + tmvPrices[opt].tmv.toString().replace(/-/,'') + ')' : '$' + tmvPrices[opt].tmv ) : 0,
                    msrp: tmvPrices[opt].baseMSRP ? ( tmvPrices[opt].baseMSRP < 0 ? '($' + tmvPrices[opt].baseMSRP.toString().replace(/-/,'') + ')' : '$' + tmvPrices[opt].baseMSRP ) : 0
                });
            }

            basePrice = {
                invoice: nationalBasePrice.baseInvoice,
                tmv: nationalBasePrice.tmv,
                msrp: nationalBasePrice.baseMSRP
            };

            fees = {
                destinationCharge: response.tmv.destinationCharge || 0,
                gasGuzzlerTax: response.tmv.gasGuzzlerTax || 0,
                regionalAdFee: response.tmv.regionalAdFee || 0
            };

            totalPrice = {
                invoice: totalWithOptions.baseInvoice,
                tmv: totalWithOptions.tmv,
                msrp: totalWithOptions.baseMSRP
            };

            return {
                options: options,
                basePrice :basePrice,
                fees: fees,
                totalPrice: totalPrice
            };
        },

        reset: function() {
            this.el.innerHTML = '';
            return this;
        },

        template: [
            '<div class="list-header">',
                '<table>',
                    '<thead>',
                        '<tr><th class="desc">Description</th><th class="price">MSRP</th></tr>',
                        '<tr class="base-price"><td class="desc"><div>Base Price</div></td><td class="price">$<%= basePrice.msrp %></td></tr>',
                    '</thead>',
                '</table>',
            '</div>',
            '<div class="list-body scroll">',
                '<table>',
                    '<tbody>',
                        '<% for (var i = 0, length = options.length; i < length; i++) { %>',
                            '<tr class="option-item" data-id="<%= options[i].id %>">',
                                '<td class="desc"><div><% if (options[i].available) { %><a data-id="<%= options[i].id %>" class="remove"><div class="nvcwidget-tooltip"><div class="arrow-left"></div>Delete</div></a><% } %><%= options[i].name %></div></td>',
                                '<td class="price"><% if (options[i].msrp === 0 && !options[i].nullprice && !options[i].required) { %><span>included</spat><% } else { %><%= options[i].msrp %><% } %></td></tr>',
                        '<% } %>',
                        '<% if (fees.destinationCharge !== 0) { %>',
                            '<tr><td class="desc"><div>Destination Fee</div></td><td class="price">$<%= fees.destinationCharge %></td></tr>',
                        '<% } %>',
                        '<% if (fees.gasGuzzlerTax !== 0) { %>',
                            '<tr><td class="desc"><div>Gas Guzzler Tax</div></td><td class="price">$<%= fees.gasGuzzlerTax %></td></tr>',
                        '<% } %>',
                        '<% if (fees.regionalAdFee !== 0) { %>',
                            '<tr><td class="desc"><div>Advertising Fee</div></td><td class="price">$<%= fees.regionalAdFee %></td></tr>',
                        '<% } %>',
                    '</tbody>',
                '</table>',
            '</div>',
            '<div class="list-footer">',
                '<table>',
                    '<tfoot>',
                        '<tr class="total-price"><td class="desc"><div>Total Price</div></td><td class="price">$<%= totalPrice.msrp %></td></tr>',
                    '</tfoot>',
                '</table>',
            '</div>'
        ].join('')

    };

    return OptionsList;

}());