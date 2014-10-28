/**
 * @class Feature
 * @namespace EDM.model
 */
(function() {

    var Feature = Backbone.Model.extend({

        defaults: {
            name: '',
            status: 'available',
            price: {
                tmv: 0,
                baseMSRP: 0,
                baseInvoice: 0
            }
        },

        /**
         * @method setAvailable
         * @chainable
         */
        setAvailable: function() {
            return this.set('status', Feature.STATUS_AVAILABLE);
        },

        /**
         * @method setExcluded
         * @chainable
         */
        setExcluded: function() {
            return this.set('status', Feature.STATUS_EXCLUDED);
        },

        /**
         * @method setIncluded
         * @chainable
         */
        setIncluded: function() {
            return this.set('status', Feature.STATUS_INCLUDED);
        },

        /**
         * @method setSelected
         * @chainable
         */
        setSelected: function() {
            return this.set('status', Feature.STATUS_SELECTED);
        },

        /**
         * @method isAvailable
         * @return {Boolean}
         */
        isAvailable: function() {
            return this.get('status') === Feature.STATUS_AVAILABLE;
        },

        /**
         * @method isExcluded
         * @return {Boolean}
         */
        isExcluded: function() {
            return this.get('status') === Feature.STATUS_EXCLUDED;
        },

        /**
         * @method isIncluded
         * @return {Boolean}
         */
        isIncluded: function() {
            return this.get('status') === Feature.STATUS_INCLUDED;
        },

        /**
         * @method isSelected
         * @return {Boolean}
         */
        isSelected: function() {
            return this.get('status') === Feature.STATUS_SELECTED;
        },

        /**
         * @method isSelected
         * @return {Boolean}
         */
        isUnavailableSelected: function() {
            return this.get('status') === Feature.STATUS_UNAVAILABLE_SELECTED;
        },

        /**
         * @method isColor
         * @return {Boolean}
         */
        isColor: function() {
            return this.get('type') === Feature.TYPE_COLOR;
        },

        /**
         * @method isOption
         * @return {Boolean}
         */
        isOption: function() {
            return this.get('type') === Feature.TYPE_OPTION;
        }

    }, /* static properties and methods */ {

        /**
         * @method fromFeaturesMapObject
         * @static
         * @param {Object} featuresMapObject
         */
        fromFeaturesMapObject: function(featuresMapObject) {
            return new Feature({
                id:     featuresMapObject.id,
                name:   featuresMapObject.name,
                type:   featuresMapObject.equipmentType
            });
        },

        /**
         * @property STATUS_AVAILABLE
         * @type {String}
         * @static
         */
        STATUS_AVAILABLE: 'available',

        /**
         * @property STATUS_INCLUDED
         * @type {String}
         * @static
         */
        STATUS_INCLUDED: 'included',

        /**
         * @property STATUS_EXCLUDED
         * @type {String}
         * @static
         */
        STATUS_EXCLUDED: 'excluded',

        /**
         * @property STATUS_SELECTED
         * @type {String}
         * @static
         */
        STATUS_SELECTED: 'selected',

        /**
         * @property STATUS_UNAVAILABLE_SELECTED
         * @type {String}
         * @static
         */
        STATUS_UNAVAILABLE_SELECTED: 'unavailable selected',

        /**
         * @property TYPE_COLOR
         * @type {String}
         * @static
         */
        TYPE_COLOR: 'color',

        /**
         * @property TYPE_OPTION
         * @type {String}
         * @static
         */
        TYPE_OPTION: 'option'

    });

    // define in EDM namespace
    EDM.namespace('model').Feature = Feature;

}());
