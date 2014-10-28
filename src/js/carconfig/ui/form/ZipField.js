EDM.namespace('ui').ZipField = (function() {

    var // dependencies
        View = EDM.ui.View,
        Tooltip = EDM.ui.Tooltip,
        RegionApi = EDM.api.Region,
        KeyCode = EDM.event.KeyCode,
        contains = EDM.util.Array.contains;

    return View.extend({

        tagName: 'input',

        className: 'zip-field',

        attributes: {
            type: 'text',
            title: 'ZIP Code',
            maxlength: 5
        },

        events: {
            change: 'onChange',
            keyup: 'validate',
            keypress: 'onKeyPress',
            blur: 'onBlur'
        },

        initialize: function(options) {
            var tooltip = this.tooltip = new Tooltip({
                className: 'nvcwidget-tooltip',
                text: 'Please enter a valid Zip Code'
            });
            this.defaultZip = options.zip;
            tooltip.hide();
            this.on('valid', tooltip.hide, tooltip);
            this.on('error', tooltip.show, tooltip);
            this.on('change', this.validate, this);
            // create Region Api instance
            this.regionApi = new EDM.api.Region(options.apiKey);
        },

        render: function() {
            var zipLabel = document.createElement('label'),
                el = this.el;
            zipLabel.innerHTML = 'ZIP:';
            this.el.setAttribute('value', this.defaultZip ? this.defaultZip : '');
            if (el.parentNode) {
                el.parentNode.insertBefore(zipLabel, el);
                el.parentNode.insertBefore(this.tooltip.el, el.nextSibling);
            }
            return this;
        },

        reset: function(zipCode) {
            var hasDefault = zipCode ? true : false;
            this.defaultZip = zipCode;
            this.el.value = zipCode;
            if (hasDefault === true) {
                this.trigger('valid', zipCode);
            }
            else {
                this.trigger('error');
            }
            this.tooltip.hide();
        },

        onChange: function() {
            this.trigger('change');
        },

        validate: function() {
            var value = this.el.value,
                regZip = /\d{5}/,
                callback = EDM.util.Function.bind(this.onZipLoad, this);
            //this.trigger('error');
            if (regZip.test(value)) {
                this.regionApi.getValidZip(value, callback);
                return this;
            }
            return this.trigger('error');
        },

        onZipLoad: function(response) {
            var value = this.el.value;
            if (response[value] && response[value] === 'true') {
                return this.trigger('valid', value);
            }
            return this.trigger('error');
        },

        onBlur: function() {
            this.trigger('blur');
        },

        onKeyPress: function(event) {
            event = event || window.event;
            var keyCode = event.which || event.keyCode,
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
            if (contains(allowedKeys, keyCode)) {
                return;
            }
            if (String.fromCharCode(keyCode).match(/\d/)) {
                return;
            }
            if (event.preventDefault) {
                event.preventDefault();
            }
            return false;
        },

        enable: function() {
            this.el.removeAttribute('disabled');
            return this;
        },

        disable: function() {
            this.el.setAttribute('disabled', 'disabled');
            return this;
        }

    });

}());
