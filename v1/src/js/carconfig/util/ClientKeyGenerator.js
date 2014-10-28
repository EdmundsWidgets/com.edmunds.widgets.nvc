EDM.namespace('util').ClientKeyGenerator = (function() {

    var math = Math;

    function randomNumber(from, to) {
        return math.floor(math.random() * (to - from + 1) + from);
    }

    function randomCharacters(length, radix) {
        var str = [],
            i = 0,
            c;
        for ( ; i < length; i++) {
            c = randomNumber(0, radix - 1);
            str[i] = c.toString(radix);
        }
        return str;
    }

    function generateKey(length, radix) {
        var tokenChars = randomCharacters(length, radix),
            sum = 0,
            i = 0,
            index = 1,
            next = 2,
            prev;
        while (next < length) {
            sum += parseInt(tokenChars[index], radix) ^ ++i;
            prev = index;
            index = next;
            next = prev + index;
        }
        tokenChars[index] = (sum % radix).toString(radix);
        return tokenChars.join('');
    }

    return {

        generate: generateKey

    };

}());
