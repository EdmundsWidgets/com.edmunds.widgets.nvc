EDM.namespace('view.form').ZipField = Backbone.View.extend({

    tagName: 'input',

    // TODO remove zip-field class
    className: 'edm-form-zipfield zip-field',

    attributes: {
        type: 'text',
        title: 'ZIP Code',
        maxlength: 5
    },

    events: {
        change: 'validate',
        blur: 'setCurrentValue',
        keyup: 'validate',
        keypress: 'onKeyPress'
    },

    initialize: function(options) {
        this.currentZipCode = options.zipCode;
        this.regionApi = new EDM.api.Region(options.vehicleApiKey);
        this.tooltip = new EDM.view.Tooltip({
            className: 'nvcwidget-tooltip',
            text: 'Please enter a valid Zip Code'
        });
        this.on('valid', this.onValid, this);
        this.on('invalid', this.onInvalid, this);
        this.on('change', this.validate, this);
    },

    render: function() {
        this.$el.val(this.currentZipCode);
        this.$el.before(this.tooltip.render().el);
        return this;
    },

    enable: function() {
        this.$el.prop('disabled', false);
        return this;
    },

    disable: function() {
        this.$el.prop('disabled', true);
        return this;
    },

    onKeyPress: function(event) {
        var charCode = event.which,
            KeyCode = EDM.event.KeyCode,
            allowedKeys = [
                KeyCode.BACKSPACE,
                KeyCode.DELETE,
                KeyCode.TAB,
                KeyCode.ENTER,
                KeyCode.ARROW_LEFT,
                KeyCode.ARROW_UP,
                KeyCode.ARROW_RIGHT,
                KeyCode.ARROW_DOWN
            ];
        if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
            return;
        }
        if (String.fromCharCode(charCode).match(/\d/)) {
            return;
        }
        // for firefox
        if ((!event.which || !event.charCode) && event.keyCode && _.contains(allowedKeys, event.keyCode)) {
            return;
        }
        event.preventDefault();
        return false;
    },

    validate: function() {
        var zipCode = this.$el.val(),
            regZip = /\d{5}/,
            successCallback = _.bind(this.onZipLoadSuccess, this),
            errorCallback = _.bind(this.onZipLoadError, this);
        if (this.pending) {
            return this;
        }
        if (this.currentZipCode === zipCode) {
            return this.trigger('valid', zipCode);
        }
        if (regZip.test(zipCode)) {
            this.pending = true;
            this.regionApi.getValidZip(zipCode, successCallback, errorCallback);
            return this;
        }
        return this.trigger('invalid', zipCode);
    },

    setCurrentValue: function() {
        this.$el.val(this.currentZipCode);
        return this.validate();
    },

    onValid: function(zipCode) {
        this.currentZipCode = zipCode;
        this.tooltip.hide();
    },

    onInvalid: function() {
        this.tooltip.show();
    },

    onZipLoadSuccess: function(response) {
        var zipCode = this.$el.val();
        this.pending = false;
        if (response[zipCode] && response[zipCode] === 'true') {
            return this.trigger('valid', zipCode);
        }
        return this.trigger('invalid', zipCode);
    },

    onZipLoadError: function() {
        this.pending = false;
        return this.trigger('invalid', this.$el.val());
    },

    updateZipCode: function(zipCode) {
        this.$el.val(zipCode);
        return this.trigger('valid', zipCode);
    }

});
