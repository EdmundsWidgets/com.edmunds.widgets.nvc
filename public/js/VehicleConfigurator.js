(function(global, $) {
    'use strict';

    var VehicleConfigurator = global.VehicleConfigurator = function() {
        this.initialize.apply(this, arguments);
    };

    var _silent = false;

    _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g
    };

    VehicleConfigurator.defaults = {
        theme: 'simple',
        colorscheme: 'light',
        layout: 'vertical',
        border: '1px',
        borderRadius: '5px',
        vehicles: 'ALL',
        priceToDisplay: 'tmv_invoice_msrp'
    };

    VehicleConfigurator.themeDefaults = {
        width: 250,
        height: 890,
        theme: 'simple',
        colorscheme: 'light',
        layout: 'vertical',
        border: '1px',
        borderRadius: '5px'
    };

    VehicleConfigurator.widgetDefaults = {
        includedMakes: '',
        colorScheme: 'light',
        zip: '',
        dealerKeywords: ''
    };

    VehicleConfigurator.tabDefaults = {
        tab1: 'Configure',
        tab2: 'TMV&reg;',
        tab3: 'Price Quotes'
    };

    VehicleConfigurator.prototype = {

        initialize: function() {
            this.widgetOptions = $.extend({}, VehicleConfigurator.widgetDefaults);
            this.themeOptions = $.extend({}, VehicleConfigurator.themeDefaults);
            this.tabOptions = $.extend({}, VehicleConfigurator.tabDefaults);
            this.initializeLayout();
        },

        initializeLayout: function() {

            var me = this,
                theme, colorscheme, layout, vehicles, widthSlider, tabSelect, tab1, tab2, tab3,
                border, borderRadiusSlider, form, zip, price, getCode;

            getCode = $('#widget-get');

            $('#apiKeyControl')
                .apiKeyControl({
                    service: 'vehicle',
                    invalidText: 'Please enter a valid API Key'
                })
                .on('valid', function(event, apiKey) {
                    me.vehicleApi = new EDMUNDSAPI.Vehicle(apiKey);
                    me.apiKey = apiKey;
                    zip.attr('disabled', false);
                    me.loadMakes();
                    me.renderWidget();
                })
                .on('invalid', function(event) {
                    me.apiKey = '';
                    zip.attr('disabled', true);
                });

            theme = $('#option_theme')
                .radioGroup({
                    name: 'style[theme]',
                    value: 'simple'
                })
                .on('change', function(event, name, value) {
                    me.themeOptions.theme = value;
                    me.renderWidget();
                })
                .data('radiogroup');

            colorscheme = $('#option_colorscheme')
                .radioGroup({
                    name: 'style[colorScheme]',
                    value: 'light'
                })
                .on('change', function(event, name, value) {

                    $('#widget-placeholder')[ value === 'dark' ? 'addClass' : 'removeClass']('dark');
                    me.themeOptions.colorscheme = value;
                    me.widgetOptions.colorScheme = value;
                    me.renderWidget();
                })
                .data('radiogroup');

            layout = $('#option_layout')
                .radioGroup({
                    name: 'style[layout]',
                    value: 'vertical'
                })
                .on('change', function(event, name, value) {
                    var min = 240,
                        max = 468,
                        val = 250,
                        name = 'variables[width]';

                    if (value === 'horizontal') {
                        min = 600;
                        max = 970;
                        val = 680;
                        name = 'variables[widthHorizontal]';
                    }

                    widthSlider.option('min', min);
                    widthSlider.option('max', max);
                    widthSlider.option('value', val);

                    $('#widget-width-value')
                        .attr('name', name)
                        .val(val + 'px');

                    //me.loadStyles();
                    me.renderWidget();
                })
                .data('radiogroup');

            vehicles = $('#option_vehicles')
                .radioGroup({
                    name: 'widgetOptions[showVehicles]',
                    value: 'ALL'
                })
                .on('change', function(event, name, value) {
                    var isUsed = value === 'USED';
                    price.find('option').each(function() {
                        var option = $(this);
                        option.text(option.data(isUsed ? 'usedText' : 'newText'));
                    });
                    me.widgetOptions.showVehicles = value;
                    me.renderWidget();
                })
                .data('radiogroup');

            border = $('#option_border')
                .on('change', function(event) {
                    event.stopPropagation();
                    me.themeOptions.border = this.checked ? '1px' : '0';
                    $('[name="variables[borderWidth]"]').val(this.checked ? '1px' : '0');
                    me.renderWidget();
                });

            borderRadiusSlider = $('#border-radius-slider')
                .slider({
                    range: 'min',
                    value: 5,
                    min: 0,
                    max: 20,
                    create: function(event, ui) {
                        $(this).find('.ui-slider-handle').tooltip({
                            animation: false,
                            title: '5px',
                            trigger: 'manual',
                            placement: 'bottom',
                            container: '#border-radius-slider .ui-slider-handle'
                        }).tooltip('show');
                    },
                    slide: function(event, ui) {
                        $(this)
                            .find('.ui-slider-handle .tooltip-inner')
                            .text(ui.value + 'px');
                    },
                    change: function(event, ui) {
                        var value = ui.value + 'px';
                        $(this)
                            .find('.ui-slider-handle .tooltip-inner')
                            .text(value);
                        $('#border-radius-value').val(value);
                        me.themeOptions.borderRadius = value;
                        if (!_silent) {
                            me.renderWidget();
                        }
                    }
                }).data('uiSlider');

            widthSlider = $('#widget-width-slider')
                .slider({
                    range: 'min',
                    value: 250,
                    min: 250,
                    max: 970,
                    create: function(event, ui) {
                        $(this).find('.ui-slider-handle').tooltip({
                            animation: false,
                            title: '250px',
                            trigger: 'manual',
                            placement: 'bottom',
                            container: '#widget-width-slider .ui-slider-handle'
                        }).tooltip('show');
                    },
                    slide: function(event, ui) {
                        $(this)
                            .find('.ui-slider-handle .tooltip-inner')
                            .text(ui.value + 'px');
                    },
                    change: function(event, ui) {
                        var value = ui.value + 'px';
                        $(this)
                            .find('.ui-slider-handle .tooltip-inner')
                            .text(value);
                        me.themeOptions.width = ui.value;
                        me.themeOptions.height = me.getWidgetHeightByWidth(ui.value);
                        $('#widget-width-value').val(value);
                        if (!_silent) {
                            me.renderWidget();
                        }
                    }
                }).data('uiSlider');

            tabSelect = $('#tab_select')
                .on('change', function(event) {
                    var selectedValue = this.value;
                    switch(selectedValue)
                    {
                        case 'All':
                            me.tabOptions.tab1 = $('#tab1_name').val();
                            me.tabOptions.tab2 = $('#tab2_name').val();
                            me.tabOptions.tab3 = $('#tab3_name').val();

                            $('[name="tab2_name"]').attr('disabled', false);
                            $('[name="tab3_name"]').attr('disabled', false);

                            me.renderWidget();
                            break;

                        case 'Tab1+Tab2':
                            me.tabOptions.tab1 = $('#tab1_name').val();
                            me.tabOptions.tab2 = $('#tab2_name').val();
                            me.tabOptions.tab3 = null;


                            $('[name="tab2_name"]').attr('disabled', false);
                            $('[name="tab3_name"]').attr('disabled', true);

                            me.renderWidget();
                            break;

                        case 'Tab1+Tab3':
                            me.tabOptions.tab1 = $('#tab1_name').val();
                            me.tabOptions.tab2 = null;
                            me.tabOptions.tab3 = $('#tab3_name').val();

                            $('[name="tab2_name"]').attr('disabled', true);
                            $('[name="tab3_name"]').attr('disabled', false);

                            me.renderWidget();
                            break;
                    }
                });

            tab1 = $('#tab1_name')
                .on('keypress', function(event) {
                    if(event.keyCode === 13) {
                        this.blur();
                        return false;
                    }
                })
                .on('focusout', function(event) {
                    var value = $.trim(this.value);
                    me.tabOptions.tab1 = value === '' ? VehicleConfigurator.tabDefaults.tab1 : value;
                    if (value === '') {
                        $(this).val(VehicleConfigurator.tabDefaults.tab1);
                    }
                    me.renderWidget();
                    return false;
                });

            tab2 = $('#tab2_name')
                .on('keypress', function(event) {
                    if(event.keyCode === 13) {
                        this.blur();
                        return false;
                    }
                })
                .on('focusout', function(event) {
                    var value = $.trim(this.value);
                    me.tabOptions.tab2 = value === '' ? VehicleConfigurator.tabDefaults.tab2 : value;
                    if (value === '') {
                        $(this).val(VehicleConfigurator.tabDefaults.tab2);
                    }
                    me.renderWidget();
                    return false;
                });

            tab3 = $('#tab3_name')
                .on('keypress', function(event) {
                    if(event.keyCode === 13) {
                        this.blur();
                        return false;
                    }
                })
                .on('focusout', function(event) {
                    var value = $.trim(this.value);
                    me.tabOptions.tab3 = value === '' ? VehicleConfigurator.tabDefaults.tab3 : value;
                    if (value === '') {
                        $(this).val(VehicleConfigurator.tabDefaults.tab3);
                    }
                    me.renderWidget();
                    return false;
                });

            zip = $('#option_zipcode')
                .on('keydown', function(event) {
                    var systemKeys = [8, 9, 16, 17, 18, 27, 35, 36, 37, 38, 39, 40, 45, 46, 86,
                        112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123],
                        numKey = [96, 97, 98, 99, 100, 101, 102, 103, 104, 105],
                        key = (event = event || window.event).keyCode,
                        val = String.fromCharCode(key),
                        isNum = (/^\d+$/).test(val),
                        isNumLock = (key == 8) || EDM.Util.contains(numKey, key);

                    if ((event.ctrlKey && key == 86) || key == 86) {
                        return isNum;
                    }
                    if (event.shiftKey && key == 45) {
                        return isNum;
                    }
                    if (event.ctrlKey || event.altKey || event.shiftKey || EDM.Util.contains(systemKeys, key)) {
                        return;
                    }
                    if (!isNumLock) {
                        return isNum;
                    }

                })
                .on('keyup', function(event) {
                    var val = this.value,
                        isValid = (/[0-9]{5}/).test(val) || val === '',
                        errorMessage = 'Please enter a valid ZIP code';

                    if (isValid){
                        me.loadZip(val);
                        me.renderWidget();
                    }
                    me.validationMessage(isValid, zip, errorMessage, { placement: 'right' });
                });

            price = $('#option_price')
                .on('change', function(event) {
                    event.stopPropagation();
                    me.widgetOptions.price = $(this).val();
                    me.renderWidget();
                });

            form = this.form = $(document.getElementById('widget-configurator'));

            form.submit($.proxy(this.onSubmit, this));

            this.initDealerKeywords();

            form.on('reset', function(event) {
                var silent = _silent = true,
                    makesElement = $('#includedMakes');

                theme.setValue('simple', silent);
                colorscheme.setValue('light', silent);
                me.themeOptions.colorscheme = 'light';
                layout.setValue('vertical', silent);
                vehicles.setValue('ALL', silent);
                price.find('option').each(function() {
                    var option = $(this);
                    option.text(option.data('newText'));
                });
                border.next().val('1px');

                $('#border-radius-value').val('5px');
                borderRadiusSlider.option('value', 5);

                //widthSlider.option('min', 250);
                //widthSlider.option('max', 1024);
                widthSlider.option('value', 250);

                $('#widget-width-value')
                    .attr('name', 'variables[width]')
                    .val('250px');

                getCode.attr('disabled', false);

                for (var prop in VehicleConfigurator.tabDefaults) {
                    if (VehicleConfigurator.tabDefaults.hasOwnProperty(prop)) {
                        me.tabOptions[prop] = VehicleConfigurator.tabDefaults[prop];
                    }
                }

                tabSelect.val('All');
                tab1.attr('disabled', false)
                    .val(VehicleConfigurator.tabDefaults.tab1);
                tab2.attr('disabled', false)
                    .val(VehicleConfigurator.tabDefaults.tab2);
                tab3.attr('disabled', false)
                    .val(VehicleConfigurator.tabDefaults.tab3);

                zip.val('');
                zip.parent().find('.error').remove();

                me.widgetOptions = $.extend({}, VehicleConfigurator.widgetDefaults);

                me.apiKey = me.apiKey || '';

                if (me.apiKey) {
                    $('#piKeyControl').data('apiKeyControl').showEnteredInput();
                    makesElement.find('[type="checkbox"]').prop('checked', false);
                    zip.attr('disabled', false);
                    me.loadMakes();
                } else {
                    makesElement.html('');
                    zip.attr('disabled', true);
                }

                me.hasZipCode = false;
                me.zipCode = '';

                me.renderWidget();

                $('#dealer_keyword').trigger('keywords.reset');

                $('#widget-placeholder').removeClass('dark');

                _silent = false;

                return false;
            });

            form.find('button[type="reset"]').on('click', function(){
                form.find('.tooltip').not('.slider-control .tooltip, .tooltip-question').remove();
            });
        },

        reset: function() {
            this.form[0].reset();
        },

        initDealerKeywords: function() {
            var input = $('#dealer_keyword'),
                btn = input.next(),
                list = $('<div class="keyword-list"></div>').insertBefore(input.parent()),
                keywords = [],
                me = this;

            function onType(event) {
                var keyword = $.trim(input.val());
                btn.attr('disabled', keyword.length === 0 || hasKeyword(keyword));
                if (event.keyCode === 13) {
                    btn.trigger('click');
                }
            }

            function addKeyword(keyword) {
                keywords.push(keyword);
                list.append('<span class="label label-info">' + keyword + '<i data-action="remove" class="icon-white icon-remove"></i></span>');
                me.widgetOptions.dealerKeywords = keywords;
                me.renderWidget();
            }

            function removeKeyword(keyword) {
                var length = keywords.length,
                    i = 0,
                    rest;
                for ( ; i < length; i++) {
                    if (keywords[i] === keyword) {
                        rest = keywords.slice(i + 1);
                        keywords.length = i;
                        keywords.push.apply(keywords, rest);
                        return;
                    }
                }
            }

            function hasKeyword(keyword) {
                var length = keywords.length,
                    i = 0;
                for ( ; i < length; i++) {
                    if (keywords[i] === keyword) {
                        return true;
                    }
                }
                return false;
            }

            list.on('click', '[data-action="remove"]', function(event) {
                var el = $(event.currentTarget).closest('.label'),
                    keyword = el.text(),
                    inputKeyword = input.val();
                removeKeyword(keyword);
                el.remove();
                btn.attr('disabled', inputKeyword.length === 0 || hasKeyword(inputKeyword));
                me.renderWidget();
            });

            input.on('change', onType).on('keyup', onType).on('keydown', function(event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                }
            });

            input.on('keywords.reset', function() {
                keywords = [];
                list.empty();
            });

            btn.attr('disabled', true).click(function() {
                var keyword = $.trim(input.val());
                if (btn.prop('disabled') === true) {
                    return;
                }
                if (keyword.length > 0 && !hasKeyword(keyword)) {
                    addKeyword(keyword);
                    input.val('');
                    btn.attr('disabled', true);
                }
            });

            return this;
        },

        validateZipCode: function(zipCode) {
            var deferred = new jQuery.Deferred(),
                api = new EDMUNDSAPI.Vehicle(this.apiKey),
                pending = true;

            setTimeout(function() {
                if (pending) {
                    pending = false;
                    deferred.reject();
                }
            }, 5000);

            api.getValidZip(zipCode, function(response) {
                if (pending) {
                    pending = false;
                    if (response && response.dealerHolder) {
                        deferred.resolve();
                        return;
                    }
                    deferred.reject();
                }
            });

            return deferred.promise();
        },

        renderWidget: function() {
            $('#nvcwidget').empty();
            this.widget = EDM.createWidget(this.getWidgetConfig());
        },

        loadZip: function(zip) {
            this.vehicleApi.getValidZip(zip, $.proxy(this.onLoadZip, this));
        },

        onLoadZip: function(data){
            var element = $('#option_zipcode'),
                getCode = $('#widget-get'),
                zip = element.val(),
                isValid = data[zip] === 'true' || zip === '' ? true : false,
                errorMessage = 'Please enter a valid ZIP code';

            this.widgetOptions.zip = isValid ? zip : '';
            this.renderWidget();
            this.hasZipCode = isValid && zip !== '' ;
            this.validationMessage(isValid, element, errorMessage, { placement: 'right' });
        },

        validationMessage: function(valid, el, message, options){
            var parent = el.parent();
            options = options || {};
            el.tooltip('destroy');
            el.tooltip({
                animation: false,
                title: message,
                trigger: 'manual',
                placement: options.placement || 'left'
            }).tooltip('hide');

            if (!valid){
                el.tooltip('show');
                el.parent().find('.tooltip').addClass('tooltip-error');
            } else {
                if(el.attr('id') !== 'option_zipcode' && el.attr('id') !== 'includedMakes'){
                    el.tooltip('show');
                    setTimeout(function(){
                        el.parents('form').find('.tooltip').not('.slider-control .tooltip, .tooltip-question').remove();
                    }, 1000);
                } else {
                    el.tooltip('hide');
                    el.parent().find('.tooltip').remove();
                }
            }
        },

        loadMakes: function() {
            var successCallback = $.proxy(this.onMakesLoad, this),
                errorCallback = $.proxy(this.onMakesLoadError, this);
            $('#includedMakes').html('<li class="message">Loading makes...</li>');
            this.widgetOptions.includedMakes = '';
            this.vehicleApi.getListOfMakes('new', successCallback, errorCallback);
        },

        onMakesLoadError: function() {
            $('#includedMakes').html('<li class="message">Makes not found</li>');
        },

        onMakesLoad: function(data) {
            var makes = data.makes,
                me = this,
                makesElement = $('#includedMakes'),
                selectAllMakes = $('#selectAllMakes'),
                key, make, options = '';

            if (data.error) {
                $('#includedMakes').html('<li class="message">Makes not found</li>');
                return;
            }

            if (makes) {
                for (key in makes) {
                    make = makes[key];
                    // create option
                    options += EDM.Util.renderTemplate([
                        '<li>',
                            '<label class="checkbox">',
                                '<input type="checkbox" value="<%= id %>">',
                                '<span><%= name %></span>',
                            '</label>',
                        '</li>'
                    ].join(''), {
                        id: make.niceName,
                        name: make.name
                    });
                }
                makesElement.html(options);

                var checkboxes = makesElement.find('[type=checkbox]');

                checkboxes.on('change', function(event) {
                    var list = [];
                    event.stopPropagation();
                    $.each(checkboxes.filter(':checked'), function(i, input) {
                        list.push(input.value);
                    });
                    $(this).closest('.controls').find('[type="hidden"]').val(list.join(','));
                    me.widgetOptions.includedMakes = list.join(',');
                    me.hasMakes = me.widgetOptions.includedMakes.length === 0 ? false : true;
                    selectAllMakes.prop('checked', false);
                    me.validationMessage(true,  $('#includedMakes'), 'Please, select at least one make', { placement: 'bottom' });
                    me.renderWidget();
                });

                selectAllMakes.change(function() {
                    var value = this.checked ? 'all' : '';
                    me.hasMakes = this.checked ? true : false;
                    checkboxes.prop('checked', this.checked);
                    me.widgetOptions.includedMakes = value;
                    $(this).closest('.control-group').find('.controls > [type="hidden"]').val(value);
                    me.validationMessage(true,  $('#includedMakes'), 'Please, select at least one make', { placement: 'bottom' });
                    me.renderWidget();
                });

            } else {
                makesElement.html('');
            }
            selectAllMakes.attr('checked', false);
            this.hasMakes = this.widgetOptions.includedMakes.length === 0 ? false : true;
            me.validationMessage(true,  $('#includedMakes'), 'Please, select at least one make', { placement: 'bottom' });
            me.renderWidget();
        },

        loadCss: function(theme, colorScheme){
            this.linkElement.href = '/css/carconfig/' + theme + '-' + colorScheme + '.css';
            var me = this;
            var deferred = new jQuery.Deferred();
            deferred.notify('Loading styles...');
            $.ajax({
                url: '/css/carconfig/' + theme + '-' + colorScheme + '.css',
                cache: false,
                dataType: 'text',
                success: function(data){
                    me.applyStylesMain(data);
                    deferred.resolve(data);
                },
                error: function() {
                    deferred.reject();
                }
            });
            return deferred.promise();
        },

        loadStyles: function() {
            var me = this;
            var deferred = new jQuery.Deferred();
            this.hideMessage();
            $.ajax({
                url: '/api/carconfig/less',
                type: 'post',
                cache: false,
                data: this.form.serialize(),
                dataType: 'json',
                success: function(data) {
                    me.onStylesLoad.apply(me, arguments);
                    deferred.resolve(data);
                },
                error: $.proxy(this.onStylesError, this)
            });
            return deferred.promise();
        },

        onStylesLoad: function(data) {
            if (data.status === 'success') {
                var css = data.result;
                this.applyStyles(data.result);
                // TODO onload less for widget
            } else {
                this.showMessage(data.status, data.message);
            }
        },

        onStylesError: function() {
            this.showMessage('error', 'ajax error');
        },

        applyStyles: function(css) {
            var el = this.styleElement;
            if (el.styleSheet) {
                el.styleSheet.cssText = css;
            } else {
                el.innerHTML = '';
                el.appendChild(document.createTextNode(css));
            }
        },

        applyStylesMain: function(css) {
            var el = this.styleElementMain;
            if (el.styleSheet) {
                el.styleSheet.cssText = css;
            } else {
                el.innerHTML = '';
                el.appendChild(document.createTextNode(css));
            }
        },

        showMessage: function(status, text) {
            $('#message')
                .removeClass()
                .addClass('alert alert-' + status)
                .text(text);
        },

        hideMessage: function() {
            $('#message')
                .removeClass()
                .empty();
        },

        onSubmit: function(event) {
            var apiKeyControl = $('#apiKeyControl').data('apiKeyControl'),
                zip = $('#option_zipcode').val();
            event.preventDefault();
            if (this.apiKey && !apiKeyControl.hasAppliedKey()) {
                apiKeyControl.showError('Please apply API key');
            }
            if (!this.apiKey) {
                apiKeyControl.showError();
            }
            if (!this.hasZipCode) {
                this.validationMessage(false, $('#option_zipcode'), 'Please enter a valid ZIP code', { placement: 'right' });
            }
            if (!this.hasMakes) {
                this.validationMessage(false, $('#includedMakes'), 'Please, select at least one make', { placement: 'bottom' });
            }
            if (apiKeyControl.hasAppliedKey() && this.apiKey && this.hasZipCode && this.hasMakes) {
                this.showInstructions();
            }
        },

        showInstructions: function() {
            $('#insert-js').html(this.getJavaScriptSnippet());
            $('#widget-instructions').modal({
                backdrop: 'static',
                show: true
            });
        },

        getJavaScriptSnippet: function() {
            var template = this.htmlEntities([
                    '<script type="text/javascript" src="' + VehicleConfigurator.ORIGIN + '/loader.js"></script>\n',
                    '<script type="text/javascript">\n' + $('#js-snippet-template').html() + '\n</script>'
                ].join(''));
            return _.template(template, {
                widgetConfig: JSON.stringify(this.getWidgetConfig(), "", 4)
            }, true);
        },

        htmlEntities: function (str) {
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        },

        getWidgetConfig: function(debug) {
            return {
                type: 'nvc',
                renderTo: 'nvcwidget',
                debug: VehicleConfigurator.debug,
                style: {
                    width:          this.themeOptions.width,
                    height:         this.themeOptions.height,
                    theme:          this.themeOptions.theme,
                    color:          this.themeOptions.colorscheme,
                    border:         this.themeOptions.border,
                    borderRadius:   this.themeOptions.borderRadius
                },
                options: {
                    apiKey:         this.apiKey,
                    includedMakes:  this.widgetOptions.includedMakes,
                    dealerKeywords: this.widgetOptions.dealerKeywords,
                    zipCode:        this.widgetOptions.zip,
                    tabs:           this.tabOptions
                }
            };
        },

        /** @deprecated */
        getIframeUrl: function(debug) {
            var url = VehicleConfigurator.ORIGIN + '/nvc/iframe',
                hasOwn = Object.prototype.hasOwnProperty,
                altName = this.getAltPropertyName,
                queryParams = [],
                options, prop, propKey;
            // extend options
            options = $.extend({}, this.widgetOptions, {
                apiKey: this.apiKey,
                dealerKeywords: JSON.stringify(this.widgetOptions.dealerKeywords),
                // styles
                theme: this.themeOptions.theme,
                colorScheme: this.themeOptions.colorscheme,
                border: this.themeOptions.border,
                borderRadius: this.themeOptions.borderRadius,
                width: this.themeOptions.width + 'px',
                height: '890px' // TODO height
            });

            for (prop in this.tabOptions) {
                if (hasOwn.call(this.tabOptions, prop) && this.tabOptions[prop] !== null) {
                    options[prop] = this.tabOptions[prop];
                }
            }

            if (debug) {
                options.debug = true;
            }
            for (prop in options) {
                if (hasOwn.call(options, prop) && options[prop] !== null) {
                    queryParams.push(altName(prop) + '=' + encodeURIComponent(options[prop]));
                }
            }
            return url + (queryParams.length ? '?' + queryParams.join('&') : '');
        },

        /** @deprecated */
        getAltPropertyName: function(prop) {
            var map = {
                'apiKey':           'ak',
                'includedMakes':    'im',
                'colorScheme':      'cs',
                'dealerKeywords':   'dk',
                // styles
                'theme':            'th',
                'border':           'b',
                'borderRadius':     'br',
                'height':           'h',
                'width':            'w',
                'tab1':             't1',
                'tab2':             't2',
                'tab3':             't3'
            };
            return map[prop] || prop;
        },

        /** @deprecaated */
        getIframeOptions: function(debug) {
            return {
                src: this.getIframeUrl(debug),
                height: '890',
                width: this.themeOptions.width
            };
        },

        getWidgetHeightByWidth: function(width) {
            if (width < 485) {
                return 890;
            } else if (width >= 485 && width < 720) {
                return 635;
            } else if (width >= 720) {
                return 480;
            }
        }

    };

}(this, window.jQuery));
