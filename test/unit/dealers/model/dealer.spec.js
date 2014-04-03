define(['dealers/model/dealer'], function(Dealer) {

    describe('dealers/model/dealer', function() {

        var dealer = new Dealer();

        describe('parseAddress', function() {

            it('should return an address string', function() {
                var result = dealer.parseAddress({
                    address: {
                        city: 'Los Angeles',
                        stateCode: 'CA',
                        zipcode: 90401
                    }
                });
                expect(result).toBe('Los Angeles CA, 90401');
            });

        });

        describe('parseBaseUrl', function() {

            it('should return a correct url for the dealer page on edmunds website', function() {
                var result = dealer.parseBaseUrl({
                    name: 'Beverly Hills BMW',
                    address: {
                        city: 'Los Angeles',
                        stateName: 'California'
                    }
                });
                expect(result).toBe('http://www.edmunds.com/dealerships/California/LosAngeles/BeverlyHillsBMW');
            });

        });

        describe('parseDistance', function() {

            it('should return a rounded distance in miles', function() {
                var result = dealer.parseDistance({
                    displayinfo: {
                        dealer_distance: '123.4567'
                    }
                });
                expect(result).toBe('123.46 mi');
            });

        });

        describe('parsePhone', function() {

            it('should return a contact phone', function() {
                var result = dealer.parsePhone({
                    contactinfo: {
                        phone: '(123) 456-7890'
                    }
                });
                expect(result).toBe('(123) 456-7890');
            });

        });

        describe('parseRating', function() {

            var response = { ratings: {} };

            it('should round a rating to the nearest 1/2', function() {
                response.ratings.SALES_OVERALL_RATING = '2.24';
                expect(dealer.parseRating(response)).toBe(2);

                response.ratings.SALES_OVERALL_RATING = '2.25';
                expect(dealer.parseRating(response)).toBe(2.5);

                response.ratings.SALES_OVERALL_RATING = '2.74';
                expect(dealer.parseRating(response)).toBe(2.5);

                response.ratings.SALES_OVERALL_RATING = '2.75';
                expect(dealer.parseRating(response)).toBe(3);
            });

        });

        describe('parseReviewsCount', function() {

            it('should return a number of sales reviews', function() {
                var result = dealer.parseReviewsCount({
                    ratings: {
                        SALES_RECOMMENDED_REVIEW_COUNT: 2,
                        SALES_NOT_RECOMMENDED_REVIEW_COUNT: 3
                    }
                });
                expect(result).toBe(5);
            });

        });

    });

});
