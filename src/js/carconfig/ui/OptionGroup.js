/**
 *
 * @class OptionGroup
 * @namespace EDM
 * @example
 *
 * @constructor
 * @extends EDM.Widget
 */
EDM.namespace('nvc').OptionGroup = (function() {


    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDMUNDSAPI.Vehicle,
        Element = EDM.dom.Element,
        bind = EDM.util.Function.bind;

    function OptionGroup() {
        Observable.call(this);
    }

    OptionGroup.prototype = {

        initialize: function() {},

        disableButton: function(button){
            button.disabled = true;
            return this;
        },

        enableButton: function(button){
            button.disabled = false;
            return this;
        },

        expand: function(groop){
            var optionsEl = getElementsByClassName('option', '', document), i,
                $groop = new Element(groop),
                $optionsEl;

            for (i = optionsEl.length - 1; i >= 0; i = i - 1) {
                if (optionsEl[i].className.indexOf('emptybg') === -1){
                    $optionsEl = new Element(optionsEl[i]),
                    $optionsEl.removeClass('active');
                }
            }
            $groop.addClass('active');
            new Element(groop.parentNode).addClass('active');
            this.trigger('expand');
            return this;
        },

        collapse: function(groop){
            var $groop = new Element(groop);
            $groop.removeClass('active');
            new Element(groop.parentNode).removeClass('active');
            this.trigger('collapse');
            return this;
        },

        collapsible: function(group) {
            var isShow = group.className.indexOf('active') > -1 ? true : false;
            this[isShow ? 'collapse' : 'expand'](group);
            return this;
        },

        bindOnChangeEvent: function(element, elementOptions, parentHead, footBtn) {
            var me = this;
            element[isIE ? 'onclick' : 'onchange'] = function(event) {
                me.trigger('change', {
                    element: this,
                    options: elementOptions,
                    head: parentHead,
                    footBtn: footBtn
                });
            };
            return this;
        },

        bindEvents: function() {
            //this.on('change', this.calculatePrice, this);
            this.on('calculate', this.calculatePrice, this);
            this.on('change-color', this.changeColor, this);
            return this;
        },

        calculatePrice: function(options){
            var opts = options.options[0] ? options.options[0] : options.options,
                type = opts.type,
                price = parseInt(options.element.value, 10),
                isChecked = options.element.checked,
                headElement = options.head,
                sum = getElementsByClassName('price', '', headElement)[0].innerHTML.replace(/\$/,''),
                priceElement = getElementsByClassName('price', '', headElement)[0],
                valueElement = getElementsByClassName('value', '', headElement)[0],
                picElement = getElementsByClassName('pic', '', headElement)[0],
                picSecondElement = getElementsByClassName('secondary', '', headElement)[0],
                groupList = headElement.parentNode.getElementsByTagName('input'),
                groupListLength = groupList.length, i;

            if (opts.category === 'colors') {
                this.makeDeselectedAll(groupList);
                if (isChecked){
                    priceElement.innerHTML = price < 0 ? '($' + price.toString().replace(/-/,'') + ')' : '$' + price;
                    valueElement.innerHTML = opts.name;
                    picElement.style.background = options.element.getAttribute('data-primarycolor');
                    picSecondElement.style.background = options.element.getAttribute('data-secondarycolor');
                    this.makeSelected(options.element);
                } else {
                    priceElement.innerHTML = '$0';
                    valueElement.innerHTML = 'Select a Color';
                    picElement.removeAttribute('style');
                    picElement.setAttribute('style', '');
                    picElement.className = 'pic default';
                    picSecondElement.removeAttribute('style');
                    picSecondElement.setAttribute('style', '');
                    this.makeDeselected(options.element);
                }
            }
            if (opts.category === 'options') {
                sum = sum.indexOf('(') === -1 ? parseInt(sum, 10) : - parseInt(sum.replace(/\(|\)/g,''), 10);
                sum = isChecked ? sum + price : sum - price;
                priceElement.innerHTML = sum < 0 ? '($' + sum.toString().replace(/-/,'') + ')' : '$' + sum;
            }
            return this;
        },

        changeColor: function(options){
            var opts = options.options[0] ? options.options[0] : options.options,
                type = opts.type,
                isChecked = options.element.checked,
                headElement = options.head,

                priceElement = getElementsByClassName('price', '', headElement)[0],
                valueElement = getElementsByClassName('value', '', headElement)[0],
                picElement = getElementsByClassName('pic', '', headElement)[0],
                picSecondElement = getElementsByClassName('secondary', '', headElement)[0],

                groupList = headElement.parentNode.getElementsByTagName('input'),
                groupListLength = groupList.length, i;

            if (opts.category === 'colors') {
                this.makeDeselectedAll(groupList);
                if (isChecked){
                    priceElement.innerHTML = '$0';
                    valueElement.innerHTML = opts.name;
                    picElement.style.background = options.element.getAttribute('data-primarycolor');
                    picSecondElement.style.background = options.element.getAttribute('data-secondarycolor');
                    this.makeSelected(options.element);
                } else {
                    priceElement.innerHTML = '$0';
                    valueElement.innerHTML = 'Select a Color';
                    picElement.removeAttribute('style');
                    picElement.className = 'pic default';
                    picSecondElement.removeAttribute('style');
                    this.makeDeselected(options.element);
                }
            }

            return this;
        },

        makeSelected: function(element){
            element.checked = true;
            new Element(element.parentNode.parentNode).addClass('selected');
        },

        makeDeselected: function(element){
            element.checked = false;
            new Element(element.parentNode.parentNode).removeClass('selected');
        },

        makeDeselectedAll: function(listElement){
            var i, length = listElement.length;
            for (i = 0; i < length; i = i + 1) {
                this.makeDeselected(listElement[i]);
            }
        }
    };

    return OptionGroup;

}());