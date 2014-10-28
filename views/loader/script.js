
    var EDM = global.EDM = global.EDM || {},
        hasOwn = [].hasOwnProperty;

    /**
     * @param {String} tagName
     * @param {Object} attributes
     */
    function createElement(tagName, attributes) {
        var element = document.createElement(tagName),
            attribute;
        attributes = attributes || {};
        for (attribute in attributes) {
            if (hasOwn.call(attributes, attribute)) {
                element.setAttribute(attribute, attributes[attribute]);
            }
        }
        return element;
    }

    /**
     * @param {String} name
     * @param {Function} callback
     * @param {Object} context
     */
    function defferedSubscribe(name, callback, context) {
        if (!this._deferredEvents) {
            this._deferredEvents = [];
        }
        this._deferredEvents.push({
            name: name,
            callback: callback,
            context: context
        });
        return this;
    }

    /**
     * @class WidgetFrame
     * @constructor
     * @param {String} renderTo
     * @param {Object} attributes
     */
    function WidgetFrame(renderTo, attributes, includes) {

        var
            /**
             * @private _targetElement
             * @type {HTMLElement}
             */
            _targetElement = document.getElementById(renderTo),

            /**
             * @private _iframe
             * @type {HTMLIFrameElement}
             */
            _iframe,

            /**
             * @private _iframeDocument
             * @type {HTMLDocument}
             */
            _iframeDocument,

            /**
             * @private _iframeDocumentHead
             * @type {HTMLHeadElement}
             */
            _iframeDocumentHead,

            /**
             * @private _iframeDocumentBody
             * @type {HTMLBodyElement}
             */
            _iframeDocumentBody,

            /**
             * @private _iframeWindow
             * @type {Window}
             */
            _iframeWindow;

        if (!_targetElement) {
            throw new Error('Element with id "' + renderTo + '" was not found');
        }

        attributes = attributes || {};
        attributes.border = 0;
        attributes.frameBorder = 0;
        attributes.scrolling = 'no';
        _iframe = createElement('iframe', attributes);
        _targetElement.appendChild(_iframe);
        _iframeDocument = _iframe.contentDocument || _iframe.contentWindow.document;
        _writeContent();
        _iframeDocumentHead = _iframeDocument.head || _iframeDocument.getElementsByTagName('head')[0];
        _iframeDocumentBody = _iframeDocument.body;
        _iframeWindow = _iframe.contentWindow;

        /**
         * @private
         * @method _writeContent
         */
        function _writeContent() {
            var files, i, length,
                content = '<!doctype html><html><head><meta charset="utf-8">';
            files = includes.styles;
            for (i = 0, length = files.length; i < length; i++) {
                content += '<link rel="stylesheet" href="' + files[i] + '">';
            }
            content += '</head><body><div id="nvcwidget"></div>';
            files = includes.scripts;
            for (i = 0, length = files.length; i < length; i++) {
                content += '<script type="text/javascript" src="' + files[i] + '"></script>';
            }
            content += '</body></html>';
            _iframeDocument.open();
            _iframeDocument.write(content);
            _iframeDocument.close();
        }

        /**
         * @method addScript
         * @chainable
         */
        this.addScript = function(url) {
            var element = createElement('script', {
                type: 'text/javascript',
                src: url
            });
            _iframeDocumentBody.appendChild(element);
            return this;
        };

        /**
         * @method addStyle
         * @chainable
         */
        this.addStyle = function(url) {
            var element = createElement('link', {
                rel: 'stylesheet',
                href: url
            });
            _iframeDocumentHead.appendChild(element);
            return this;
        };

        /**
         * @method getWindow
         * @return {Window}
         */
        this.getWindow = function() {
            return _iframeWindow;
        };

    }

    function getThemeStyleUrl(options) {
        var theme = options.theme || 'simple',
            colorScheme = options.colorScheme || 'light';
        return '/css/carconfig/' + theme + '-' + colorScheme + '.css';
    }

    function getAdditionalStyleUrl(options) {
        return '/nvc/api/less?' + [
            'style[theme]=' + options.theme || 'simple',
            'style[colorScheme]=' + options.color || 'light',
            'style[layout]=vertical',
            'variables[width]=' + options.width + 'px',
            'variables[height]=' + options.height + 'px',
            'variables[borderWidth]=' + options.border || '1px',
            'variables[borderRadius]=' + options.borderRadius || '5px',
            'type=css'
        ].join('&');
    }

    /**
     * @static
     * @method createWidget
     * @param {Object} config
     */
    EDM.createWidget = function(config) {
        var iframe = new WidgetFrame(config.renderTo, {
                height: config.style.height,
                width: config.style.width
            }, {
                styles: [
                    baseUrl + getAdditionalStyleUrl(config.style)
                ],
                scripts: [
                    baseUrl + '/js/libs/require/require.js',
                    baseUrl + '/js/libs/jquery/jquery.min.js',
                    baseUrl + '/js/libs/underscore/underscore-min.js',
                    baseUrl + '/js/libs/backbone/backbone-min.js',
                    baseUrl + '/libs/edmunds-sdk/dest/widget-sdk.min.js',
                    baseUrl + '/nvc/js/nvc.min.js'
                ]
            }),
            iframeWindow = iframe.getWindow();

        iframeWindow.widgetConfig = config;
        iframeWindow.widgetSubscriber = { on: defferedSubscribe };

        return iframeWindow.widgetSubscriber;
    };
