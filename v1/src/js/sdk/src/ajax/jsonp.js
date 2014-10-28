var EDM = window.EDM || {};

EDM.jsonp = (function(global) {
    'use strict';

    var callbackId = 0,
        documentHead = document.head || document.getElementsByTagName('head')[0];

    function createScript(url) {
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('async', true);
        script.setAttribute('src', url);
        return script;
    }

    return function(options) {
        options = options || {};

        var callbackName = 'callback' + (++callbackId),
            url = options.url + '&callback=EDM.' + callbackName + (options.cache ? '' : '&_dc=' + new Date().getTime()),
            script = createScript(url),
            abortTimeout;

        function cleanup() {
            if (script) {
                script.parentNode.removeChild(script);
            }
            clearTimeout(abortTimeout);
            delete global[callbackName];
        }

        function success(data) {
            if (typeof options.success === 'function') {
                options.success(data);
            }
        }

        function error(errorType) {
            if (typeof options.error === 'function') {
                options.error(errorType);
            }
        }

        function abort(errorType) {
            cleanup();
            if (errorType === 'timeout') {
                global[callbackName] = function() {};
            }
            error(errorType);
        }

        global[callbackName] = function(data) {
            cleanup();
            success(data);
        };

        script.onerror = function() {
            abort('error');
        };

        documentHead.appendChild(script);

        if (options.timeout > 0) {
            abortTimeout = setTimeout(function() {
                abort('timeout');
            }, options.timeout);
        }

    };

}(EDM));
