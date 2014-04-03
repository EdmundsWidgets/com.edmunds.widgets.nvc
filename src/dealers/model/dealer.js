define([], function() {

    function _removeWhitespaces(str) {
        return str.replace(/\s+/g, '');
    }

    return Backbone.Model.extend({

        defaults: {
            selected: false
        },

        parse: function(response) {
            return {
                id: response.id,
                name: response.name,
                address: this.parseAddress(response),
                phone: this.parsePhone(response),
                distance: this.parseDistance(response),
                baseUrl: this.parseBaseUrl(response),
                rating: this.parseRating(response),
                reviewsCount: this.parseReviewsCount(response)
            };
        },

        parseAddress: function(response) {
            var address = response.address;
            return address.city + ' ' + address.stateCode + ', ' + address.zipcode;
        },

        parseBaseUrl: function(response) {
            var address = response.address;
            return [
                'http://www.edmunds.com/dealerships',
                _removeWhitespaces(address.stateName),
                _removeWhitespaces(address.city),
                _removeWhitespaces(response.name)
            ].join('/');
        },

        parseDistance: function(response) {
            var distance = parseFloat(response.displayinfo.dealer_distance);
            return distance.toFixed(2) + ' mi';
        },

        parsePhone: function(response) {
            return response.contactinfo.phone;
        },

        parseRating: function(response) {
            var rating = parseFloat(response.ratings.SALES_OVERALL_RATING) || 0;
            return Math.round(rating * 2) / 2;
        },

        parseReviewsCount: function(response) {
            var ratings = response.ratings,
                recommendedCount = parseInt(ratings.SALES_RECOMMENDED_REVIEW_COUNT, 10) || 0,
                notRecommendedCount = parseInt(ratings.SALES_NOT_RECOMMENDED_REVIEW_COUNT, 10) || 0;
            return recommendedCount + notRecommendedCount;
        }

    });

});
