/** @constructor */
exports.JSONResponse = function(response) {
    'use strict';

    response.setHeader('Content-Type', 'application/json');

    /**
     * @param {Object} data
     */
    this.success = function(data) {
        response.send({
            status: 'success',
            result: data
        });
    };

    /**
     * @param {String} message
     */
    this.error = function(message) {
        response.send({
            status: 'error',
            message: message
        });
    };

};
