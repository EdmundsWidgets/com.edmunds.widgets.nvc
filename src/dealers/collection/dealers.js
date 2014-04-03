define([
    'dealers/model/dealer',
    'dealers/model/search-criteria'
], function(Dealer, SearchCriteria) {

    return Backbone.Collection.extend({

        url: 'http://api.edmunds.com/v1/api/dealer',

        model: Dealer,

        searchCriteria: new SearchCriteria(),

        parse: function(response) {
            return response.dealerHolder;
        },

        getSelectedIds: function() {
            return this.reduce(function(list, model) {
                if (model.get('selected') === true) {
                    list.push(model.get('id'));
                }
                return list;
            }, []);
        },

        load: function() {
            return this.fetch({
                data: this.searchCriteria.toJSON(),
                dataType: 'jsonp',
                timeout: 5000,
                reset: true
            });
        }

    });

});
