EDM.namespace('nvc').Select = Backbone.View.extend({

    tagName: 'select',

    defaultText: 'Please select an item',

    noItems: 'Not found items',

    events: {
        'change': 'onChange'
    },

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

    onChange: function() {
        var el = this.el;
        this.trigger('change', el.value, el.options[el.selectedIndex].innerHTML);
    },

    render: function(items, optionText) {

        this.empty();

        optionText = optionText || this.defaultText;
        if (optionText) {
            this.add({ id: '', name: optionText });
        }

        var fr, label;

        if (_.isArray(items)) {
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

});
