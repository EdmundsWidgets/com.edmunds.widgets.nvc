EDM.namespace('nvc').MessageDialog = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        template = EDM.template;

    function MessageDialog() {
        Observable.call(this);
        this.el = document.createElement('div');
        this.el.className = 'nvcwidget-overlay';
        this.template = template(this.template);
    }

    MessageDialog.prototype = {

        render: function(options) {
            options = options || {};
            if (!options.text) {
                options.text = [
                    '<p>Something went wrong when sending your form!</p>',
                    '<p>Please return to the form and try again or <a href="Mailto:api@edmunds.com">contact</a> us directly.</p>'
                ].join('');
            }
            this.el.innerHTML = '';
            this.isSuccess = options.isSuccess;
            this.message = document.createElement('div');
            this.message.className = 'nvcwidget-message';
            this.message.innerHTML = this.template({ options: options });
            this.message.className += options.isSuccess ? " success-message" : " failure-message";
            this.el.appendChild(this.message);

            return this;
        },

        setMargin: function() {
            var height = this.message.offsetHeight;
            this.message.style.marginTop = (-height/2) + 'px';
        },

        init: function() {
            var button = this.el.getElementsByTagName('button')[0];

            this.setMargin();
            button.onclick = function(me) {
                return function() {
                    if(me.isSuccess === true) {
                        me.trigger('reset');
                    }
                    me.el.parentNode.removeChild(me.el);
                };
            }(this);
        },

        template: [
            '<% if (options.isSuccess === true) { %>',
                '<div class="message-header">Thank you!</div>',
                '<div class="message-body">',
                    '<p>We have sent your request for a price quote on the</p>',
                    '<p class="name"><%= options.name%></p>',
                    '<p>to the following dealer(s)</p>',
                    '<ul>',
                        '<% for (var i = 0, length = options.dealers.length; i < length; i++) { %>',
                            '<li><%= options.dealers[i]%></li>',
                        '<% } %>',
                    '</ul>',
                '</div>',
                '<div class="message-bottom">',
                    '<button type="reset" id="continue_button">Configure another vehicle</button>',
                '</div>',
            '<% } else { %>',
                '<div class="message-header">Oh no...</div>',
                '<div class="message-body">',
                    '<%= options.text %>',
                    //'<p>Something went wrong when sending your form!</p>',
                    //'<p>Please return to the form and try again or <a href="Mailto:api@edmunds.com">contact</a> us directly.</p>',
                '</div>',
                '<div class="message-bottom">',
                    '<button type="button">Return and try again</button>',
                '</div>',
            '<% } %>'
        ].join('')

    };

    return MessageDialog;

}());