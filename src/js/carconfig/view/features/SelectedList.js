EDM.namespace('view.features').SelectedList = EDM.view.features.List.extend({

    className: 'selected-features-list',

    emptyText: '',

    add: function(model) {
        var item = new EDM.view.features.SelectedListItem({
            model: model
        });
        item.on('select', this.onSelect, this);
        this.$el.append(item.render().el);
        return this;
    }

});
