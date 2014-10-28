EDM.namespace('collection').Dealers = Backbone.Collection.extend({

    url: 'http://api.edmunds.com/v1/api/dealer',

    model: EDM.model.dealers.Dealer,

    parse: function(response) {
        return response.dealerHolder;
    },

    setSelected: function(dealerIds) {
        _.each(dealerIds, function(id) {
            var dealer = this.get(id);
            if (dealer) {
                dealer.set('selected', true);
            } else {
                dealerIds = _.without(dealerIds, id);
            }
        }, this);
        return dealerIds;
    }

});
