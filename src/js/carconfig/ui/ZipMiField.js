EDM.namespace('nvc').ZipMiField = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDMUNDSAPI.Vehicle,
        bind = EDM.util.Function.bind,
        template = EDM.template;

    function ZipMiField(root, apikey) {
        Observable.call(this);
        this.el = root;
        //this.initialize.apply(this, arguments);
        this.initialize(apikey);
        this.bindEvents();
    }

    ZipMiField.prototype = {

        initialize: function(apiKey) {
            this.vehicleApi = new VehicleApi(apiKey);
            this.template = template(this.template);
        },

        bindEvents: function() {
            this.on('update-dealers', this.updateDealers, this);
        },

        render: function(apiKey) {
            var zipElement, withinElement, spanWithin, spanMi,
                me = this;

            this.el.innerHTML = this.template({});
            zipElement = getElementsByClassName('zip-code', '', this.el)[0];

            // render Zip field
            this.zipField = new EDM.ui.ZipField({ apiKey: apiKey });
            zipElement.appendChild(this.zipField.el);
            this.zipField.render();
            this.zipField.valid = true;

            // render radius field
            withinElement = getElementsByClassName('within', '', this.el)[0];
            spanMi = document.createElement('span');
            spanMi.innerHTML = 'mi';
            spanWithin = document.createElement('span');
            spanWithin.innerHTML = 'within';
            withinElement.appendChild(spanWithin);

            this.miField = new EDM.ui.TextField({
                attributes: {
                    type: 'text',
                    name: 'mi',
                    title: 'Radius',
                    maxLength: 3,
                    value: 100
                },
                className: 'within-field',
                validators: {
                    decimal: {
                        message: 'The %s field is invalid'
                    },
                    maxValue: {
                        message: '%s must be less than 100'
                    }
                }
            }),
            this.miField.valid = true;
            withinElement.appendChild(this.miField.el);
            withinElement.appendChild(spanMi);
            this.miField.renderTooltip();

            this.button = this.el.getElementsByTagName('button')[0];

            this.button.onclick = function(){
                me.trigger('update-dealers');
                me.trigger('update', me.zipField.el.value, me.miField.el.value);
            };

            this.miField.on('valid', function(){
                me.miField.valid = true;
                me.validate();
            });
            this.miField.on('error', function(){
                me.miField.valid = false;
                me.validate();
            });
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

        validate: function(){
            if (this.zipField.valid && this.miField.valid) {
                this.enableButton();
                return;
            }
            this.disabledButton();
        },

        updateDealers: function(){
        },

        enableButton: function(){
            this.button.disabled = false;
        },

        disabledButton: function(){
            this.button.disabled = true;
        },

        template: [
            '<span class="name"><b>1.</b> Select dealer near your location</span>',
            '<div class="zip-code"></div>',
            '<div class="within"></div>',
            '<button type="button" class="button-light">UPDATE</button>'
        ].join('')

    };

    return ZipMiField;

}());

