/**
 * @class Color
 * @namespace EDM.model.feature
 */
(function(FeatureModel) {

    var Color = FeatureModel.extend({

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
            if (attributeGroups.COLOR_INFO && attributeGroups.COLOR_INFO.attributes.MANUFACTURER_OPTION_NAME) {
                modelOptions.name = attributeGroups.COLOR_INFO.attributes.MANUFACTURER_OPTION_NAME.value;
            }
            // category
            if (attributeGroups.COLOR_TYPE && attributeGroups.COLOR_TYPE.attributes.COLOR_TYPE) {
                modelOptions.category = attributeGroups.COLOR_TYPE.attributes.COLOR_TYPE.value;
            }
            // primary and secondary colors
            if (attributeGroups.COLOR_CHIPS) {
                // primary color
                if (attributeGroups.COLOR_CHIPS.attributes.PRIMARY_R_CODE &&
                        attributeGroups.COLOR_CHIPS.attributes.PRIMARY_G_CODE &&
                        attributeGroups.COLOR_CHIPS.attributes.PRIMARY_B_CODE) {
                    modelOptions.primaryColor = {
                        r:  attributeGroups.COLOR_CHIPS.attributes.PRIMARY_R_CODE.value,
                        g:  attributeGroups.COLOR_CHIPS.attributes.PRIMARY_G_CODE.value,
                        b:  attributeGroups.COLOR_CHIPS.attributes.PRIMARY_B_CODE.value
                    };
                }
                // secondary color
                if (attributeGroups.COLOR_CHIPS.attributes.SECONDARY_R_CODE &&
                        attributeGroups.COLOR_CHIPS.attributes.SECONDARY_G_CODE &&
                        attributeGroups.COLOR_CHIPS.attributes.SECONDARY_B_CODE) {
                    modelOptions.secondaryColor = {
                        r:  attributeGroups.COLOR_CHIPS.attributes.SECONDARY_R_CODE.value,
                        g:  attributeGroups.COLOR_CHIPS.attributes.SECONDARY_G_CODE.value,
                        b:  attributeGroups.COLOR_CHIPS.attributes.SECONDARY_B_CODE.value
                    };
                }
            }
            // price
            modelOptions.price = featuresMapObject.price;
            return new Color(modelOptions);
        }

    });

    // define in EDM namespace
    EDM.namespace('model.feature').Color = Color;

}(
    // dependencies
    EDM.model.Feature
));
