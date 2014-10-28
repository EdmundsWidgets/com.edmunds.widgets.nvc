EDM.namespace('nvc').ZipLocation = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDMUNDSAPI.Vehicle,
        bind = EDM.util.Function.bind,
        template = EDM.template;

    function ZipLocation(root, apiKey) {
        Observable.call(this);
        this.el = root;
        //this.initialize.apply(this, arguments);
        this.apiKey = apiKey;
        this.initialize(apiKey);
        this.bindEvents();
    }

    ZipLocation.prototype = {

        initialize: function(apiKey) {
            this.vehicleApi = new VehicleApi(apiKey);
            this.template = template(this.template);
        },

        bindEvents: function() {
            this.on('update-zip', this.loadlocation, this);
        },

        render: function(apiKey) {
            var zipElement,
                me = this;

            this.el.innerHTML = this.template({});
            zipElement = getElementsByClassName('zip-code', '', this.el)[0];

            // render Zip field
            this.zipField = new EDM.ui.ZipField({ apiKey: apiKey });
            zipElement.appendChild(this.zipField.el);
            this.zipField.render();
            this.zipField.valid = true;

            this.button = this.el.getElementsByTagName('button')[0];

            this.button.onclick = function(){
                me.trigger('update-zip', me.zipField.el.value);
            };

            this.zipField.on('valid', function(){
                me.zipField.valid = true;
                me.validate();
            });

            this.zipField.on('error', function(){
                me.zipField.valid = false;
                me.validate();
            });

            return this;
        },

        loadlocation: function() {
            var callback = bind(this.onLocationLoad, this),
                zip = this.zipField.el.value;
            this.vehicleApi.getUpdateLocation(zip, callback);
        },

        onLocationLoad: function(response) {
            var location = this.parseLocation(response);
            this.renderLocation(location);
            this.trigger('location-load');
        },

        parseLocation: function(response) {
            var location = {
                state: response.regionsHolder ? response.regionsHolder[0].name : null,
                stateCode:  response.regionsHolder ? response.regionsHolder[0].stateCode : null
            };
            return location;
        },

        renderLocation: function(location){
            this.locationElement = getElementsByClassName('state', '', this.el)[0];
            this.locationElement.innerHTML = location.state ? location.state + ', ' + location.stateCode : 'Please click UPDATE button one more time.';
        },

        validate: function(){
            if (this.zipField.valid) {
                this.enableButton();
                return;
            }
            this.disabledButton();
        },

        enableButton: function(){
            this.button.disabled = false;
        },

        disabledButton: function(){
            this.button.disabled = true;
        },

        template: [
            '<span class="name">Prices for Zip code</span>',
            '<div class="zip-code tab2-zip"></div>',
            '<button type="button" class="button-light">UPDATE</button>',
            '<span class="state">&nbsp;</span>'
        ].join('')

    };

    return ZipLocation;

}());

