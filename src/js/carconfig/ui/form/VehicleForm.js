EDM.namespace('ui').VehicleForm = (function() {

    var // dependencies
        View = EDM.ui.View,
        Tooltip = EDM.ui.Tooltip,
        TextField = EDM.ui.TextField,
        PhoneFieldGroup = EDM.ui.PhoneFieldGroup,
        RegionApi = EDM.api.Region,
        KeyCode = EDM.event.KeyCode,
        template = EDM.template,
        contains = EDM.util.Array.contains,
        validator = new EDM.ui.Validator();

    return View.extend({

        initialize: function(options) {
            var firstname = this.firstname = new TextField({
                    attributes: {
                        type: 'text',
                        name: 'firstname',
                        title: 'First Name',
                        required: 'required',
                        maxlength: 50
                    },
                    validators: {
                        required: {
                            message: 'The %s field is required'
                        },
                        nameLength: {
                            message: 'Must contain at least 2 characters'
                        },
                        noNumeric: {
                            message: 'The %s field cannot contain numbers'
                        },
                        noSpecialCharacters: {
                            message: 'Must not contain any special characters such as * ^ < > \\ " . ; : [ ] ( ) { } ! @ _'
                        },
                        alpha: {
                            message: 'The %s field is invalid'
                        },
                        noRepeatSame: {
                            message: 'Must not contain 3 of the same letter concurrently'
                        },
                        noRepeatConsanant: {
                            message: 'Must not contain 6 consecutive consonants'
                        },
                        containsVowel: {
                            message: 'Must contain a vowel'
                        }
                    }
                }),
                lastname = this.lastname = new TextField({
                    attributes: {
                        type: 'text',
                        name: 'lastname',
                        title: 'Last Name',
                        required: 'required',
                        maxlength: 50
                    },
                    validators: {
                        required: {
                            message: 'The %s field is required'
                        },
                        nameLength: {
                            message: 'Must contain at least 2 characters'
                        },
                        noNumeric: {
                            message: 'The %s field cannot contain numbers'
                        },
                        noSpecialCharacters: {
                            message: 'Must not contain any special characters such as * ^ < > \\ " . ; : [ ] ( ) { } ! @ _'
                        },
                        alpha: {
                            message: 'The %s field is invalid'
                        },
                        noRepeatSame: {
                            message: 'Must not contain 3 of the same letter concurrently'
                        },
                        noRepeatConsanant: {
                            message: 'Must not contain 6 consecutive consonants'
                        },
                        containsVowel: {
                            message: 'Must contain a vowel'
                        }
                    }
                }),
                email = this.email = new TextField({
                    attributes: {
                        type: 'text',
                        name: 'email',
                        title: 'E-mail',
                        required: 'required',
                        maxlength: 50
                    },
                    validators: {
                        required: {
                            message: 'The %s field is required'
                        },
                        email: {
                            message: 'The %s field is invalid'
                        },
                        emailDomain: {
                            message: 'The %s field is invalid'
                        }
                    }
                }),
                phoneGroup = this.phoneGroup = new PhoneFieldGroup();

            //this.on('error', tooltip.show, tooltip);

            this.fields = [
                firstname,
                lastname,
                email,
                phoneGroup
            ];

            this.template = template(this.template);
        },

        bindEvents: function(){
            this.firstname.on('change', this.validate, this);
            this.lastname.on('change', this.validate, this);
            this.email.on('change', this.validate, this);
            this.phoneGroup.on('change', this.validate, this);
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
                i, wrapper;

            this.root = root;
            if (root){
                root.innerHTML = this.template({});
            }
            formElement = $(root).find('.form');
            for (i = 0; i < length; i = i + 1) {
                wrapper = $('<div class="form-field"><div class="form-field-inner"></div></div>');
                $(formElement).append(wrapper);
                fields[i].render(wrapper.find('.form-field-inner')[0]);
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
                value: fieldInfo.isValid ? $.trim(fieldInfo.fieldValue) : ''
            });
        },

        changeAvailable: function(isAvailable){
            var fields = this.fields,
                field;
            for (field in fields) {
                if (fields.hasOwnProperty(field)){
                    if(!fields[field].hasOwnProperty('fields')) {
                        fields[field].el.disabled = isAvailable ? false : true;
                    }
                    else {
                        fields[field].changeAvailable(isAvailable);
                    }
                }
            }
        },

        template: '<div class="rule"><b>2.</b> Request free price quote by using the form below and find the best deals</div><div class="form"></div>'

    });

}());
