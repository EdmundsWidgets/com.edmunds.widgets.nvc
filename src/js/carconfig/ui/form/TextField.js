EDM.namespace('ui').TextField = (function() {

    var // dependencies
        View = EDM.ui.View,
        Tooltip = EDM.ui.Tooltip,
        RegionApi = EDM.api.Region,
        KeyCode = EDM.event.KeyCode,
        contains = EDM.util.Array.contains,
        Element = EDM.dom.Element,
        validator = new EDM.ui.Validator();

    return View.extend({

        tagName: 'input',

        className: '',

        attributes: {
            type: 'text'
        },

        events: {
            //focus: 'validate',
            focus: 'hideLabel',
            blur: 'showLabel',
            change: 'validate',
            keyup: 'validate'
        },

        initialize: function(options) {
            if (options.validators) {
                this.validators = options.validators;
            }
            //this.on('focus', this.hideLabel, this);
        },

        render: function(root) {
            var el = this.el,
                label,
                labelText,
                requiredElement;

            label = document.createElement('label');
            label.className = el.name;
            labelText = document.createElement('span');
            labelText.className = 'text-label';
            labelText.innerHTML = el.alt;

            root.appendChild(label);
            label.appendChild(labelText);

            if (el.maxLength > 4) {
                requiredElement = document.createElement('span');
                requiredElement.innerHTML = '*';
                labelText.innerHTML = el.title;
                labelText.appendChild(requiredElement);
            }

            label.appendChild(el);
            this.renderTooltip();
            return this;
        },

        renderTooltip: function(){
            var tooltip = this.tooltip = new Tooltip({
                className: 'nvcwidget-tooltip',
                text: ''
            });

            if (this.el.parentNode) {
                this.el.parentNode.insertBefore(this.tooltip.el, this.el.nextSibling);
            }
            tooltip.hide();
            this.on('valid', tooltip.hide, tooltip);
            this.on('error', tooltip.show, tooltip);
            return this;
        },

        showLabel: function(){
            var el = this.el;
            if (!el.value && getElementsByClassName('text-label', '', el.parentNode)[0]){
                getElementsByClassName('text-label', '', el.parentNode)[0].style.display = 'block';
            }
            this.tooltip.hide();
        },

        hideLabel: function(){
            if (getElementsByClassName('text-label', '', this.el.parentNode)[0]) {
                getElementsByClassName('text-label', '', this.el.parentNode)[0].style.display = 'none';
            }
        },

        reset: function() {
            var $parentEl = new Element(this.el.parentNode);
            $parentEl.removeClass('invalid');
            this.el.value = '';
            this.showLabel();
        },

        // TODO validator
        validate: function() {
            var rules = this.validators, opt,
                el = this.el,
                $parentEl = new Element(el.parentNode),
                isValid;

            this.trigger('focus');

            for (opt in rules){

                isValid = validator[opt](el);

                if (!isValid) {
                    this.tooltip.setText(rules[opt].message.replace('%s', el.title));
                    $parentEl.addClass('invalid');
                    this.trigger('error');
                    this.trigger('change', {
                        isValid: isValid,
                        fieldName: el.name,
                        fieldValue: el.value
                    });
                    return;
                }

                $parentEl.removeClass('invalid');
                this.trigger('valid');
            }
            this.trigger('change', {
                isValid: isValid,
                fieldName: el.name,
                fieldValue: el.value
            });
        },

        validateField: function() {
            var rules = this.validators, opt,
                el = this.el,
                $parentEl = new Element(el.parentNode),
                isValid;

            for (opt in rules){

                isValid = validator[opt](el);

                if (!isValid) {
                    $parentEl.addClass('invalid');
                    return {
                        isValid: isValid,
                        fieldName: el.name,
                        fieldValue: el.value
                    };
                }

                $parentEl.removeClass('invalid');
            }

            return {
                isValid: isValid,
                fieldName: el.name,
                fieldValue: el.value
            };
        }

    });

}());
