(function($) {

    var RadioGroup = function(root, options) {
        this.$el = root;
        this.initialize.apply(this, Array.prototype.slice.call(arguments, 1));
    };

    RadioGroup.prototype = {

        initialize: function(options) {
            var root = this.$el,
                buttons, selected, value;
            options = options || {};
            buttons = this.buttons = root.find('.btn-group .btn');
            buttons.on('click', $.proxy(this.onChange, this));
            this.$input = $('<input type="hidden">').appendTo(this.$el);
            if (options.name) {
                this.$input.attr('name', options.name);
            }
            this.setValue(options.value);
            root.on('change', function(event) {
                event.stopPropagation();
            });
        },

        onChange: function(event) {
            var btn = $(event.currentTarget);
            if (!btn.hasClass('active')) {
                this.setValue(btn.data('value'));
            }
        },

        setValue: function(value, silent) {
            var buttons = this.buttons,
                btn = this.buttons.filter('[data-value="' + value + '"]'),
                input = this.$input,
                value;
            if (!btn.length) {
                btn = buttons.filter('.active');
            }
            if (!btn.length) {
                btn = buttons.eq(0);
            }
            buttons.removeClass('active');
            btn.addClass('active');
            value = btn.data('value');
            input.attr('value', value);
            if (!silent) {
                this.$el.trigger('change', [input.attr('name'), value]);
            }
        },

        getValue: function() {
            return this.$input.val();
        }

    };

    $.fn.radioGroup = function(options) {
        return this.each(function() {
            var el = $(this);
            el.data('radiogroup', new RadioGroup(el, options));
        });
    };

}(window.jQuery));

(function($) {

    function ApiKeyControl(root, options) {
        this.$el = root;
        this.initialize.apply(this, Array.prototype.slice.call(arguments, 1));
    };

    ApiKeyControl.prototype = {

        initialize: function(options) {
            this.options = $.extend({}, ApiKeyControl.defaults, options);

            this.applyButton = this.$el.find('.apikey-change [data-action="apply"]');
            this.keyInput = this.$el.find('.apikey-change [type="text"]');

            this.changeButton = this.$el.find('.apikey-entered [data-action="change"]');
            this.keyText = this.$el.find('.apikey-entered span');

            this.applyButton.on('click', $.proxy(this.onApplyButtonClick, this));
            this.changeButton.on('click', $.proxy(this.onChangeButtonClick, this));
            this.keyInput.on('change keyup', $.proxy(this.onKeyInputChange, this));
            this.keyInput.on('keydown', $.proxy(this.onKeyInputKeyDown, this));
            this.applied = !!this.options.apiKey;
            this[this.options.apiKey ? 'showEnteredInput' : 'showChangeInput']();
        },

        onApplyButtonClick: function() {
            this.keyInput.tooltip('destroy');
            if (this.applyButton.hasClass('disabled')) {
                return;
            }
            this.validate();
        },

        onChangeButtonClick: function() {
            this.applied = false;
            this.showChangeInput();
        },

        onKeyInputChange: function(event) {
            var apiKey = $.trim(this.keyInput.val());
            this.keyInput.tooltip('destroy');
            if (apiKey.length === 0) {
                this.applyButton.addClass('disabled');
                return;
            }
            this.applyButton.removeClass('disabled');
            if (event.keyCode === 13) {
                this.onApplyButtonClick();
            }
        },

        onKeyInputKeyDown: function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
            }
        },

        showEnteredInput: function() {
            this.keyText.text(this.options.apiKey);
            this.$el.find('.apikey-change').addClass('hide');
            this.$el.find('.apikey-entered').removeClass('hide');
            return this;
        },

        showChangeInput: function() {
            this.$el.find('.apikey-change').removeClass('hide');
            this.$el.find('.apikey-entered').addClass('hide');

            this.keyInput.val(this.options.apiKey);
            this.applyButton[!this.options.apiKey ? 'addClass' : 'removeClass']('disabled');
            return this;
        },

        validate: function() {
            var apiKey = $.trim(this.keyInput.val());
            this.applyButton.addClass('disabled');
            this.validateApiKey(apiKey, this.options.service)
                .done($.proxy(this.onValidateSuccess, this))
                .fail($.proxy(this.onValidateError, this));
        },

        validateApiKey: function(apiKey, service) {
            var deferred = new $.Deferred();
            $.ajax({
                url: '/api/keyvalidate',
                dataType: 'json',
                data: {
                    api_key: apiKey,
                    service: service
                },
                success: function(response) {
                    deferred[response.valid === true ? 'resolve' : 'reject'](apiKey);
                },
                error: function() {
                    deferred.reject(apiKey);
                }
            });
            return deferred.promise();
        },

        onValidateSuccess: function(apiKey) {
            this.options.apiKey = apiKey;
            this.showEnteredInput();
            this.applied = true;
            this.$el.trigger('valid', apiKey);
        },

        onValidateError: function(apiKey) {
            this.options.apiKey = '';
            this.applyButton.removeClass('disabled');
            this.showError();
            this.$el.trigger('invalid');
        },

        hasAppliedKey: function() {
            return this.applied;
        },

        showError: function(text) {
            this.keyInput.tooltip({
                animation: false,
                placement: 'bottom',
                template: '<div class="tooltip tooltip-error"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
                title: text || this.options.invalidText,
                trigger: 'manual',
                container: this.$el
            }).tooltip('show');
        }

    };

    ApiKeyControl.defaults = {
        apiKey: '',
        service: 'vehicle',
        invalidText: 'Please enter a valid API Key'
    };

    $.fn.apiKeyControl = function(options) {
        return this.each(function() {
            var el = $(this);
            el.data('apiKeyControl', new ApiKeyControl(el, options));
        });
    };

}(window.jQuery));
