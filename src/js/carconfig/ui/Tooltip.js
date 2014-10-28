EDM.namespace('ui').Tooltip = (function() {

    var View = EDM.ui.View;

    return View.extend({

        className: 'edm-tooltip',

        initialize: function(options) {
            this.render(options.text);
        },

        render: function(text) {
            var arrow = document.createElement('div'),
                textElement = document.createElement('span');

            textElement.innerHTML = text || '';
            arrow.className = 'arrow-left';
            this.el.appendChild(arrow);
            this.el.appendChild(textElement);
        },

        setText: function(text){
            this.el.getElementsByTagName('span')[0].innerHTML = text;
        },

        show: function() {
            this.el.style.display = 'block';
        },

        hide: function() {
            this.el.style.display = 'none';
        }

    });

}());
