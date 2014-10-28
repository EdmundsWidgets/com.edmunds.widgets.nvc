/**
 * 
 * @class CheckboxGroup
 * @namespace EDM
 * @example
 *              
 * @constructor
 * @extends EDM.Widget
 */
 EDM.namespace('nvc').CheckboxGroup = (function() {

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
        _contentId,
        _length,
        _price,
        _item;



    function CheckboxGroup(root, baseId, group, list, category) {
        Observable.call(this);

        this.baseId = baseId;
        this.root = root;
        this.group = group;
        this.list = list;
        this.category = category;

        this.template = template(this.template);
    }

    CheckboxGroup.prototype = {

        render: function (){
            var content = document.createElement('div');
            _contentId = this.baseId + '_options_' + this.group;

            // render from template
            content.className = 'option';
            content.id = _contentId;
            content.innerHTML = this.template({
                baseId: this.baseId,
                group: this.group
            });
            this.root.appendChild(content);

            // render from template
            this.renderList();
            return this;
        },

        renderList: function(){
            var i,
                _length = this.list.length,
                list = this.list,
                priceHtml; 
            // cache elements
            _groopEl    = document.getElementById(_contentId);
            _headEl     = getElementsByClassName('head', '', _groopEl)[0];
            _priceEl    = getElementsByClassName('price', '', _groopEl)[0];
            _listEl     = getElementsByClassName('list', '', _groopEl)[0];
            _footEl     = getElementsByClassName('foot', '', _groopEl)[0];
            _footBtn    = _footEl.getElementsByTagName('button')[0];

            for (i = 0; i < _length; i = i + 1) {
                _price = list[i].price;
                if (list[i].price === 0) {
                    _price = 0;
                } else {
                    _price = list[i].price.baseMSRP;
                }
                priceHtml = _price < 0 ? '($' + _price.toString().replace(/-/,'') + ')' : '$' + _price;
                _item = document.createElement('label');
                _item.innerHTML = '<span class="price">' + priceHtml + '</span><input type="checkbox" data-id="' + list[i].id + '" id="for' + list[i].id + '" value="' + _price + '" name="group_options_' + this.group + '"><span class="value">' + list[i].name + '</span>';
                _listEl.appendChild(_item);
                _item.setAttribute('for', 'for' + list[i].id);
            }

            return this;
        },

        init: function(){
            var me = this, i,
                list = this.list,
                _length = this.list.length;

            _listElItems = _groopEl.getElementsByTagName('input');

            _headEl.onclick = function() {
                me.collapsible(this.parentNode);
            };
            _footBtn.onclick = function(parent) {
                return function() {
                    me.collapsible(parent);
                };
            }(_headEl.parentNode);

            for (i = 0; i < _length; i = i + 1) {
                this.bindOnChangeEvent(_listElItems[i], list[i], _headEl, _footBtn);
            }

            this.bindEvents();
            return this;
        },

        template: [
            '<div class="head"><span class="price">$0</span><span class="value"><%= group %></span></div>',
            '<div class="option-wrap">',
                '<div class="list"></div>',
                '<div class="foot"><button type="button" class="button-small button-light">OK</button></div>',
            '</div>'
        ].join('')

    };

    return CheckboxGroup;

}());

$.extend(EDM.nvc.CheckboxGroup.prototype, EDM.nvc.OptionGroup.prototype);
