define([], function() {

    return Backbone.Model.extend({

        defaults: {
            radius: 100,
            premierOnly: true,
            rows: 5,
            isPublic: false,
            invalidTiers: 'T1',
            bookName: '',
            sortBy: 'dealer_distance:asc',
            fmt: 'json'
        }

        /**
         * @attribute api_key
         * @type {String}
         * @required
         */

        /**
         * @attribute makeName
         * @type {String}
         * @required
         */

        /**
         * @attribute model
         * @type {String}
         * @required
         */

        /**
         * @attribute styleid
         * @type {String}
         * @required
         */

        /**
         * @attribute zipcode
         * @type {String}
         * @required
         */

        /**
         * @attribute keywords
         * @type {String}
         */

        /**
         * @attribute radius
         * @type {Number}
         * @default 100
         */

        /**
         * @attribute premierOnly
         * @type {Boolean}
         * @default true
         */

        /**
         * @attribute rows
         * @type {Number}
         * @default 5
         */

        /**
         * @attribute isPublic
         * @type {Boolean}
         * @default false
         */

        /**
         * @attribute bookName
         * @type {String}
         * @default ""
         * @required
         */

        /**
         * @attribute invalidTiers
         * @type {String}
         * @default "T1"
         */

        /**
         * @attribute sortBy
         * @type {String}
         * @default "dealer_distance:asc"
         */

        /**
         * @attribute fmt
         * @type {String}
         * @default "json"
         * @required
         */

    });

});
