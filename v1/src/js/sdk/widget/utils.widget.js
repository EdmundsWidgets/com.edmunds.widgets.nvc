    // Utils
    /**
    * This module contains classes for running a store.
    * @class util
    * @example
    *
    * @namespace EDM
    */
    (function() {
        var util = EDM.Util = {},
            // prototypes
            arrayProto = Array.prototype,
            functionProto = Function.prototype,
            objectProto = Object.prototype,
            // shortcuts
            hasOwnProp = objectProto.hasOwnProperty,
            nativeBind = functionProto.bind,
            nativeIsArray = Array.isArray,
            nativeIndexOf = arrayProto.indexOf,
            slice = arrayProto.slice,
            toString = objectProto.toString;

        /**
         * Bind a function to an object.
         * @method bind
         * @param {Function} fn
         * @param {Object} obj
         * @return {Function}
         * @example
         *      var obj = {},           // Some object
         *          fn = function(){    // Some function
         *              return this;
         *          };
         *      EDM.Util.bind(fn, obj);
         */
        util.bind = function(fn, obj) {
            if (fn.bind === nativeBind && nativeBind) {
                return nativeBind.apply(fn, slice.call(arguments, 1));
            }
            return function() {
                return fn.apply(obj, slice.call(arguments));
            };
        };

        /**
         * Returns true if the value is present in the list.
         * @method contains
         * @param {Array} list
         * @param {Object} key
         * @return {Boolean}
         * @example
         *      var array = [96, 97, 98, 99, 100, 101, 102, 103, 104, 105], // Array
         *          key = 100;                                              // Numder or string
         *      EDM.Util.contains(array, key); // => true
         */
        util.contains = function(list, key) {
            var i, length;
            if (!util.isArray(list)) {
                return false;
            }
            if (nativeIndexOf && list.indexOf) {
                return list.indexOf(key) !== -1;
            }
            for (i = 0, length = list.length; i < length; i++) {
                if (list[i] === key) {
                    return true;
                }
            }
            return false;
        };

        /**
         * Copy all of the properties in the source objects over to the destination object.
         * @method extend
         * @param {Object} destination
         * @param {Object} source
         * @return {Object}
         * @example
         *      EDM.Util.extend(object1, object2);
         */
        util.extend = function(obj) {
            var args = slice.call(arguments, 1),
                length = args.length,
                i, source, prop;
            for (i = 0; i < length; i++) {
                source = args[i];
                for (prop in source) {
                    if (hasOwnProp.call(source, prop)) {
                        obj[prop] = source[prop];
                    }
                }
            }
            return obj;
        };

        /**
         * Returns true if object is an Array.
         * @method isArray
         * @param {Object} obj
         * @return {Boolean}
         * @example
         *      EDM.Util.isArray([1990, 1999, 1996, 2010]); // => true
         */
        util.isArray = nativeIsArray || function(obj) {
            return toString.call(obj) === '[object Array]';
        };

        util.isEmpty = function(source) {
            var prop;
            for (prop in source) {
                if (hasOwnProp.call(source, prop)) {
                    return false;
                }
            }
            return true;
        };

        /**
         * Renders options to HTMLSelectElement.
         * @method renderSelectOptions
         * @param {HTMLSelectElement} element
         * @param {Object} records
         * @param {Boolean} hasOptGroups
         * @return {HTMLSelectElement}
         * @example
         *      // for example element can be {HTMLSelectElement}
         *      EDM.Util.renderSelectOptions(element, {}, 'Select a Make');
         */
        util.renderSelectOptions = function(element, records, defaultText, hasOptGroups) {
            var fragment = document.createDocumentFragment(),
                key, optgroup, options, option;
            // clear inner html
            if (element.innerHTML) {
                element.innerHTML = '';
            }
            // add default option
            if (defaultText) {
                option = document.createElement('option');
                option.innerHTML = defaultText;
                option.setAttribute('value', '');
                element.appendChild(option);
            }
            // render option groups
            if (hasOptGroups === true) {
                for (key in records) {
                    optgroup = document.createElement('optgroup');
                    optgroup.setAttribute('label', key);
                    options = util.renderSelectOptions(optgroup, records[key]);
                    fragment.appendChild(optgroup);
                }
                element.appendChild(fragment);
                return element;
            }
            // render options
            for (key in records) {
                option = document.createElement('option');
                option.setAttribute('value', key);
                option.innerHTML = records[key];
                fragment.appendChild(option);
            }
            element.appendChild(fragment);
            return element;
        };

        /**
         * Finds and replaces all variables in template.
         * @method renderTemplate
         * @example
         *      EDM.Util.renderTemplate('<div><%= text %></div>', { text: 'test' }); // => <div>test</div>
         * @param {String} template
         * @param {Object} options
         * @return {String}
         */
        util.renderTemplate = function(text, options, useBraces) {
            var replacementsReg = useBraces ? /\{\{\s+\w+\s+\}\}/gi : /<%=\s+\w+\s+%>/gi,
                variableReg = useBraces ? /\{\{\s+|\s+\}\}/gi : /^<%=\s+|\s+%>$/gi,
                replacements, replacement, i, length, variableName;

            if (typeof text !== 'string') {
                throw new Error('template must be a string');
            }

            if (text.length === 0 || !options) {
                return text;
            }

            options = options || {};

            replacements = text.match(replacementsReg);
            length = replacements !== null ? replacements.length : 0;

            if (length === 0) {
                return text;
            }

            for (i = 0; i < length; i++) {
                replacement = replacements[i];
                variableName = replacement.replace(variableReg, '');
                text = text.replace(replacement, options[variableName]);
            }

            return text;
        };

    }());
