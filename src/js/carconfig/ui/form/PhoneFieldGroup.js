EDM.namespace('ui').PhoneFieldGroup = (function() {

    var // dependencies
        View = EDM.ui.View,
        Tooltip = EDM.ui.Tooltip,
        TextField = EDM.ui.TextField,
        RegionApi = EDM.api.Region,
        KeyCode = EDM.event.KeyCode,
        validator = new EDM.ui.Validator();

    return View.extend({

        initialize: function(options) {
            var phoneCode = this.phoneCode = new TextField({
                    className: 'code-field',
                    attributes: {
                        type: 'text',
                        name: 'phoneCode',
                        title: 'Area Code',
                        alt: '999',
                        maxLength: 3,
                        required: 'required'
                    },
                    validators: {
                        required: {
                            message: 'The %s field is required'
                        },
                        integer: {
                            message: '%s must contain digits only'
                        },
                        /*phone: {
                            message: 'Phone number is invalid'
                        },*/
                        firstDigit: {
                            message: '%s must not begin with 0 or 1'
                        },
                        excludeCode: {
                            message: 'Must not be 000, 222, 333, 411, 444, 456, 500, 555, 666, 777, 911, 900, or 999'
                        },
                        decimal: {
                            message: '%s must contain 3 digits'
                        },
                        minLength: {
                            message: '%s must contain 3 digits'
                        }
                    }
                }),
                phonePrefix = this.phonePrefix = new TextField({
                    className: 'prefix-field',
                    attributes: {
                        type: 'text',
                        name: 'phonePrefix',
                        title: 'Prefix',
                        alt: '999',
                        maxLength: 3,
                        required: 'required'
                    },
                    validators: {
                        required: {
                            message: 'The %s field is required'
                        },
                        integer: {
                            message: '%s must contain digits only'
                        },
                        firstDigit: {
                            message: '%s must not begin with 0 or 1'
                        },
                        excludePrefix: {
                            message: 'Must not be 411, 555, 611 or 911'
                        },
                        phone: {
                            message: 'Phone number is invalid'
                        },
                        decimal: {
                            message: '%s must contain 3 digits'
                        },
                        minLength: {
                            message: '%s must contain 3 digits'
                        }
                    }
                }),
                phoneSuffix = this.phoneSuffix = new TextField({
                    className: 'suffix-field',
                    attributes: {
                        type: 'text',
                        name: 'phoneSuffix',
                        title: 'Suffix',
                        alt: '9999',
                        maxLength: 4,
                        required: 'required'
                    },
                    validators: {
                        required: {
                            message: 'The %s field is required'
                        },
                        integer: {
                            message: '%s must contain digits only'
                        },
                        phone: {
                            message: 'Phone number is invalid'
                        },
                        decimal: {
                            message: '%s must contain 4 digits'
                        },
                        minLength: {
                            message: '%s must contain 4 digits'
                        }
                    }
                });

            this.fields = [
                phoneCode,
                phonePrefix,
                phoneSuffix
            ];
        },

        bindEvents: function(){
            this.phoneCode.on('change', this.validate, this);
            this.phonePrefix.on('change', this.validate, this);
            this.phoneSuffix.on('change', this.validate, this);
        },

        render: function(formElement) {
            var fields = this.fields,
                length = fields.length;

            for (var i = 0; i < length; i = i + 1) {
                fields[i].render(formElement);
            }

            this.bindEvents();
            return this;
        },

        reset: function() {
            var fields = this.fields,
                length = fields.length,
                i = 0;
            for (i = 0; i < length; i = i + 1) {
                fields[i].reset();
            }
        },

        validate: function() {
            var fields = this.fields,
                length = fields.length,
                i = 0,
                fieldInfo;
            for (i = 0; i < length; i = i + 1) {
                fieldInfo = fields[i].validateField();
                this.trigger('change', fieldInfo);
            }
        },

        changeAvailable: function(isAvailable){
            var fields = this.fields,
                field;
            for (field in fields) {
                if (fields.hasOwnProperty(field)){
                    fields[field].el.disabled = isAvailable ? false : true;
                }
            }
        }

    });

}());
