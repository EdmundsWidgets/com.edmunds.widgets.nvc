EDM.namespace('ui').Validator = (function() {


    var ruleRegex = /^(.+?)\[(.+)\]$/,
        spaceRegex = /^a+|a+$/g,
        numericRegex = /^[0-9]+$/,
        integerRegex = /^\-?[0-9]+$/,
        decimalRegex = /^\-?[0-9]*\.?[0-9]+$/,
        emailRegex = /^[a-zA-Z0-9.!#$%&amp;'*+\-\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/,
        alphaRegex = /^[a-z]+$/i,
        alphaNumericRegex = /^[a-z0-9]+$/i,
        alphaDashRegex = /^[a-z0-9_\-]+$/i,
        naturalRegex = /^[0-9]+$/i,
        naturalNoZeroRegex = /^[1-9][0-9]*$/i,
        ipRegex = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,
        base64Regex = /[^a-zA-Z0-9\/\+=]/i,
        numericDashRegex = /^[\d\-\s]+$/,
        urlRegex = /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
        contains = EDM.util.Array.contains;

    function Validator(){
    }

    /*
     * Define the regular expressions that will be used
     */


    Validator.prototype = {

        required: function(field) {
            var value = field.value;
            return (value !== null && value !== '');
        },
        alpha: function(field){
            return (alphaRegex.test(field.value));
        },    

        decimal: function(field) {
            return (decimalRegex.test(field.value) || !field.value.length);
        },

        excludeCode: function(field){
            var excludeList = [222, 333, 411, 444, 456, 500, 555, 666, 777, 911, 900, 999],
                value = field.value;
            value = parseInt(value, 10);
            return (!contains(excludeList, value));
        },

        minLength: function(field){
            var value = field.value,
                minLength = field.maxLength;
            return (value.length === minLength);
        },

        email: function(field) {
            return emailRegex.test(field.value);
        },

        maxValue: function(field){
            return (field.value <= 100);
        },

        integer: function(field) {
            return (integerRegex.test(field.value));
        }

    };
    
    return Validator;
}());
