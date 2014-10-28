/** @constructor */
exports.JSONResponse = function(response, type) {
    'use strict';

    var isJSON = type !== 'css';

    /**
     * @param {Object} data
     */
    this.success = function(data) {
        if (isJSON) {
            response.json({
                status: 'success',
                result: data
            });
        } else {
            response.setHeader('Content-Type', 'text/css');
            response.send(data);
        }
    };

    /**
     * @param {String} message
     */
    this.error = function(message) {
        if (isJSON) {
            response.json({
                status: 'error',
                message: message
            });
        } else {
            response.setHeader('Content-Type', 'text/css');
            response.send('');
        }
    };

};
