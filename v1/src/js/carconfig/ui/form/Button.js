EDM.namespace('ui').Button = (function() {

    var // dependencies
        View = EDM.ui.View;

    return View.extend({

        tagName: 'button',

        events: {
            'click': 'onClick'
        },

        onClick: function() {
            this.trigger('click');
        },

        setText: function(text) {
            this.el.innerHTML = text;
            return this;
        },

        disable: function() {
            this.el.setAttribute('disabled', 'disabled');
            return this;
        },

        enable: function() {
            this.el.removeAttribute('disabled');
            return this;
        }

    });

}());
