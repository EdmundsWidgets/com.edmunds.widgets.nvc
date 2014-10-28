EDM.namespace('view.form').ZipMiField = EDM.view.form.ZipUpdate.extend({

    // TODO remove zipcode-update class
    className: 'edm-form-zipupdate zipcode-update',

    // TODO refactor template and render method
    template: [
        '<div class="name"><b>1.</b> Select dealer near your location</div>',
        '<div class="zip-code"></div>',
        '<div class="within"><span>within</span><span>mi</span></div>'
    ],

    initialize: function(options) {
        EDM.view.form.ZipUpdate.prototype.initialize.apply(this, arguments);
        this.miField = new EDM.view.form.MiField({
            radius: this.options.radius
        });
        this.miField.on('valid', this.onRadiusValid, this);
        this.miField.on('invalid', this.onRadiusInValid, this);

        this.isValidZip = _.has(this.options, 'zipCode');
        this.isValidRadius = _.has(this.options, 'radius');
    },

    render: function() {
        this.$el.html(this.template);
        this.$('.zip-code').append('<label>ZIP: </label>');
        this.$('.zip-code').append(this.zipField.el);
        this.$('.within').after(this.button.render().el);
        this.$('.within span:first').after(this.miField.el);
        this.zipField.render();
        this.miField.render();
        return this;
    },

    toggleButton: function() {
        this.button[this.isValidZip && this.isValidRadius ? 'enable' : 'disable']();
    },

    onButtonClick: function() {
        this.trigger('update', this.zipField.$el.val(), this.miField.$el.val());
    },

    onZipValid: function() {
        this.isValidZip = true;
        this.toggleButton();
    },

    onZipInvalid: function() {
        this.isValidZip = false;
        this.toggleButton();
    },

    onRadiusValid: function() {
        this.isValidRadius = true;
        this.toggleButton();
    },

    onRadiusInValid: function() {
        this.isValidRadius = false;
        this.toggleButton();
    }

});
