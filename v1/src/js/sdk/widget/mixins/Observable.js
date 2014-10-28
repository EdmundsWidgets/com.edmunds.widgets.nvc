
/**
 * Observable mixin
 * @class Observable
 * @namespace EDM
 * @example
 *     // create constructor
 *     var Widget = function() {
 *       // make the widget observable
 *       // Observable.call(Widget.prototype);
 *       Observable.call(this);
 *       // test method
 *       this.test = function(data) {
 *         this.trigger('test', data);
 *       }
 *     };
 *     // create new instance of the Widget
 *     var widget = new Widget();
 *     // add event listener
 *     widget.on('test', function(data) {
 *         console.log(data);
 *     });
 *     // test
 *     widget.test('lorem ipsum'); // => writes to console "lorem ipsum"
 * @return {Function}
 */
 EDM.Observable = (function() {

    /**
     * List of events
     * @property _events
     * @private
     * @type {Object}
     */
    var _events = {};

    /**
     * Binds a callback function to an object. The callback will be invoked whenever the event is fired.
     * @method on
     * @example
     *     // External usage example:
     *     widget.on('change:make', function(makeId) {
     *         // this code is executed when the change event is fired by the widget
     *     });
     *
     *     // Internal usage example:
     *     this.on('change:make', function(makeId) {
     *         // this code is executed when the change event is fired by the widget
     *     });
     * @param {String} event The event name
     * @param {Function} callback The callback function
     * @param {Object} [context] The context object
     * @chainable
     */
    function on(name, callback, context) {
        if (typeof name !== 'string' || name.length === 0) {
            throw new Error('The event name must be a string and not be empty.');
        }
        if (typeof callback !== 'function') {
            throw new Error('The callback must be a function.'); 
        }
        (_events[name] || (_events[name] = [])).push({
            callback: callback,
            context: context
        });
    }

    /**
     * Removes a previously-bound callback function from an object. If no event name is specified, all callbacks will be removed.
     * @method off
     * @example
     *     // External usage example:
     *     widget.off('change:make');
     *
     *     // Internal usage example:
     *     this.off('change:make');
     * @param {String} [event] The event name
     * @chainable
     */
    function off(name) {
        if (typeof name !== 'string' || name.length === 0) {
            _events = {};
            return this;
        }
        _events[name] = [];
    }

    /**
     * Trigger callbacks for the given event. Subsequent arguments to trigger will be passed along to the event callbacks.
     * @method trigger
     * @example
     *     this.trigger('change:make', makeId);
     * @param {String} event The event name
     * @param {Function} [arg*] The arguments
     * @chainable
     */
    function trigger(name) {
        var args, list, length, i, event;
        if (!name || !_events[name]) {
            return;
        }
        args = slice.call(arguments, 1);
        list = _events[name];
        length = list.length;
        for (i = 0; i < length; i++) {
            event = list[i];
            event.callback.apply(event.context, args);
        }
    }

    return function() {
        this.on = on;
        this.off = off;
        this.trigger = trigger;
        return this;
    };

}());
