EDM.namespace('nvc').VehiclePhotos = (function() {

    var onePixelImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDkvMTIvMTOcPiNzAAAADUlEQVQImWP4//8/AwAI/AL+hc2rNAAAAABJRU5ErkJggg==';

    return Backbone.View.extend({

        className: 'vehicle-photos',

        template: '<div class="image"><img src="" alt=""></div><div class="image"><img src="" alt=""></div>',

        initialize: function(options) {
            this.vehicleApi = new EDM.api.Vehicle(options.vehicleApiKey);
            this.$el.addClass(options.colorScheme);
        },

        render: function() {
            this.$el.html(this.template);
            this.reset();
            return this;
        },

        reset: function() {
            this.$('img').attr('src', onePixelImage);
            return this;
        },

        loadPhotos: function(styleId) {
            var callback = _.bind(this.onPhotosLoad, this);
            this.vehicleApi.getPhotosByStyleId(styleId, callback);
        },

        onPhotosLoad: function(response) {
            var baseUrl = 'http://media.ed.edmunds-media.com',
                photos = [],
                images = this.$('img');
            photos.push(_.findWhere(response, { subType: 'exterior', shotTypeAbbreviation: 'FQ' }));
            photos.push(_.findWhere(response, { subType: 'exterior', shotTypeAbbreviation: 'RQ' }));
            photos = _.map(photos, function(photo) {
                return baseUrl + (photo && photo.id || onePixelImage).replace('dam/photo', '') + '_500.jpg';
            });
            images.eq(0).attr('src', photos[0]);
            images.eq(1).attr('src', photos[1]);
        }

    });

}());