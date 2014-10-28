EDM.namespace('nvc').ConfigLeadForm = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        // helpers
        ArrayUtil = EDM.util.Array,
        isArray = ArrayUtil.isArray,
        contains = ArrayUtil.contains,
        bind = EDM.util.Function.bind;

    function ConfigLeadForm(apiKey) {
        Observable.call(this);
        this.apiKey = apiKey;
        this.initialize(apiKey);
        this.bindEvents();
    }

    ConfigLeadForm.prototype = {

        initialize: function(apiKey) {

            this.config = {
                apiKey: apiKey,
                make: '',
                model: '',
                year: '',
                styleid: '',
                zip: '',
                options: [],
                price: {},
                radius: 100,
                dealers: {},
                firstname: '',
                lastname: '',
                email: '',
                phoneCode: '',
                phonePrefix: '',
                phoneSuffix: ''
            };

        },

        setOption: function(key, value){
            this.config[key] = value;
            this.trigger('change');
            return this;
        },

        bindEvents: function() {
            this.on('change', this.validate, this);
        },

        validate: function(){
            var isValid = false;


            if (this.config.firstname.length && this.config.lastname.length && this.config.email.length && this.config.phoneCode.length && this.config.phonePrefix.length && this.config.phoneSuffix.length) {
                isValid = true;
            }
            this.trigger('readytosubmit', isValid);
        },

        reset: function(save) {
            /*var attrs = this.config;
            save = save;
            attrs = {
                apiKey:         this.apiKey,
                make:           '',
                model:          '',
                year:           '',
                styleid:        '',
                zip:            save.zip ? attrs.zip : '',
                options:        [],
                price:          {},
                radius:         100,
                dealers:        '',

                firstname:      save.contacts ? attrs.firstname : '',
                lastname:       save.contacts ? attrs.lastname : '',
                email:          save.contacts ? attrs.email : '',
                phoneCode:      save.contacts ? attrs.phoneCode : '',
                phonePrefix:    save.contacts ? attrs.phonePrefix : '',
                phoneSuffix:    save.contacts ? attrs.phoneSuffix : ''
            };*/
            this.config = {
                apiKey: this.apiKey,
                make: '',
                model: '',
                year: '',
                styleid: '',
                zip: '',
                options: [],
                price: {},
                radius: 100,
                dealers: {},
                firstname: '',
                lastname: '',
                email: '',
                phoneCode: '',
                phonePrefix: '',
                phoneSuffix: ''
            };

        }

    };

    return ConfigLeadForm;

}());
