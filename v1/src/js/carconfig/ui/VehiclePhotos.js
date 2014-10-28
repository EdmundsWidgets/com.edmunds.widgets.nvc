EDM.namespace('nvc').VehiclePhotos = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDM.api.Vehicle,
        bind = EDM.util.Function.bind,
        template = EDM.template;

    function VehiclePhotos() {
        Observable.call(this);
        this.el = document.createElement('div');
        this.el.className = 'vehicle-photos';
        this.initialize.apply(this, arguments);
        this.bindEvents();
    }

    VehiclePhotos.prototype = {

        initialize: function(apiKey, colorScheme) {
            this.vehicleApi = new VehicleApi(apiKey);
            this.template = template(this.template);
            this.colorScheme = colorScheme;
        },

        bindEvents: function() {},

        preloadImage: function(url, callback) {
            var img = document.createElement('img');
            img.onload = function() {
                callback(img);
            };
            img.src = url;
        },

        render: function(photos) {
            var me = this;
            this.preloadImage(photos[0], function(img) {
                var span = document.createElement('span');
                span.className = 'image';
                span.appendChild(img);
                me.el.innerHTML = '';
                me.el.appendChild(span);
                me.trigger('render');
            });
            return this;
        },

        loadPhotos: function(styleId) {
            var callback = bind(this.onPhotosLoad, this);
            this.vehicleApi.getPhotosByStyleId(styleId, callback);
        },

        onPhotosLoad: function(response) {
            var photos = this.parsePhotos(response);
            var me = this;
            this.trigger('photosload', photos, response);
            this.render(photos);
        },

        onPhotosLoadError: function() {
            this.trigger('photosloaderror');
        },

        parsePhotos: function(response) {
            var baseUrl = 'http://media.ed.edmunds-media.com',
                length = response.length,
                i = 0,
                photos = [],
                photo;
            for ( ; i < length; i++) {
                photo = response[i];
                if (photo.subType === 'exterior' && (photo.shotTypeAbbreviation === 'S' || photo.shotTypeAbbreviation === 'FQ')) {
                    photos.push(baseUrl + photo.id.replace('dam/photo', '') + '_500.jpg');
                    return photos;
                }
            }
            return photos;
        },

        reset: function() {
            var lightDefaultImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANoAAACSCAIAAACsdEONAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N0FDNUM4MkZCMTlCMTFFMjkyNTRGRDI4NEFFNEY0NUQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6N0FDNUM4MzBCMTlCMTFFMjkyNTRGRDI4NEFFNEY0NUQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3QUM1QzgyREIxOUIxMUUyOTI1NEZEMjg0QUU0RjQ1RCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo3QUM1QzgyRUIxOUIxMUUyOTI1NEZEMjg0QUU0RjQ1RCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PpUWm78AABCtSURBVHja7J2LeqLK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',
                darkDefaultImage = 'data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAABQAAD/4QMpaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjAtYzA2MCA2MS4xMzQ3NzcsIDIwMTAvMDIvMTItMTc6MzI6MDAgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzUgV2luZG93cyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCMDVGRjc0MkJCRDcxMUUyQjAzNEREMDU1NDBBNkM3MyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCMDVGRjc0M0JCRDcxMUUyQjAzNEREMDU1NDBBNkM3MyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkIwNDY1NjA0QkJENzExRTJCMDM0REQwNTU0MEE2QzczIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkIwNDY1NjA1QkJENzExRTJCMDM0REQwNTU0MEE2QzczIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+/+4ADkFkb2JlAGTAAAAAAf/bAIQAAgICAgICAgICAgMCAgIDBAMCAgME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';
            this.el.innerHTML = '';
            this.render([ this.colorScheme === 'dark' ? darkDefaultImage : lightDefaultImage]);
            return this;
        },

        template: [
            '<% for (var i = 0, length = photos.length; i < length; i++) { %>',
                '<span class="image"><img src="<%= photos[i] %>"></span>',
            '<% } %>'
        ].join('')

    };

    return VehiclePhotos;

}());
