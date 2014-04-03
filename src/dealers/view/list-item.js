define([
    'dealers/template/list-item'
], function(itemTemplate) {

    return Backbone.View.extend({

        className: 'edm-dealers-list-item',

        template: itemTemplate,

        events: {
            'change [type="checkbox"]': 'onChangeSelection'
        },

        render: function() {
            var inner = this.template(this.model.toJSON());
            this.$el.html(inner);
            return this;
        },

        onChangeSelection: function() {
            var selected = this.$('[type="checkbox"]').prop('checked');
            this.model.set('selected', selected);
        }

    });

});
