/**
 * @class Option
 * @namespace EDM.model.feature
 */
(function(FeatureModel) {

    var Option = FeatureModel.extend({

        // public properties and methods

    }, /* static properties and methods */ {

        /**
         * @static
         * @param {Object} featuresMapObject
         */
        fromFeaturesMapObject: function(featuresMapObject) {
            var modelOptions = {
                    id:     featuresMapObject.id,
                    name:   featuresMapObject.name,
                    type:   featuresMapObject.equipmentType
                },
                attributeGroups = featuresMapObject.attributeGroups;
            // manufacturer name
            if (attributeGroups.OPTION_INFO && attributeGroups.OPTION_INFO.attributes.MANUFACTURER_OPTION_NAME) {
                modelOptions.name = attributeGroups.OPTION_INFO.attributes.MANUFACTURER_OPTION_NAME.value;
            }
            // category
            if (attributeGroups.OPTION_INFO && attributeGroups.OPTION_INFO.attributes.OPTION_CATEGORY) {
                modelOptions.category = attributeGroups.OPTION_INFO.attributes.OPTION_CATEGORY.value;
            } else {
                modelOptions.category = 'Other';
            }
            // price
            modelOptions.price = featuresMapObject.price;
            return new Option(modelOptions);
        }

    });

    // define in EDM namespace
    EDM.namespace('model.feature').Option = Option;

}(
    // dependencies
    EDM.model.Feature
));
