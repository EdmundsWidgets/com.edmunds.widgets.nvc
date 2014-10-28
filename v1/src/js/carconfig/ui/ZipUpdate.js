EDM.namespace('ui').ZipUpdate = (function() {

    var
        View = EDM.ui.View,
        Button = EDM.ui.Button,
        ZipField = EDM.ui.ZipField,
        UpdateButton;

    return View.extend({

        className: 'zipcode-update',

        initialize: function(options) {
            options = options || {};
            this.zipCode = options.zip;
            // create elements
            this.zipField = new ZipField({
                apiKey: options.apiKey,
                zip: options.zip
            });
            this.button = new Button({
                className: 'button-light'
            });
            // add events
            this.zipField.on('valid', this.onZipValid, this);
            this.zipField.on('error', this.onZipError, this);
            this.zipField.on('blur', this.onZipBlur, this);
            this.button.on('click', this.onButtonClick, this);
        },

        render: function() {
            var el = this.el;
            el.appendChild(this.zipField.el);
            el.appendChild(this.button.el);
            this.zipField.render();
            this.button.setText('Update');
            return this;
        },

        showZipError: function() {
            this.zipField.tooltip.show();
            this.button.disable();
            return this;
        },

        hideZipError: function() {
            this.zipField.tooltip.hide();
            return this;
        },

        onButtonClick: function() {
            this.zipCode = this.newZipCode || this.zipCode;
            this.trigger('update', this.zipCode);
        },

        onZipBlur: function() {
            if (!this.newZipCode) {
                this.zipField.el.value = this.zipCode;
                this.hideZipError();
                this.button.enable();
            }
        },

        onZipValid: function(zipCode) {
            this.newZipCode = (zipCode === this.zipCode) ? null : zipCode;
            if (this.newZipCode) {
                this.button.enable();
            }
        },

        onZipError: function() {
            this.newZipCode = null;
            this.button.disable();
            this.trigger('error');
        },

        disable: function() {
            this.button.disable();
            this.zipField.disable();
        },

        enable: function() {
            this.button.enable();
            this.zipField.enable();
        }

    });

}());
