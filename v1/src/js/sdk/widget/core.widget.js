    var $ = EDM.Util,
        slice = Array.prototype.slice,
        proto;

    /**
     * Base Widget Class
     * @constructor
     * @class Widget
     * @namespace EDM
     * @example
     *      // create new instance of the Widget
     *      var widget = new Widget();
     */
    var Widget = EDM.Widget = function(apiKey, options) {

        var
            /**
             * Vehicle API Key.
             * @property _apiKey
             * @private
             * @type {String}
             */
            _apiKey,

            /**
             * Base class name.
             * @property _baseClass
             * @private
             * @type {String}
             */
            _baseClass,

            /**
             * Base ID.
             * @property _baseId
             * @private
             * @type {String}
             */
            _baseId,

            /**
             * List of events.
             * @property _events
             * @private
             * @type {Object}
             */
            _events,

            /**
             * Base Options of widget.
             * @property _options
             * @private
             * @type {Object}
             */
            _options,

            /**
             * Root element of widget.
             * @property _rootElement
             * @private
             * @type {HTMLElement}
             */
            _rootElement;

        /**
         * Returns the API key.
         * @method getApiKey
         * @return {String}
         */
        this.getApiKey = function() {
            return _apiKey;
        };

        /**
         * Returns base class name.
         * @method getBaseClass
         * @return {String}
         */
        this.getBaseClass = function() {
            return _baseClass;
        };

        /**
         * Returns base Id.
         * @method getBaseId
         * @return {String}
         */
        this.getBaseId = function() {
            return _baseId;
        };

        /**
         * Returns a copy of the options to prevent the change.
         * @method getOptions
         * @return {Object}
         */
        this.getOptions = function() {
            return $.extend({}, _options);
        };

        /**
         * Returns a root element.
         * @method getRootElement
         * @return {Object}
         */
        this.getRootElement = function() {
            return _rootElement;
        };

        /**
         * Set a copy of the options to prevent the change.
         * @method setOptions
         * @return {Object}
         */
        this.setOptions = function(options) {
            _options = $.extend({}, _options, options);
        };

        /**
         * Configures the widget.
         * @private
         * @method _configure
         * @param {String} apiKey
         * @param {Object} options
         */
        function _configure(apiKey, options) {
            if (typeof apiKey !== 'string') {
                throw new Error('The API key must be a string.');
            }
            _apiKey = apiKey;
            this.setOptions(options);
            _baseClass = _options.baseClass || '';
            _baseId = 'edm' + new Date().getTime();
            // define root element
            _rootElement = document.getElementById(_options.root);
            if (_rootElement === null) {
                throw new Error('The root element was not found.');
            }
            _rootElement.className = _baseClass;
        }

        _configure.apply(this, arguments);

    };

    proto = Widget.prototype;

    proto.destroy = function() {
        var root = this.getRootElement();
        if (root !== null) {
            root.remove();
        }
    };

    EDM.Observable.call(proto);
