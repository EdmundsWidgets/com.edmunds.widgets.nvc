EDM.namespace('view.form').ZipLocation = EDM.view.form.ZipUpdate.extend({

    // TODO remove zipcode-update class
    className: 'edm-form-zipupdate zipcode-update',

    // TODO refactor template and render method
    template: [
        '<span class="name">Prices for Zip code</span>',
        '<div class="zip-code tab2-zip"></div>',
        '<span class="state">&nbsp;</span>'
    ],

    initialize: function(options) {
        EDM.view.form.ZipUpdate.prototype.initialize.apply(this, arguments);
        this.vehicleApi = new EDMUNDSAPI.Vehicle(options.vehicleApiKey);
    },

    render: function() {
        this.$el.html(this.template);
        this.$('.zip-code').append(this.zipField.el);
        this.$('.zip-code').after(this.button.render().el);
        this.zipField.render();
        return this;
    },

    onButtonClick: function() {
        this.trigger('update', this.zipField.$el.val());
    },

    loadLocation: function() {
        var callback = _.bind(this.onLocationLoad, this),
            zip = this.zipField.$el.val();
        this.vehicleApi.getUpdateLocation(zip, callback);
    },

    onLocationLoad: function(response) {
        var location = this.parseLocation(response);
        this.setLocationText(location);
        this.trigger('location-load');
    },

    parseLocation: function(response) {
        var location = {
            state: response.regionsHolder ? response.regionsHolder[0].name : null,
            stateCode:  response.regionsHolder ? response.regionsHolder[0].stateCode : null
        };
        return location;
    },

    setLocationText: function(location) {
        var text = location.state ? location.state + ', ' + location.stateCode : 'Please click UPDATE button one more time.';
        this.$('.state').text(text);
        return this;
    },

    updateZipCode: function(zipCode) {
        this.zipField.updateZipCode(zipCode);
        this.loadLocation();
    }

});
