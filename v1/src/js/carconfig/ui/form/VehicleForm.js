EDM.namespace('ui').VehicleForm = (function() {

    var // dependencies
        View = EDM.ui.View,
        Tooltip = EDM.ui.Tooltip,
        TextField = EDM.ui.TextField,
        RegionApi = EDM.api.Region,
        KeyCode = EDM.event.KeyCode,
        template = EDM.template,
        contains = EDM.util.Array.contains;

    return View.extend({

        initialize: function(options) {
            var firstname = this.firstname = new TextField({
                    attributes: {
                        type: 'text',
                        name: 'firstname',
                        title: 'First Name',
                        required: 'required',
                        maxlength: 100
                    },
                    validators: {
                        required: {
                            message: 'The %s field is required'
                        },
                        alpha: {
                            message: 'The %s field is invalid'
                        }
                    }
                }),
                lastname = this.lastname = new TextField({
                    attributes: {
                        type: 'text',
                        name: 'lastname',
                        title: 'Last Name',
                        required: 'required',
                        maxlength: 100
                    },
                    validators: {
                        required: {
                            message: 'The %s field is required'
                        },
                        alpha: {
                            message: 'The %s field is invalid'
                        }
                    }
                }),
                email = this.email = new TextField({
                    attributes: {
                        type: 'text',
                        name: 'email',
                        title: 'E-mail',
                        required: 'required',
                        maxlength: 100
                    },
                    validators: {
                        required: {
                            message: 'The %s field is required'
                        },
                        email: {
                            message: 'The %s field is invalid'
                        }
                    }
                }),
                phoneCode = this.phoneCode = new TextField({
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
                        excludeCode: {
                            message: 'Must not be 222, 333, 411, 444, 456, 500, 555, 666, 777, 911, 900, or 999'
                        },
                        decimal: {
                            message: '%s must contain 3 digits'
                        },
                        minLength: {
                            message: '%s must contain 3 digits'
                        },
                        integer: {
                            message: 'The %s field is invalid'
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
                        decimal: {
                            message: '%s must contain 3 digits'
                        },
                        minLength: {
                            message: '%s must contain 3 digits'
                        },
                        integer: {
                            message: 'The %s field is invalid'
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
                        decimal: {
                            message: '%s must contain 4 digits'
                        },
                        minLength: {
                            message: '%s must contain 4 digits'
                        },
                        integer: {
                            message: 'The %s field is invalid'
                        }
                    }
                });

            //this.on('error', tooltip.show, tooltip);

            this.fields = [
                firstname,
                lastname,
                email,
                phoneCode,
                phonePrefix,
                phoneSuffix
            ];

            this.template = template(this.template);
        },

        bindEvents: function(){
            this.firstname.on('change', this.validate, this);
            this.lastname.on('change', this.validate, this);
            this.email.on('change', this.validate, this);
            this.phoneCode.on('change', this.validate, this);
            this.phonePrefix.on('change', this.validate, this);
            this.phoneSuffix.on('change', this.validate, this);
        },

        resetValues: function() {
            var fields = this.fields,
                length = fields.length,
                i = 0;
            for (i = 0; i < length; i = i + 1) {
                fields[i].reset();
            }
        },

        render: function(root) {
            var fields = this.fields,
                length = fields.length,
                formElement,
                i;

            this.root = root;
            if (root){
                root.innerHTML = this.template({});
            }
            formElement = getElementsByClassName('form', '', root)[0];
            for (i = 0; i < length; i = i + 1) {
                fields[i].render(formElement);
            }

            this.bindEvents();
            return this;
        },

        reset: function() {
            this.root.innerHTML = '';
            return this;
        },

        validate: function(fieldInfo) {
            this.trigger('update-request-form', {
                name: fieldInfo.fieldName,
                value: fieldInfo.isValid ? fieldInfo.fieldValue : ''
            });
        },

        changeAvailable: function(isAvailable){
            var fields = this.fields,
                field;
            for (field in fields) {
                if (fields.hasOwnProperty(field)){
                    fields[field].el.disabled = isAvailable ? false : true;
                }
            }
        },

        template: '<span class="rule"><b>2.</b> Request free price quote by using the form below and find the best deals</span><div class="form"></div>'

    });

}());
