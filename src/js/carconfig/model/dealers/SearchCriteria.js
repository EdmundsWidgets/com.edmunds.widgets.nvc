EDM.namespace('model.dealers').SearchCriteria = Backbone.Model.extend({

    defaults: {
        api_key:        '',
        makeName:       '',
        model:          '',
        styleid:        '',
        zipcode:        '',
        keywords:       '',
        premierOnly:    false,
        radius:         100,
        rows:           5,
        isPublic:       false,
        bookName:       '',
        invalidTiers:   'T1',
        sortBy:         'dealer_distance:asc',
        fmt:            'json'
    }

});
