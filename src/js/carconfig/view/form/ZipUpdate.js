EDM.namespace('view.form').ZipUpdate = Backbone.View.extend({

    // TODO remove zipcode-update class
    className: 'edm-form-zipupdate zipcode-update',

    initialize: function(options) {
        // zip field
        this.zipField = new EDM.view.form.ZipField({
            vehicleApiKey:  options.vehicleApiKey,
            zipCode:        options.zipCode
        });
        this.zipField.on('valid', this.onZipValid, this);
        this.zipField.on('invalid', this.onZipInvalid, this);
        this.zipField.on('blur', this.onZipBlur, this);
        // button
        this.button = new EDM.view.form.Button({
            className: 'button-light',
            text: 'Update'
        });
        this.button.on('click', this.onButtonClick, this);
    },

    render: function() {
        var el = this.$el;
        el.append('<label>ZIP: </label>');
        el.append(this.zipField.el);
        el.append(this.button.render().el);
        this.zipField.render();
        return this;
    },

    disable: function() {
        this.button.disable();
        this.zipField.disable();
        return this;
    },

    enable: function() {
        this.button.enable();
        this.zipField.enable();
        return this;
    },

    onButtonClick: function() {
        this.trigger('update', this.zipField.$el.val());
    },

    onZipValid: function() {
        this.button.enable();
    },

    onZipInvalid: function() {
        this.button.disable();
    },

    updateZipCode: function(zipCode) {
        this.zipField.updateZipCode(zipCode);
    }

});
