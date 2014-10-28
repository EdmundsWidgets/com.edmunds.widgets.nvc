EDM.namespace('view.form').MiField = Backbone.View.extend({

    tagName: 'input',

    className: 'edm-form-mifield within-field',

    attributes: {
        type: 'text',
        maxlength: 3
    },

    events: {
        'change': 'onChange',
        'blur': 'onChange',
        'keyup': 'validate',
        'keypress': 'onKeyPress'
    },

    initialize: function() {
        _.defaults(this.options, {
            min: 1,
            max: 100,
            radius: 100
        });
        this.tooltip = this.tooltip = new EDM.view.Tooltip({
            className: 'nvcwidget-tooltip',
            text: 'The Radius is invalid'
        });
        this.on('valid', this.onValid, this);
        this.on('invalid', this.onInvalid, this);
    },

    onChange: function() {
        var value = this.$el.val(),
            isValid = this.validate();
        if (isValid) {
            this.$el.val(Number(value));
        }
    },

    render: function() {
        this.$el.val(this.options.radius);
        this.$el.before(this.tooltip.render().el);
        return this;
    },

    validate: function() {
        var value = Number(this.$el.val());
        if (!this.$el.val().length) {
            this.trigger('invalid', 'Radius must not be empty');
            return false;
        }
        if (!(/\d+/).test(value)) {
            this.trigger('invalid', 'Radius must be a number');
            return false;
        }
        if (value !== Math.round(value)) {
            this.trigger('invalid', 'Radius must be an integer');
            return false;
        }
        if (value > this.options.max) {
            this.trigger('invalid', 'Radius must be less than or equal to ' + this.options.max);
            return false;
        }
        if (value < this.options.min) {
            this.trigger('invalid', 'Radius must be greater than or equal to ' + this.options.min);
            return false;
        }
        this.trigger('valid', value);
        return true;
    },

    onValid: function() {
        this.tooltip.hide();
    },

    onInvalid: function(message) {
        this.tooltip.setText(message).show();
    },

    onKeyPress: function(event) {
        var charCode = event.which,
            KeyCode = EDM.event.KeyCode,
            allowedKeys = [
                KeyCode.BACKSPACE,
                KeyCode.DELETE,
                KeyCode.TAB,
                KeyCode.ENTER,
                KeyCode.ARROW_LEFT,
                KeyCode.ARROW_UP,
                KeyCode.ARROW_RIGHT,
                KeyCode.ARROW_DOWN
            ];
        if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
            return;
        }
        if (String.fromCharCode(charCode).match(/\d/)) {
            return;
        }
        // for firefox
        if ((!event.which || !event.charCode) && event.keyCode && _.contains(allowedKeys, event.keyCode)) {
            return;
        }
        event.preventDefault();
        return false;
    }

});
