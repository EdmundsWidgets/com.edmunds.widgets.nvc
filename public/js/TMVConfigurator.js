(function(global, $) {
    'use strict';

    var TMVConfigurator = global.TMVConfigurator = function() {
        this.initialize.apply(this, arguments);
    };

    TMVConfigurator.defaults = {
        theme: 'simple',
        colorscheme: 'light',
        layout: 'vertical',
        border: '1px',
        borderRadius: '5px',
        vehicles: 'ALL',
        zip: '90011',
        priceToDisplay: 'tmv_invoice_msrp'
    };

    TMVConfigurator.themeDefaults = {
        theme: 'simple',
        colorscheme: 'light',
        layout: 'vertical',
        border: '1px',
        borderRadius: '5px'
    };

    TMVConfigurator.widgetDefaults = {
        includedMakes: '',
        price: 'tmv-invoice-msrp',
        showVehicles: 'ALL',
        zip: ''
    };

    TMVConfigurator.prototype = {

        initialize: function(apiKey) {
            this.widgetOptions = $.extend({}, TMVConfigurator.widgetDefaults);
            this.themeOptions = $.extend({}, TMVConfigurator.themeDefaults);

            this.linkElement = document.createElement('link');
            this.linkElement.rel = "stylesheet";
            this.linkElement.href = TMVConfigurator.HOST + "/css/tmv/simple-light.css";
            //document.getElementsByTagName('head')[0].appendChild(this.linkElement);

            this.styleElementMain = document.createElement('style');
            //this.styleElementMain = document.getElementsByTagName('style')[0];
            this.styleElementMain.type = "text/css";
            document.getElementsByTagName('head')[0].appendChild(this.styleElementMain);

            this.styleElement = document.createElement('style');
            //this.styleElement = document.getElementsByTagName('style')[1];
            this.styleElement.type = "text/css";
            document.getElementsByTagName('head')[0].appendChild(this.styleElement);

            this.initializeLayout();
        },

        initializeLayout: function() {

            var me = this,
                theme, colorscheme, layout, vehicles, widthSlider,
                border, borderRadiusSlider, form, zip, price, getCode;

            getCode = $('#widget-get');

            $('#vehicleApiKeyControl')
                .apiKeyControl({
                    service: 'vehicle',
                    invalidText: 'Please enter a valid Vehicle API Key'
                })
                .on('valid', function(event, apiKey) {
                    me.vehicleApi = new EDMUNDSAPI.Vehicle(apiKey);
                    me.vehicleApiKey = apiKey;
                    zip.attr('disabled', false);
                    me.loadMakes();
                })
                .on('invalid', function(event) {
                    me.vehicleApiKey = '';
                    zip.attr('disabled', true);
                });

            theme = $('#option_theme')
                .radioGroup({
                    name: 'style[theme]',
                    value: 'simple'
                })
                .on('change', function(event, name, value) {
                    me.themeOptions.theme = value;
                    me.loadCss(value, me.themeOptions.colorscheme);
                    me.loadStyles();
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
                    me.loadCss(me.themeOptions.theme, value);
                    me.loadStyles();
                })
                .data('radiogroup');

            layout = $('#option_layout')
                .radioGroup({
                    name: 'style[layout]',
                    value: 'vertical'
                })
                .on('change', function(event, name, value) {
                    var min = 250,
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

                    me.loadStyles();
                })
                .data('radiogroup');

            vehicles = $('#option_vehicles')
                .radioGroup({
                    name: 'widgetOptions[showVehicles]',
                    value: 'ALL'
                })
                .on('change', function(event, name, value) {
                    var textProperty = String(value).toLowerCase() + 'Text';
                    price.find('option').each(function() {
                        var option = $(this);
                        option.text(option.data(textProperty));
                    });
                    me.widgetOptions.showVehicles = value;
                    if (me.vehicleApiKey) {
                        me.loadMakes();
                    }
                    me.renderWidget();
                })
                .data('radiogroup');

            border = $('#option_border')
                .on('change', function(event) {
                    event.stopPropagation();
                    $('[name="variables[borderWidth]"]').val(this.checked ? '1px' : '0');
                    me.loadStyles();
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
                        me.loadStyles();
                    }
                }).data('uiSlider');

            widthSlider = $('#widget-width-slider')
                .slider({
                    range: 'min',
                    value: 250,
                    min: 250,
                    max: 468,
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
                        $('#widget-width-value').val(value);
                        me.loadStyles();
                    }
                }).data('uiSlider');

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

            form.on('reset', function(event) {
                var silent = true,
                    makesElement = $('#includedMakes');

                theme.setValue('simple', silent);
                colorscheme.setValue('light', silent);
                me.themeOptions.colorscheme = 'light';
                layout.setValue('vertical', silent);
                vehicles.setValue('ALL', silent);
                price.find('option').each(function() {
                    var option = $(this);
                    option.text(option.data('allText'));
                });
                border.next().val('1px');

                $('#border-radius-value').val('5px');
                borderRadiusSlider.option('value', 5);

                widthSlider.option('min', 250);
                widthSlider.option('max', 468);
                widthSlider.option('value', 250);

                $('#widget-width-value')
                    .attr('name', 'variables[width]')
                    .val('250px');

                getCode.attr('disabled', false);

                zip.val('');
                zip.parent().find('.error').remove();

                me.widgetOptions = $.extend({}, TMVConfigurator.widgetDefaults);

                me.vehicleApiKey = me.vehicleApiKey || '';

                if (me.vehicleApiKey) {
                    $('#vehicleApiKeyControl').data('apiKeyControl').showEnteredInput();
                    makesElement.find('[type="checkbox"]').prop('checked', false);
                    zip.attr('disabled', false);
                    me.loadMakes();
                } else {
                    makesElement.html('');
                    zip.attr('disabled', true);
                }

                me.hasZipCode = false;
                me.zipCode = '';

                // load all styles then render the widget
                $.when(me.loadCss('simple', 'light'), me.loadStyles()).then(function() {
                    $('#widget-placeholder .alert').remove();
                    me.renderWidget();
                });

                $('#widget-placeholder').removeClass('dark');
            });

            form.find('button[type="reset"]').on('click', function(){
                form.find('.tooltip').not('.slider-control .tooltip, .tooltip-question').remove();
            });

            me.form[0].reset();
        },

        checkApiKeyLoad: function(element){
            var val = element.val(),
                isErrorApk,
                isValid = val !== '' && (/[a-zA-Z0-9]/).test(val),
                me = this,
                btn = $('#check_apikey'),
                zip = $('#option_zipcode'),
                message = "Please enter a valid API Key"; //

            me.vehicleApi = new EDMUNDSAPI.Vehicle(val);

            if (isValid){
                me.vehicleApi.invoke('/api/vehicle-directory-ajax/findmakes', {}, function(data){
                    isErrorApk = data.error ? true : false;
                    me.apiKey = val;
                    if (!isErrorApk){
                        me.validationMessage(!isErrorApk, element, 'API Key is valid');
                    } else {
                        me.validationMessage(!isErrorApk, element, message);
                    }
                    zip.attr('disabled', isErrorApk ? true : false);
                    zip.val(isErrorApk ? '' : zip.val());
                    if (isErrorApk){
                        zip.parent().find('.tooltip').remove();
                    }
                    me.widgetOptions.includedMakes = '';
                    me.loadMakes();
                });
            } else {
                me.validationMessage(isValid, element, message);
            }
        },

        renderWidget: function() {
            var widget = this.widget = new EDM.TMV(this.vehicleApiKey, {
                root: 'tmvwidget',
                baseClass: 'tmvwidget'
            });
            widget.init(this.widgetOptions);
            widget.render();
        },

        loadZip: function(zip) {
            var successCallback = $.proxy(this.onLoadZip, this),
                errorCallback = $.proxy(this.onLoadZipError, this);
            this.vehicleApi.getValidZip(zip, successCallback, errorCallback);
        },

        onLoadZip: function(data){
            var element = $('#option_zipcode'),
                getCode = $('#widget-get'),
                zip = element.val(),
                isValid = data[zip] === 'true' || zip === '' ? true : false,
                errorMessage = 'Please enter a valid ZIP code';

            this.widgetOptions.zip = isValid ? zip : '';
            this.renderWidget();
            this.hasZipCode = isValid;
            this.validationMessage(isValid, element, errorMessage, { placement: 'right' });
        },

        onLoadZipError: function() {
            this.validationMessage(isValid, $('#option_zipcode'), 'Something went wrong. Please try again enter ZIP code', { placement: 'right' });
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
                if(el.attr('id') !== 'option_zipcode'){
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
            this.vehicleApi.getListOfMakes(String(this.widgetOptions.showVehicles).toLowerCase(), successCallback, errorCallback);
        },

        resetMakes: function() {
            $('#includedMakes').empty();
            this.widgetOptions.includedMakes = '';
        },

        onMakesLoad: function(data) {
            var makes = data.makes,
                me = this,
                makesElement = $('#includedMakes'),
                selectAllMakes = $('#selectAllMakes'),
                apikey = $('#option_apikey'),
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
                    selectAllMakes.prop('checked', false);
                    me.renderWidget();
                });

                selectAllMakes.change(function() {
                    var value = this.checked ? 'all' : '';
                    checkboxes.prop('checked', this.checked);
                    me.widgetOptions.includedMakes = value;
                    $(this).closest('.control-group').find('.controls > [type="hidden"]').val(value);
                    me.renderWidget();
                });

            } else {
                makesElement.html('');
            }
            selectAllMakes.attr('checked', false);
            me.renderWidget();
        },

        onMakesLoadError: function() {
            $('#includedMakes').html('<li class="message">Makes not found</li>');
        },

        loadCss: function(theme, colorScheme){
            this.linkElement.href = '/css/tmv/' + theme + '-' + colorScheme + '.css';
            var me = this;
            var deferred = new jQuery.Deferred();
            $.ajax({
                url: '/css/tmv/' + theme + '-' + colorScheme + '.css',
                cache: false,
                dataType: 'text',
                success: function(data) {
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
            var deferred = new jQuery.Deferred();
            var me = this;
            this.hideMessage();
            $.ajax({
                url: '/api/tmv/less',
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
            var vehicleApiKeyControl = $('#vehicleApiKeyControl').data('apiKeyControl');
            event.preventDefault();
            if (this.vehicleApiKey && !vehicleApiKeyControl.hasAppliedKey()) {
                vehicleApiKeyControl.showError('Please apply Vehicle API key');
            }
            if (!this.vehicleApiKey) {
                vehicleApiKeyControl.showError();
            }
            if (!this.hasZipCode) {
                this.validationMessage(false, $('#option_zipcode'), 'Please enter a valid ZIP code', { placement: 'right' });
            }
            if (this.vehicleApiKey && vehicleApiKeyControl.hasAppliedKey() && this.hasZipCode) {
                this.showInstructions();
            }
        },

        showInstructions: function() {
            var me = this;
            $.ajax({
                url: '/api/tmv/less',
                type: 'post',
                cache: false,
                data: this.form.serialize(),
                dataType: 'json',
                success: function(data) {
                    $('#insert-css').html(me.getStylesSpippet(data.result));
                    $('#insert-js').html(me.getJavaScriptSnippet());
                    $('#widget-instructions').modal({
                        backdrop: 'static',
                        show: true
                    });
                }
            });
        },

        getStylesSpippet: function(styles) {
            var template = this.htmlEntities([
                    '<link rel="stylesheet" href="{{ href }}">\n',
                    '<style>{{ styles }}</style>'
                ].join(''));
            return EDM.Util.renderTemplate(template, {
                href:   this.linkElement.href,
                styles: styles
            }, true);
        },

        getJavaScriptSnippet: function() {
            var template = this.htmlEntities('<script type="text/javascript">' + $('#js-snippet-template').html() + '</script>'),
                widgetOptions = JSON.stringify(this.widgetOptions);
            return EDM.Util.renderTemplate(template, {
                apikey:         this.vehicleApiKey,
                options:        widgetOptions,
                sdkSrc:         TMVConfigurator.HOST + '/js/edm/sdk.js',
                widgetSrc:      TMVConfigurator.HOST + '/js/tmv/tmvwidget.js'
            }, true);
        },

        htmlEntities: function (str) {
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

    };

}(this, window.jQuery));
