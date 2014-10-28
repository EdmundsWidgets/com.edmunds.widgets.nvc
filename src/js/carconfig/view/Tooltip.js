EDM.namespace('view').Tooltip = Backbone.View.extend({

    className: 'edm-tooltip',

    template: '<div class="arrow arrow-left"></div><span></span>',

    render: function() {
        this.$el.html(this.template);
        if (this.options.text) {
            this.setText(this.options.text);
        }
        this[this.options.show ? 'show' : 'hide']();
        return this;
    },

    setText: function(value) {
        this.$('span').text(value);
        return this;
    },

    show: function() {
        this.$el.show();
        return this;
    },

    hide: function() {
        this.$el.hide();
        return this;
    }

});
