EDM.namespace('nvc').Select = (function() {

    var Observable = EDM.mixin.Observable,
        Element = EDM.dom.Element;

    function Select(options) {
        var el = document.createElement('select'),
            $el = new Element(el);
        // make observable
        Observable.call(this);
        // store elements
        this.el = el;
        this.$el = $el;
        this.initialize.apply(this, arguments);
        this.bindEvents();
    }

    Select.prototype = {

        defaultText: 'Please select an item',

        noItems: 'Not found items',

        initialize: function(options) {
            // set options
            options = options || {};
            if (options.title) {
                this.el.setAttribute('title', options.title);
            }
            this[options.disabled === true ? 'disable': 'enable']();
            this.defaultText = options.defaultText || this.defaultText;
            this.noItemsText = options.noItemsText || this.noItemsText;
        },

        bindEvents: function() {
            var me = this;
            this.$el.on('change', function(event) {
                var target = event.target || event.srcElement;
                me.trigger('change', target.value);
            });
        },

        render: function(items, optionText) {

            this.empty();

            optionText = optionText || this.defaultText;
            if (optionText) {
                this.add({ id: '', name: optionText });
            }

            var fr, label;

            if (EDM.util.Array.isArray(items)) {
                if (items.length) {
                    fr = this.getOptionsFragment(items);
                } else {
                    this.reset(this.noItemsText);
                }
            } else {
                fr = document.createDocumentFragment();
                for (label in items) {
                    var optgroup = document.createElement('optgroup');
                    optgroup.setAttribute('label', label);
                    optgroup.appendChild(this.getOptionsFragment(items[label]));
                    fr.appendChild(optgroup);
                }
            }

            if (fr) {
                this.el.appendChild(fr);
                this.enable();
            }

            return this;
        },

        getOptionsFragment: function(items) {
            var fragment = document.createDocumentFragment(),
                length = (items = items || []).length,
                i = 0,
                item, option;
            for ( ; i < length; i++) {
                item = items[i];
                option = document.createElement('option');
                option.setAttribute('value', item.id);
                option.innerHTML = item.name;
                fragment.appendChild(option);
            }
            return fragment;
        },

        add: function(item) {
            var option = document.createElement('option');
            item = item || {};
            option.setAttribute('value', item.id || '');
            option.innerHTML = item.name || item.id || '';
            this.el.appendChild(option);
            return this;
        },

        empty: function() {
            this.el.innerHTML = '';
            return this;
        },

        reset: function(optionText) {
            this.empty();
            this.disable();
            optionText = optionText || this.defaultText;
            if (optionText) {
                this.add({ id: '', name: optionText });
            }
            this.trigger('reset');
            return this;
        },

        enable: function() {
            this.el.removeAttribute('disabled');
            return this;
        },

        disable: function() {
            this.el.setAttribute('disabled', 'disabled');
            return this;
        }

    };

    return Select;

}());
