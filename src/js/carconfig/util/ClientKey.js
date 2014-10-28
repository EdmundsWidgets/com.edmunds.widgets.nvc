/**
 * An object of this class holds the decoded representation of the Client-Key.
 *
 * @class ClientKey
 * @namespace EDM
 *
 * @constructor
 * @param {String} randomToken
 * @param {String} checkSymbol
 */
var ClientKey = function(randomToken, checkSymbol) {

    var
        /**
         * The concatenation of valuable symbols of the Client-Key.
         * @property _randomToken
         * @private
         * @type {String}
         */
        _randomToken = randomToken,

        /**
         * The check symbol of the Client-Key.
         * @property _checkSymbol
         * @private
         * @type {String}
         */
        _checkSymbol = checkSymbol;

    /**
     * @method getRandomToken
     * @return {String}
     */
    this.getRandomToken = function() {
        return _randomToken;
    };

    /**
     * @method getCheckSymbol
     * @return {String}
     */
    this.getCheckSymbol = function() {
        return _checkSymbol;
    };

};
