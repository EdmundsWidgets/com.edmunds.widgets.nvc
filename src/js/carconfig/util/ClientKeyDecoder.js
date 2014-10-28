var ClientKeyDecoder = (function() {

    /*
    protected ClientKey decodeKey(String token) {
        int length = token.length();
        int index = 1;
        int next = 2;
        StringBuilder randomToken = new StringBuilder();
        while (next < length) {
            randomToken.append(token.charAt(index));
            int prev = index;
            index = next;
            next = prev + index;
        }
        return new ClientKey(randomToken.toString(), token.charAt(index));
    }
    */
    function decodeKey(token) {
        var length = token.length,
            index = 1,
            next = 2,
            randomToken = [];
        while (next < length) {
            randomToken.push(token.charAt(index));
            prev = index;
            index = next;
            next = prev + index;
        }
        return new ClientKey(randomToken.join(''), token.charAt(index));
    }

    return {

        /*
        public ClientKey decode(String clientKeyToken) {
            try {
                return decodeKey(clientKeyToken);
            } catch (Exception e) {
                throw new IllegalArgumentException("Client key cannot be decoded.", e);
            }
        }
        */
        decode: function(clientKeyToken) {
            try {
                return decodeKey(clientKeyToken);
            } catch(e) {
                throw new Error('Client key cannot be decoded.');
            }
        }

    };

}());