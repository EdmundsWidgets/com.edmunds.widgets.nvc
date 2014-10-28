EDM.namespace('view.form').Button = Backbone.View.extend({

    tagName: 'button',

    events: {
        'click': 'onClick'
    },

    render: function() {
        this.$el.text(this.options.text);
        return this;
    },

    onClick: function() {
        this.trigger('click');
    },

    disable: function() {
        this.$el.prop('disabled', true);
        return this;
    },

    enable: function() {
        this.$el.prop('disabled', false);
        return this;
    }

});
