/**
 * 
 * @class FeesGroup
 * @namespace EDM
 * @example
 *              
 * @constructor
 * @extends EDM.Widget
 */
 EDM.namespace('nvc').FeesGroup = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDMUNDSAPI.Vehicle,
        bind = EDM.util.Function.bind,
        FunctionUtil = EDM.util.Function,
        ArrayUtil = EDM.util.Array,
        template = EDM.template,
        _groopEl,
        _headEl,
        _listEl,
        _footEl,
        _priceEl,
        _listElItems,
        _footBtn,
        _length,
        _price,
        _item;



    function FeesGroup(root, baseId, group, list, category) {
        Observable.call(this);

        this.baseId = baseId;
        this.root = root;
        this.group = group;
        this.list = list;
        this.category = category;

        this.template = template(this.template);
    }

    FeesGroup.prototype = {

        render: function (){
            var templateElement = document.createElement('div');

            // render from template
            templateElement.innerHTML = this.template({
                baseId: this.baseId,
                group: this.group
            });
            templateElement.className = 'option-group';
            this.root.appendChild(templateElement);

            // render elements list
            this.renderList();
            return this;
        },

        renderList: function(){
            var i,
                _length = this.list.length,
                list = this.list,
                priceHtml; 
            // cache elements
            _groopEl    = document.getElementById(this.baseId + '_fees');
            _headEl     = getElementsByClassName('head', '', _groopEl)[0];
            _priceEl    = getElementsByClassName('price', '', _groopEl)[0];
            _listEl     = getElementsByClassName('list', '', _groopEl)[0];
            _footEl     = getElementsByClassName('foot', '', _groopEl)[0];
            _footBtn    = _footEl.getElementsByTagName('button')[0];

            for (i = 0; i < _length; i = i + 1) {
                _price = list[i].price;
                priceHtml = _price < 0 ? '($' + _price.toString().replace(/-/,'') + ')' : '$' + _price;
                _item = document.createElement('label');
                _item.innerHTML = [
                    '<span class="price">' + priceHtml + '</span>',
                    '<input type="checkbox" disabled="disabled" checked value="' + _price + '" name="group_' + this.group + '">',
                    '<span>' + list[i].name + '</span>'
                    ].join('');

                _listEl.appendChild(_item);
            }

            return this;
        },

        init: function(){
            this.bindEvents();
            return this;
        },

        template: [
            '<div class="name"><%= group %></div>',
            '<div class="option emptybg" id="<%= baseId %>_fees">',
                '<div class="list"></div>',
                '<div class="foot"><button type="button" class="button-small" disabled="disabled">OK</button></div>',
            '</div>'
        ].join('')

    };

    return FeesGroup;

}());

$.extend(EDM.nvc.FeesGroup.prototype, EDM.nvc.OptionGroup.prototype);
