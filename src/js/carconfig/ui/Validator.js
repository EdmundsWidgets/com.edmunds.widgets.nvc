EDM.namespace('ui').Validator = (function() {


    var ruleRegex = /^(.+?)\[(.+)\]$/,
        spaceRegex = /^a+|a+$/g,
        numericRegex = /^[0-9]+$/,
        containsNumericRegex = /[0-9]/,
        firstDigitRegex = /^[0-1]/,
        repeatSameDigitRegex = /^(.)\1{6}$/,
        integerRegex = /^[0-9]+$/,
        decimalRegex = /^\-?[0-9]*\.?[0-9]+$/,
        emailRegex = /^([0-9a-zA-Z]([\-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][\-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/,
        emailDomainRegex = /^[A-Za-z0-9](([_\.\-]?[a-zA-Z0-9]+)*)@([A-Za-z0-9]+)(([\.\-]?[a-zA-Z0-9]+)*)\.([A-Za-z]{2,3})$/,
        specialCharactersRegex = /[\*\^<>\\\"\.\;\:\[\]\(\)\{\}\!\@\_]/,
        alphaRegex = /^[a-z]+([\-][a-z]+)*?$/i,
        alphaNumericRegex = /^[a-z0-9]+$/i,
        alphaDashRegex = /^[a-z0-9_\-]+$/i,
        naturalRegex = /^[0-9]+$/i,
        naturalNoZeroRegex = /^[1-9][0-9]*$/i,
        ipRegex = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,
        base64Regex = /[^a-zA-Z0-9\/\+=]/i,
        numericDashRegex = /^[\d\-\s]+$/,
        urlRegex = /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
        repeatSameRegex = /(.)\1{2}/i,
        repeatConsanantRegex = /[bcdfghjklmnpqrstvwxz]{6}/i,
        containsVowelRegex = /^(ng|([a-z\-]*?[a|e|i|o|u|y][a-z\-]*?))$/i,
        contains = EDM.util.Array.contains;

    function Validator(){
    }

    /*
     * Define the regular expressions that will be used
     */


    Validator.prototype = {

        required: function(field) {
            var value = $.trim(field.value);
            return (value !== null && value !== '');
        },
        nameLength: function(field) {
            var value = $.trim(field.value);
            return (value.length >= 2);
        },
        alpha: function(field){
            var value = $.trim(field.value);
            return alphaRegex.test(value);
        },
        noSpecialCharacters: function(field) {
            return !specialCharactersRegex.test(field.value);
        },
        noNumeric: function(field) {
            return !containsNumericRegex.test(field.value);
        },
        decimal: function(field) {
            return (decimalRegex.test(field.value) || !field.value.length);
        },

        excludeCode: function(field){
            var excludeList = [222, 333, 411, 444, 456, 500, 555, 666, 777, 911, 900, 999],
                value = field.value;
            value = parseInt(value, 10);
            return (!contains(excludeList, value) && field.value !== '000');
        },

        excludePrefix: function(field){
            var excludeList = [411, 555, 611, 911],
                value = field.value;
            value = parseInt(value, 10);
            return (!contains(excludeList, value));
        },

        minLength: function(field){
            var value = $.trim(field.value),
                minLength = field.maxLength;
            return (value.length === minLength);
        },

        email: function(field) {
            var value = $.trim(field.value);
            return emailRegex.test(value);
        },

        emailDomain: function(field) {
            var value = $.trim(field.value);
            return emailDomainRegex.test(value);
        },

        maxValue: function(field){
            return (field.value <= 100);
        },

        integer: function(field) {
            return (integerRegex.test($.trim(field.value)));
        },

        noRepeatSame: function(field) {
            var value = $.trim(field.value);
            return !(repeatSameRegex.test(value));
        },

        noRepeatConsanant: function(field) {
            return !(repeatConsanantRegex.test(field.value));
        },

        containsVowel: function(field) {
            var value = $.trim(field.value);
            return containsVowelRegex.test(value);
        },

        firstDigit: function(field) {
            return !firstDigitRegex.test($.trim(field.value));
        },

        phone: function(field) {
            var prefix = $.trim($('[name="phonePrefix"]').val()),
                suffix = $.trim($('[name="phoneSuffix"]').val());
            if(prefix.length === 3 && suffix.length === 4) {
                var lastDigits = prefix + suffix;
                return !(repeatSameDigitRegex.test(lastDigits));
            }
            return true;
        }

    };
    
    return Validator;
}());
