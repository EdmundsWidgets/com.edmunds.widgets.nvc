/**
 * @class Category
 * @namespace EDM.view.features
 */
EDM.namespace('view.features').Category = Backbone.View.extend({

    className: 'features-category-head',

    events: {
        'click': 'onClick'
    },

    template: [
        '<div class="inner">',
            '<div class="features-category-price"><%= _.currency(totalPrice.baseMSRP) %></div>',
            '<div class="features-category-title"><%= categoryName %></div>',
        '</div>'
    ].join(''),

    initialize: function() {
        this.collection.on('reset', this.updateTotalPrice, this);
        // compile template
        this.template = _.template(this.template);
        this.setTitle(this.options.categoryName);
    },

    render: function() {
        this.el.innerHTML = this.template({
            categoryName: this.categoryName,
            totalPrice: this.collection.getTotalPrice()
        });
        return this;
    },

    updateTotalPrice: function() {
        var totalPrice = this.collection.getTotalPrice();
        this.$('.features-category-price').html(_.currency(totalPrice.baseMSRP));
        return this;
    },

    onClick: function() {
        this.trigger('open', this.categoryName, this.collection);
    },

    setTitle: function(categoryName) {
        this.categoryName = this.normalizeTitle(categoryName || '');
        return this.render();
    },

    // TODO capitalize string helper
    // words[idx] = EDM.String.capitalize(word);
    normalizeTitle: function(title) {
        var words = title.split(/[\s_]+/g);
        _.each(words, function(word, idx, words) {
            words[idx] = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        });
        return words.join(' ');
    }

});
