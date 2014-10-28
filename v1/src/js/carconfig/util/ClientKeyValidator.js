var ClientKeyValidator = (function() {

    var
        // private static final int TOKEN_RADIX = 36;
        TOKEN_RADIX = 36,
        // private static final String CLIENT_KEY_PATTERN = "[0-9a-zA-Z]{16}";
        CLIENT_KEY_PATTERN = /[0-9a-zA-Z]{16}/;

    /*
    protected Result validateCheckSymbols(ClientKey clientKey) {
        int checkSum = calculateCheckSum(clientKey.getRandomToken());
        if (validateCheckSymbol(checkSum, clientKey.getCheckSymbol())) {
            return Result.VALID;
        }
        return Result.NOT_VALID;
    }
    */
    function validateCheckSymbols(clientKey) {
        var checkSum = calculateCheckSum(clientKey.getRandomToken());
        if (validateCheckSymbol(checkSum, clientKey.getCheckSymbol())) {
            return true;
        }
        return false;
    }

    /*
    private int calculateCheckSum(String randomToken) {
        int checkSum = 0;
        for (int i = 0; i < randomToken.length(); i++) {
            int value = Character.digit(randomToken.charAt(i), TOKEN_RADIX);
            checkSum += value ^ (i + 1);
        }
        return checkSum;
    }
    */
    function calculateCheckSum(randomToken) {
        var checkSum = 0,
            i = 0,
            length = randomToken.length,
            value;
        for ( ; i < length; i++) {
            value = parseInt(randomToken.charAt(i), TOKEN_RADIX);
            checkSum += value ^ (i + 1);
        }
        return checkSum;
    }

    /*
    private boolean validateCheckSymbol(int checkSum, char checkSymbol) {
        return (checkSum % TOKEN_RADIX) == Character.digit(checkSymbol, TOKEN_RADIX);
    }
    */
    function validateCheckSymbol(checkSum, checkSymbol) {
        return (checkSum % TOKEN_RADIX) == parseInt(checkSymbol, TOKEN_RADIX);
    }

    /*
    public Result validate(String clientKeyToken) {
        if(StringUtils.isEmpty(clientKeyToken)) {
            return Result.EMPTY;
        }

        if(!clientKeyToken.matches(CLIENT_KEY_PATTERN)) {
            return Result.BAD_FORMED;
        }

        ClientKey clientKey = clientKeyDecoder.decode(clientKeyToken);

        bufferModificationLock.lock();

        Result result = null;
        if(randomKeyBuffer.contains(clientKey.getRandomToken())) {
            result = Result.DUPLICATE;
        } else {
            result = validateCheckSymbols(clientKey);
            if(result == Result.VALID) {
                randomKeyBuffer.add(clientKey.getRandomToken());
            }
        }

        bufferModificationLock.unlock();

        return result;
    }
    */

    function validate(clientKeyToken) {
        var clientKey;
        // not string
        if (typeof clientKeyToken !== 'string') {
            return false;
        }
        // empty
        if (clientKeyToken.length === 0) {
            return false;
        }
        // has invalid characters
        if (!CLIENT_KEY_PATTERN.test(clientKeyToken)) {
            return false;
        }
        clientKey = ClientKeyDecoder.decode(clientKeyToken);
        return validateCheckSymbols(clientKey);
    }

    return {

        calculateCheckSum: calculateCheckSum,

        validateCheckSymbols: validateCheckSymbols,

        validateCheckSymbol: validateCheckSymbol,

        validate: validate

    };

}());