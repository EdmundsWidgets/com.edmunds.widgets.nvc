(function($) {

    // requires bootstrap.tooltip

    function InputGroupControl($el, options) {
        this.$el = $el;
        this.options = $.extend({}, InputGroupControl.defaults, options);
        this.initialize();
    }

    InputGroupControl.prototype = {

        initialize: function() {
            // cache elements
            this.$applySection = this.$el.find('[data-section="apply"]');
            this.$changeSection = this.$el.find('[data-section="change"]');
            this.$input = this.$applySection.find('[type="text"]');
            this.$text = this.$changeSection.find('.form-control-text');
            this.$applyBtn = this.$applySection.find('.btn');
            this.$changeBtn = this.$changeSection.find('.btn');
            // init tooltip
            this.$input.tooltip({
                trigger: 'manual',
                title: this.options.tooltipTitle,
                placement: this.options.tooltipPlacement,
                container: this.$el
            });
            // events
            this.$applyBtn.on('click', $.proxy(this.onApplyClick, this));
            this.$changeBtn.on('click', $.proxy(this.onChangeClick, this));
            // options
            if ($.isFunction(this.options.validate)) {
                this.validate = this.options.validate;
            }
            if (this.options.disabled) {
                this.disable();
            }
        },

        disable: function() {
            this.$input.attr('disabled', 'disabled');
            this.$applyBtn.attr('disabled', 'disabled');
            return this;
        },

        enable: function() {
            this.$input.removeAttr('disabled');
            this.$applyBtn.removeAttr('disabled');
            return this;
        },

        showApplySection: function() {
            this.$applySection.removeClass('hidden');
            this.$changeSection.addClass('hidden');
            return this;
        },

        showChangeSection: function() {
            this.$applySection.addClass('hidden');
            this.$changeSection.removeClass('hidden');
            return this;
        },

        validate: function(value) {
            var deferred = new $.Deferred();
            if (value.length > 0) {
                deferred.resolveWith(this, [value]);
            } else {
                deferred.rejectWith(this, [value]);
            }
            return deferred.promise();
        },

        onApplyClick: function() {
            var value = $.trim(this.$input.val());
            this.$applyBtn.text('validation...');
            this.disable();
            this.validate(value)
                .done(this.onValidationDone)
                .fail(this.onValidationFail)
                .always(this.onValidationComplete);
        },

        onChangeClick: function() {
            this.$input.text(this.$text.text());
            this.showApplySection();
        },

        onValidationDone: function(value) {
            this.$input.tooltip('hide');
            this.$text.text(value);
            this.showChangeSection();
            this.$el.trigger('valid', value);
        },

        onValidationFail: function(value) {
            this.$input.tooltip('show');
            this.$el.trigger('invalid', value);
        },

        onValidationComplete: function() {
            this.enable();
            this.$applyBtn.text('Apply');
        },

        reset: function() {
            this.showApplySection();
            this[this.options.disabled ? 'disable' : 'enable']();
            this.$applyBtn.text('Apply');
            return this;
        }

    };

    InputGroupControl.defaults = {
        tooltipTitle: 'Please enter a valid value',
        tooltipPlacement: 'bottom'
    };

    $.fn.inputGroupControl = function(options) {
        return this.each(function() {
            var $el = $(this);
            $el.data('inputGroupControl', new InputGroupControl($el, options));
        });
    };

}(window.jQuery));
