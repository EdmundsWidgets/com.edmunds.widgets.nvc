EDM.namespace('model.dealers').Dealer = Backbone.Model.extend({

    defaults: {
        address: {},
        displayinfo: {},
        ratings: {},
        selected: false
    },

    getAddress: function() {
        var address = this.attributes.address;
        return address.city + ', ' + address.stateCode + ' ' + address.zipcode;
    },

    getDistance: function() {
        return parseFloat(this.attributes.displayinfo.dealer_distance).toFixed(2);
    },

    getPhone: function() {
        return this.attributes.displayinfo.dealer_trackable_phone;
    },

    getFullRating: function() {
        return parseFloat(this.attributes.ratings.SALES_OVERALL_RATING) || 0;
    },

    getRatingClassName: function() {
        var fullRating = this.getFullRating();
        return (Math.round(fullRating * 2) / 2).toString().replace('.', '_');
    },

    getReviewsCount: function() {
        var ratings = this.attributes.ratings,
            recommendedCount = parseInt(ratings.SALES_RECOMMENDED_REVIEW_COUNT, 10) || 0,
            notRecommendedCount = parseInt(ratings.SALES_NOT_RECOMMENDED_REVIEW_COUNT, 10) || 0;
        return recommendedCount + notRecommendedCount;
    },

    getSalesReviewsUrl: function() {
        return this.getUrl() + '/sales.1.html';
    },

    getUrl: function() {
        var attributes = this.attributes,
            address = attributes.address;
        return [
            'http://www.edmunds.com/dealerships',
            address.stateName.replace(/\s+/g, ''),
            address.city.replace(/\s+/g, ''),
            attributes.logicalName
        ].join('/');
    },

    isPremier: function() {
        return this.attributes.displayinfo.is_premier === 'true';
    },

    isSelected: function() {
        return this.attributes.selected;
    }

});
