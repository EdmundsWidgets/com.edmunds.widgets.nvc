EDM.PrintEmailTemplate = function(options) {
    var documentBody = document.body,
        iframeElement, iframeWindow, iframeDocument,

        SEND_EMAIL_ADDRESS      = 'http://api.edmunds.com/api/emp/esp/sendEmail',
        EMAIL_FROM_ADDRESS      = 'api@edmunds.com',
        EMAIL_FROM_NICE_NAME    = 'Edmunds.com',
        EMAIL_REPLY_ADDRESS     = 'api@edmunds.com',
        EMAIL_SUBJECT           = 'Your New Vehicle Configuration Details';

    function createIframe() {
        iframeElement = document.createElement('iframe');
        iframeElement.style.display = 'none';
        documentBody.appendChild(iframeElement);
        iframeWindow = iframeElement.contentWindow;
        iframeDocument = iframeElement.contentDocument || iframeWindow.document;
    }

    function writeIframeContent(content) {
        if (iframeDocument) {
            iframeDocument.open();
            iframeDocument.write(content);
            iframeDocument.close();
        }
    }

    function removeIframe() {
        documentBody.removeChild(iframeElement);
        iframeElement = iframeWindow = iframeDocument = undefined;
    }

    this.printConfiguration = function(options) {
        var iframeContent = this.getConfigurationHTML(options);
        createIframe();
        writeIframeContent(iframeContent);
        iframeWindow.print();
        removeIframe();
    };

    this.printPriceQuotes = function(options) {
        var iframeContent = this.getPriceQuotesHTML(options);
        createIframe();
        writeIframeContent(iframeContent);
        iframeWindow.print();
        removeIframe();
    };

    this.sendConfiguration = function(vehicleApiKey, email, options) {
        $.ajax({
            url:    SEND_EMAIL_ADDRESS,
            type:   'POST',
            data: {
                api_key:        vehicleApiKey,
                fromAddress:    EMAIL_FROM_ADDRESS,
                fromNiceName:   EMAIL_FROM_NICE_NAME,
                toAddress:      email,
                replyToAddress: EMAIL_REPLY_ADDRESS,
                emailSubject:   EMAIL_SUBJECT,
                emailBody:      this.getConfigurationBodyHTML(options)
            }
        });
    };

    this.sendPriceQuotes = function(vehicleApiKey, email, options) {
        $.ajax({
            url:    SEND_EMAIL_ADDRESS,
            type:   'POST',
            data: {
                api_key:        vehicleApiKey,
                fromAddress:    EMAIL_FROM_ADDRESS,
                fromNiceName:   EMAIL_FROM_NICE_NAME,
                toAddress:      email,
                replyToAddress: EMAIL_REPLY_ADDRESS,
                emailSubject:   EMAIL_SUBJECT,
                emailBody:      this.getPriceQuotesBodyHTML(options)
            }
        });
    };

};

EDM.PrintEmailTemplate.prototype = {

    getLogoSection: function(useData) {
        var data = 'data:image/png;base64,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',
            url = 'http://static.ed.edmunds-media.com/unversioned/img/logo.png',
            src = useData ? data : url;
        return '<img src="' + src + '" alt="Edmunds.com" height="36" width="109" />';
    },

    getDescriptionSection: function(vehicleFullName, vehicleStyleName) {
        return [
            '<div class="vehicle-description">',
                '<div class="name">' + vehicleFullName + '</div>',
                '<div>' + vehicleStyleName + '</div>',
            '</div>'
        ].join('');
    },

    getPricesSection: function(totalPrice) {
        return [
            '<h2>New Car Prices</h2>',
            '<div class="prices">',
                '<div class="note">* Price as configured</div>',
                (totalPrice.baseMSRP ? '<div>MSRP: ' + _.currency(totalPrice.baseMSRP) + '</div>': ''),
                (totalPrice.baseInvoice ? '<div>Invoice: ' + _.currency(totalPrice.baseInvoice) + '</div>': ''),
                (totalPrice.tmv ? '<div><b>True Market Value<sup>&reg</sup>: ' + _.currency(totalPrice.tmv) + '</b></div>': ''),
            '</div>'
        ].join('');
    },

    getIncentivesSection: function(customerCashPrice) {
        if (customerCashPrice > 0) {
            return [
                '<h2>Incentives</h2>',
                '<div class="incentives">Customer Cash: ' + _.currency(customerCashPrice) + '</div>'
            ].join('');
        }
        return '';
    },

    getFeaturesSection: function(features, basePrice) {
        var html = [
            '<h2>Your selected options</h2>',
            '<table class="table-features">',
                '<thead>',
                    '<tr>',
                        '<th>Description</th>',
                        '<th class="price">MSRP</th>',
                    '</tr>',
                    '<tr>',
                        '<th>Base Price</th>',
                        '<th class="price">' + _.currency(basePrice.baseMSRP) + '</th>',
                    '</tr>',
                '</thead>',
                '<tbody>'
        ].join('');
        if (features) {
            features.each(function(feature) {
                var baseMSRP = feature.get('price').baseMSRP;
                if (_.isNull(baseMSRP)) {
                    return;
                }
                html += [
                    '<tr>',
                        '<td>' + feature.get('name') + '</td>',
                        '<td class="price">' + (feature.isIncluded() ? 'included' : _.currency(baseMSRP)) + '</td>',
                    '</tr>'
                ].join('');
            });
        }
        html += [
                '</tbody>',
                '<tfoot>',
                    '<tr>',
                        '<th>Total Price</th>',
                        '<th class="price">' + _.currency(basePrice.baseMSRP + (features ? features.getTotalPrice().baseMSRP : 0)) + '</th>',
                    '</tr>',
                '</tfoot>',
            '</table>'
        ].join('');
        return html;
    },

    getDealersSection: function(premierDealers, allDealers) {
        return [
            '<table class="table-dealers">',
                '<thead>',
                    '<tr>',
                        '<th class="col">Premier Dealers</th>',
                        '<th class="space"></th>',
                        '<th class="col">All Dealers</th>',
                    '</tr>',
                '</thead>',
                '<tbody>',
                    '<tr>',
                        '<td class="col">' + this.getDealersList(premierDealers) + '</td>',
                        '<td class="space"></td>',
                        '<td class="col">' + this.getDealersList(allDealers) + '</td>',
                    '</tr>',
                '</tbody>',
            '</table>'
        ].join('');
    },

    getDealersList: function(dealers) {
        var html = '';
        if (dealers) {
            html += '<table><tbody>';
            dealers.each(function(dealer) {
                html += [
                    '<tr>',
                        '<td>',
                            '<div class="name"><b>' + (dealer.get('name') || '&nbsp;') + '</b></div>',
                            '<div class="distance">' + (dealer.getDistance() || '&nbsp;') + ' mi away</div>',
                            '<div class="address">' + (dealer.getAddress() || '&nbsp;') + '</div>',
                            '<div class="phone"><b>' + (dealer.getPhone() || '&nbsp;') + '</b></div>',
                        '</td>',
                    '</tr>'
                ].join('');
            });
            html += '</tbody></table>';
        }
        return html;
    },

    getFooterSection: function() {
        return '<div class="footer">&copy; Edmunds Inc. All rights Reserved. This information was extracted from www.edmunds.com and is subject to the terms of the Visitor Agreement at http://www.edmunds.com/about/visitor-agreement.html</div>';
    },

    getCommonStyles: function() {
        return [
            '<style>',
                'body{font-family:Arial,sans-serif;font-size:12px;line-height:1.5}',
                'h2{font-size:14px;margin:15px 0 5px}',
                '.container{padding-top:10px;width:700px}',
                '.vehicle-description{border-bottom:1px solid #ddd;font-size:14px;padding:15px 0}',
                '.vehicle-description .name{font-weight:700}',
                '.prices{border:1px solid #000;font-size:18px;list-style:none;margin:0;padding:10px 20px}',
                '.prices .note{font-size:12px;line-height:1;margin-top:-5px;text-align:right}',
                '.incentives{border:1px solid #000;font-size:18px;padding:10px 20px}',
                '.footer{border-top:1px solid #ddd;color:#555;font-size:11px;margin-top:30px;padding:15px 0}',
            '</style>'
        ].join('');
    },

    getConfigurationStyles: function() {
        return [
            '<style>',
                '.table-features{border:0;border-collapse:collapse}',
                '.table-features th{text-align:left}',
                '.table-features th,.table-features td{padding:7px 0}',
                '.table-features .price{padding-left:75px;text-align:right}',
            '</style>'
        ].join('');
    },

    getPriceQuotesStyles: function() {
        return [
            '<style>',
                '.table-dealers{border:0;border-collapse:collapse;margin-top:20px;width:100%}',
                '.table-dealers th{text-align:left}',
                '.table-dealers .space{width:10%}',
                '.table-dealers .col{width:45%}',
                '.table-dealers table{border:1px solid black;border-collapse:collapse;width:100%}',
                '.table-dealers table, .table-dealers table td{border:1px solid black}',
                '.table-dealers table td{padding:10px 15px}',
            '</style>'
        ].join('');
    },

    getConfigurationBodyHTML: function(options) {
        return [
            this.getCommonStyles(),
            this.getConfigurationStyles(),
            '<table style="border:0;border-collapse:collapse;width:700px"><tbody><tr><td>',
                this.getLogoSection(options.print),
                this.getDescriptionSection(options.vehicleFullName, options.vehicleStyleName),
                this.getPricesSection(options.totalPrice),
                this.getIncentivesSection(options.customerCashPrice),
                this.getFeaturesSection(options.features, options.basePrice),
                this.getFooterSection(),
            '</td></tr></tbody></table>'
        ].join('');
    },

    getPriceQuotesBodyHTML: function(options) {
        return [
            this.getCommonStyles(),
            this.getPriceQuotesStyles(),
            '<table style="border:0;border-collapse:collapse;width:700px"><tbody><tr><td>',
                this.getLogoSection(options.print),
                this.getDescriptionSection(options.vehicleFullName, options.vehicleStyleName),
                this.getPricesSection(options.totalPrice),
                this.getIncentivesSection(options.customerCashPrice),
                this.getDealersSection(options.premierDealers, options.allDealers),
                this.getFooterSection(),
            '</td></tr></tbody></table>'
        ].join('');
    },

    getConfigurationHTML: function(options) {
        return [
            '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
            '<html xmlns="http://www.w3.org/1999/xhtml">',
                '<head>',
                    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">',
                    '<title>Configuration</title>',
                '</head>',
                '<body>',
                    this.getConfigurationBodyHTML(options),
                '</body>',
            '</html>'
        ].join('');
    },

    getPriceQuotesHTML: function(options) {
        return [
            '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
            '<html xmlns="http://www.w3.org/1999/xhtml">',
                '<head>',
                    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">',
                    '<title>Price Quotes</title>',
                '</head>',
                '<body>',
                    this.getPriceQuotesBodyHTML(options),
                '</body>',
            '</html>'
        ].join('');
    }

};