(function(global) {

    var EDM = global.EDM = {},
        slice = Array.prototype.slice,
        hasOwnProp = Object.prototype.hasOwnProperty;

    /**
     * Defines namespace
     *
     * Example:
     *     EDM.namespace('util');
     *     EDM.util.Test = function() {};
     *     EDM.namespace('very.long.namespace').Test = function() {};
     *
     * @param {String} The namespace string
     * @return {Object}
     */
    EDM.namespace = function(namespace) {
        var parts = namespace.split('.'),
            length = parts.length,
            parent = EDM,
            i, part;
        for (i = 0; i < length; i++) {
            part = parts[i];
            if (typeof parent[part] === 'undefined') {
                parent[part] = {};
            }
            parent = parent[part];
        }
        return parent;
    };

    /**
     * Extend a given object with all the properties in passed-in object(s).
     * @param {Object} target The target object to extend
     * @param {Object} [obj*]
     * @return {Object}
     */
    EDM.extend = function extend(target) {
        var args = slice.call(arguments, 1),
            length = args.length,
            i = 0,
            source, property;
        for ( ; i < length; i++) {
            source = args[i];
            if (source) {
                for (property in source) {
                    if (hasOwnProp.call(source, property)) {
                        target[property] = source[property];
                    }
                }
            }
        }
        return target;
    };

}(this));

/**
 * Core functionality for the Edmunds API JavaScript SDK
 *
 * @class EDMUNDSAPI
 */
EDM.API = function(key) {

    /**
     * Assigned API Key. Register for an API Key <a href="http://developer.edmunds.com/apps/register">here</a>
     *
     * @config _api_key
     * @private
     * @type string
     */
    var _api_key = key;
    /**
     * The API version
     *
     * @config _api_version
     * @private
     * @type string
     */
    var _api_version = "v1";
    /**
     * The base URL for the API
     *
     * @property _base_url
     * @private
     * @type string
     */
    var _base_url = "http://api.edmunds.com/";
    /**
     * The API response format
     *
     * @property _response_format
     * @private
     * @type string
     */
    var _response_format = 'json';
    /**
     * The document HEAD element
     *
     * @property _head
     * @private
     * @type DOMElement
     */
    var _head = document.getElementsByTagName('head')[0];

    /**
     * The base URL for the API
     *
     * @method _serializeParams
     * @private
     * @param object JSON object of parameters and their values
     * @return {string} Serialized parameters in the form of a query string
     */
    function _serializeParams(params) {
        var str = '';
        for(var key in params) {
            if(params.hasOwnProperty(key)) {
                if (str !== '') str += "&";
                str += key + "=" + params[key];
            }
        }
        return str;
    }

    /**
     * The base URL for the API
     *
     * @method getBaseUrl
     * @param void
     * @return {string} API URL stub
     */
    this.getBaseUrl = function() {
        return _base_url + _api_version;
    };
    /**
     * The base URL for the API
     *
     * @method getVersion
     * @param void
     * @return {string} API version
     */
    this.getVersion = function() {
        return _api_version;
    };
    /**
     * The base URL for the API
     *
     * @method setVersion
     * @param void
     * @return {string} API version
     */
    this.setVersion = function(version) {
        _api_version = version;
        return _api_version;
    };
    /**
     * Make the API REST call
     *
     * @method invoke
     * @param string method The API method to be invoked
     * @param object params JSON object of method parameters and their values
     * @param function callback The JavaScript function to be invoked when the results are returned (JSONP implementation)
     * @return {string} API REST call URL
     */
    this.invoke = function(method, params, successCallback, errorCallback) {
        var queryString = _serializeParams(params),
            baseUrl = this.getBaseUrl();
        queryString = (queryString) ? '?' + queryString + '&api_key=' + _api_key + "&fmt=" + _response_format : '?api_key=' + _api_key + "&fmt=" + _response_format;
        return EDM.jsonp({
            url: baseUrl + method + queryString,
            timeout: 7000,
            success: successCallback,
            error: errorCallback
        });
    };

};

/**
 * @constructor
 * @class Dealer
 * @namespace EDM.api
 * @extends EDM.API
 */
EDM.namespace('api').Dealer = (function() {

    var EDMAPI = EDM.API,
        proto;

    function Dealer(key) {
        EDMAPI.apply(this, arguments);
    }

    proto = Dealer.prototype = new EDMAPI();

    return Dealer;

}());

/**
 * @constructor
 * @class Region
 * @namespace EDM.api
 * @extends EDM.API
 */
EDM.namespace('api').Region = (function() {

    var EDMAPI = EDM.API,
        proto;

    function Region(key) {
        EDMAPI.apply(this, arguments);
    }

    proto = Region.prototype = new EDMAPI();

    /**
    * Get a valid of zip code
    *
    * @method getValidZip
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getValidZip = function(zip, successCallback, errorCallback) {
        return this.invoke('/api/region/zip/validation/' + zip, {}, successCallback, errorCallback);
    };

    return Region;

}());

/**
 * Vehice Data and Repositories
 *
 * @constructor
 * @class Vehicle
 * @namespace EDM.api
 * @extends EDM.API
 */
EDM.namespace('api').Vehicle = (function() {

    var EDMAPI = EDM.API,
        proto;

    function Vehicle(key) {
        EDMAPI.apply(this, arguments);
    }

    proto = Vehicle.prototype = new EDMAPI();

    //========================================================= GENERICS
    /**
    * Get a list of available makes in this particular year
    *
    * @method getListOfMakes
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getListOfMakes = function(publicationState, successCallback, errorCallback) {
        return this.invoke('/api/vehicle-directory-ajax/findmakes', {
            ps: publicationState || 'all'
        }, successCallback, errorCallback);
    };

    /**
    * Get a list of available models of a particular make in this particular year
    *
    * @method getListOfModelsByMake
    * @param string make The vehicle make (use niceName value)
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getListOfModelsByMake = function(make, successCallback, errorCallback) {
        return this.invoke('/api/vehicle-directory-ajax/findmakemodels', {"make": make}, successCallback, errorCallback);
    };

    /**
    * Get a list of available vehicle types (will return an array)
    *
    * @method getListOfTypes
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getListOfTypes = function(successCallback, errorCallback) {
        return this.invoke('/api/vehicle/stylerepository/findallvehicletypes', {}, successCallback, errorCallback);
    };

    /**
    * Get a the details on a particular vehicle
    *
    * @method getVehicle
    * @param string make The vehicle make (use niceName value)
    * @param string model The vehicle model (use niceName value)
    * @param int year The year of the make/model
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getVehicle = function(make, model, year, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelyearrepository/foryearmakemodel', {"make":make, "model":model, "year":year}, successCallback, errorCallback);
        //return this.invoke('/api/vehicle/'+make+'/'+model+'/'+year, {}, successCallback, errorCallback);
    };

    /**
    * Get a the photo on a particular vehicle
    *
    * @method getVehiclePhoto
    * @param string make The vehicle make (use niceName value)
    * @param string model The vehicle model (use niceName value)
    * @param int year The year of the make/model
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getVehiclePhoto = function(make, model, year, style, successCallback, errorCallback) {
        return this.invoke('/api/vehiclephoto/service/findphotobystyleid', {"make":make, "model":model, "year":year, "style":style}, successCallback, errorCallback);
        //return this.invoke('/api/vehicle/'+make+'/'+model+'/'+year, {}, successCallback, errorCallback);
    };

    /**
    * Get a the configuration on a particular vehicle
    *
    * @method getVehicleConfig
    * @param string make The vehicle make (use niceName value)
    * @param string model The vehicle model (use niceName value)
    * @param int year The year of the make/model
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getVehicleConfig = function(make, model, year, style, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/styleconfig/', {"make":make, "model":model, "year":year, "style":style}, successCallback, errorCallback);
        //return this.invoke('/api/vehicle/'+make+'/'+model+'/'+year, {}, successCallback, errorCallback);
    };

    //========================================================= Make Repository Calls
    /**
    * Get a list of all makes in our databases
    *
    * @method getMakes
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getMakes = function(successCallback, errorCallback) {
        return this.invoke('/api/vehicle/makerepository/findall', {}, successCallback, errorCallback);
    };
    /**
    * Get a list of available makes in this particular year
    *
    * @method getMakesByYear
    * @param int year The year of the make
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getMakesByYear = function(year, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/makerepository/findmakesbymodelyear', {"year": year}, successCallback, errorCallback);
    };
    /**
    * Get a list of available makes in this particular year
    *
    * @method getMakesByState
    * @param string state The state of the make (new|used|future)
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getMakesByState = function(state, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/makerepository/findmakesbypublicationstate', {"state": state}, successCallback, errorCallback);
    };
    /**
    * Get a list of new makes only
    *
    * @method getNewMakes
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getNewMakes = function(successCallback, errorCallback) {
        return this.invoke('/api/vehicle/makerepository/findnewmakes', {}, successCallback, errorCallback);
    };

    /**
    * Get a list of used makes only
    *
    * @method getUsedMakes
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getUsedMakes = function(successCallback, errorCallback) {
        return this.invoke('/api/vehicle/makerepository/findusedmakes', {}, successCallback, errorCallback);
    };

    /**
    * Get a list of all future makes
    *
    * @method getFutureMakes
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getFutureMakes = function(successCallback, errorCallback) {
        return this.invoke('/api/vehicle/makerepository/findfuturemakes', {}, successCallback, errorCallback);
    };

    /**
    * Get a the details of a particular make
    *
    * @method getMakeById
    * @param int id The id of the make
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getMakeById = function(id, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/makerepository/findbyid', {"id": id}, successCallback, errorCallback);
    };

    /**
    * Get the details of a particular name
    *
    * @method getMakeByName
    * @param string name The name of the make (use niceName value)
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getMakeByName = function(name, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/makerepository/findmakebyname', {"name": name}, successCallback, errorCallback);
        //return this.invoke('/api/vehicle/'+name, {}, successCallback, errorCallback);
    };

    //========================================================= Model Repository Calls
    /**
    * Get model details for a particular make and year
    *
    * @method getModelsByMakeAndYear
    * @param string make The vehicle make (use niceName value)
    * @param string year The vehicle year
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getModelsByMakeAndYear = function(make, year, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelrepository/findmodelsbymakeandyear', {"make": make, "year": year}, successCallback, errorCallback);
    };

    /**
    * Get model details for a particular make and a publication state
    *
    * @method getModelsByMakeAndState
    * @param string make The vehicle make (use niceName value)
    * @param string state The vehicle publication state (new|used|future)
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getModelsByMakeAndState = function(make, state, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelrepository/findmodelsbymakeandpublicationstate', {"make": make, "state": state}, successCallback, errorCallback);
    };

    /**
    * Get model details for a specific make ID
    *
    * @method getModelsByMakeId
    * @param int id The make ID
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getModelsByMakeId = function(id, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelrepository/findbymakeid', {"makeid": id}, successCallback, errorCallback);
    };

    /**
    * Get model details for a speicifc make name
    *
    * @method getModelsByMakeName
    * @param string name The make name (use niceName value)
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getModelsByMakeName = function(name, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelrepository/findmodelsbymake', {"make": name}, successCallback, errorCallback);
    };

    /**
    * Get list of future models for a specific make ID
    *
    * @method getFutureModelsByMakeId
    * @param int id The make ID
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getFutureModelsByMakeId = function(id, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelrepository/findfuturemodelsbymakeid', {"makeId": id}, successCallback, errorCallback);
    };

    /**
    * Get list of used models for a specific make ID
    *
    * @method getUsedModelsByMakeId
    * @param int id The make ID
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getUsedModelsByMakeId = function(id, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelrepository/findusedmodelsbymakeid', {"makeId": id}, successCallback, errorCallback);
    };

    /**
    * Get list of new models for a specific make ID
    *
    * @method getNewModelsByMakeId
    * @param int id The make ID
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getNewModelsByMakeId = function(id, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelrepository/findnewmodelsbymakeid', {"makeId": id}, successCallback, errorCallback);
    };

    /**
    * Get mode details for this specific model ID
    *
    * @method getModelById
    * @param int id The model ID
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getModelById = function(id, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelrepository/findbyid', {"id": id}, successCallback, errorCallback);
    };

    /**
    * Get model details for a specific make and model names
    *
    * @method getModelByMakeAndModelName
    * @param string make The make name (use niceName value)
    * @param string model The model name (use niceName value)
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getModelByMakeAndModelName = function(make, model, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelrepository/findmodelbymakemodelname', {"make": make, "model": model}, successCallback, errorCallback);
        //return this.invoke('/api/vehicle/'+make+'/'+model, {}, successCallback, errorCallback);
    };

    //========================================================= Model Year Repository
    /**
    * Get a list of model years of a particular vehicle by the model year ID
    *
    * @method getModelYearById
    * @param int id The model year ID
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getModelYearById = function(id, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelyearrepository/findbyid', {"id": id}, successCallback, errorCallback);
    };

    /**
    * Get a list of years that have new vehicles listed in them
    *
    * @method getListOfYearsWithNew
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getListOfYearsWithNew = function(successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelyearrepository/finddistinctyearwithnew', {}, successCallback, errorCallback);
    };

    /**
    * Get a list of years that have both new and used vehicles listed in them
    *
    * @method getListOfYearsWithNewOrUsed
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getListOfYearsWithNewOrUsed = function(successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelyearrepository/finddistinctyearwithneworused', {}, successCallback, errorCallback);
    };

    /**
    * Get a list of years that have used vehicles listed in them
    *
    * @method getListOfYearsWithUsed
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getListOfYearsWithUsed = function(successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelyearrepository/finddistinctyearwithused', {}, successCallback, errorCallback);
    };

    /**
    * Get a list of future model years of a particular vehicle by the model ID
    *
    * @method getFutureModelYearsByModelId
    * @param int modelId The model ID
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getFutureModelYearsByModelId = function(modelId, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelyearrepository/findfuturemodelyearsbymodelid', {"modelId": modelId}, successCallback, errorCallback);
    };

    /**
    * Get a list of model years of a particular vehicle by the make and year of production
    *
    * @method getModelYearsByMakeAndYear
    * @param string make The make name (use niceName value)
    * @param int year The four-digit year
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getModelYearsByMakeAndYear = function(make, year, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelyearrepository/findmodelyearsbymakeandyear', {"make": make, "year": year}, successCallback, errorCallback);
    };

    /**
    * Get a list of model years of a particular vehicle by the make and model of the vehicle
    *
    * @method getModelYearsByMakeAndModel
    * @param string make The make name (use niceName value)
    * @param string model The model name (use niceName value)
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getModelYearsByMakeAndModel = function(make, model, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelyearrepository/findmodelyearsbymakemodel', {"make": make, "model": model}, successCallback, errorCallback);
    };

    /**
    * Get a list of model years of a particular vehicle by the make ID and the year of production
    *
    * @method getNewAndUsedModelYearsByMakeIdAndYear
    * @param int makeId The make ID
    * @param int year The 4-digit year
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getNewAndUsedModelYearsByMakeIdAndYear = function(makeId, year, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelyearrepository/findnewandusedmodelyearsbymakeidandyear', {"makeid": makeId, "year": year}, successCallback, errorCallback);
    };

    /**
    * Get a list of new model years of a particular vehicle by the model ID
    *
    * @method
    * @param int modelId The model ID
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getNewModelYearsByModelId = function(modelId, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelyearrepository/findnewmodelyearsbymodelid', {"modelId": modelId}, successCallback, errorCallback);
    };

    /**
    * Get a list of used model years of a particular vehicle by the model ID
    *
    * @method
    * @param int modelId The model ID
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getUsedModelYearsByModelId = function(modelId, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelyearrepository/findusedmodelyearsbymodelid', {"modelId": modelId}, successCallback, errorCallback);
    };

    /**
    * Get a list of model years of a particular vehicle by the vehicle's category and state (i.e. new, used or future)
    *
    * @method getModelYearsByCatAndState
    * @param string category The vehicle category (i.e. Sedan, suv, truck, ..etc)
    * @param string state The publication state (used|new|future)
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getModelYearsByCatAndState = function(category, state, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelyearrepository/findyearsbycategoryandpublicationstate', {"category": category, "state": state}, successCallback, errorCallback);
    };

    /**
    * Get a list of model years of a particular vehicle by the model's ID
    *
    * @method getModelYearsByModelId
    * @param int modelId The model id
    * @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
    * @return {string} The URL of the REST call to Edmunds' API Service
    */
    proto.getModelYearsByModelId = function(modelId, successCallback, errorCallback) {
        return this.invoke('/api/vehicle/modelyearrepository/formodelid', {"modelid": modelId}, successCallback, errorCallback);
    };

    // TODO description
    proto.getPhotosByStyleId = function(styleId, successCallback, errorCallback) {
        return this.invoke('/api/vehiclephoto/service/findphotosbystyleid', { styleId: styleId }, successCallback, errorCallback);
    };

    return Vehicle;

}());

// Uses John Resig implementation - http://ejohn.org/ - MIT Licensed
EDM.template = function(text, data) {
    /* jshint evil:true */
    var fn = new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
        // Convert the template into pure JavaScript
        (text || '')
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'") +
        "');}return p.join('');");
    return data ? fn(data) : fn;
};

EDM.namespace('util').Array = (function() {

    var nativeIsArray = Array.isArray,
        nativeIndexOf = Array.prototype.indexOf,
        toString = Object.prototype.toString,
        util = {};

    util.isArray = nativeIsArray || function(obj) {
        return toString.call(obj) === '[object Array]';
    };

    util.contains = function(list, key) {
        var i, length;
        if (!util.isArray(list)) {
            return false;
        }
        if (nativeIndexOf && list.indexOf) {
            //console.log(list.indexOf(key));
            return list.indexOf(key) !== -1;
        }
        for (i = 0, length = list.length; i < length; i++) {
            if (list[i] === key) {
                return true;
            }
        }
        return false;
    };

    return util;

}());

EDM.namespace('util').Function = (function() {

    var slice = Array.prototype.slice,
        nativeBind = Function.prototype.bind;

    return {

        bind: function(fn, obj) {
            if (fn.bind === nativeBind && nativeBind) {
                return nativeBind.apply(fn, slice.call(arguments, 1));
            }
            return function() {
                return fn.apply(obj, slice.call(arguments));
            };
        }

    };

}());

EDM.namespace('util').Number = {};

EDM.namespace('util').String = {};

EDM.namespace('event').KeyCode = {

    BACKSPACE: 8,
    TAB: 9,

    ENTER: 13,

    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    PAUSE: 19,
    BREAK: 19,

    CAPS_LOCK: 20,

    ESC: 27,

    SPACE: 32,

    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,

    ARROW_LEFT: 37,
    ARROW_UP: 38,
    ARROW_RIGHT: 39,
    ARROW_DOWN: 40,

    INSERT: 45,
    DELETE: 46,

    ZERO: 48,
    ONE: 49,
    TWO: 50,
    THREE: 51,
    FOUR: 52,
    FIVE: 53,
    SIX: 54,
    SEVEN: 55,
    EIGHT: 56,
    NINE: 57,

    NUM_ZERO: 96,
    NUM_ONE: 97,
    NUM_TWO: 98,
    NUM_THREE: 99,
    NUM_FOUR: 100,
    NUM_FIVE: 101,
    NUM_SIX: 102,
    NUM_SEVEN: 103,
    NUM_EIGHT: 104,
    NUM_NINE: 105,

    NUM_MULTIPLY: 106,
    NUM_PLUS: 107,
    NUM_MINUS: 109,
    NUM_DELIMETER: 110,
    NUM_DIVIDE: 111,

    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,

    NUM_LOCK: 144,
    SCROLL_LOCK: 145

};

/**
 * Helper class to manage tokens.
 *
 * @module edm-helpers
 *
 * @class TokenList
 * @namespace EMD.helper
 *
 * @constructor
 *
 * @example
 *     var tokens = new EDM.helper.TokenList();
 *
 *     tokens.add('active');
 *     tokens.add('disabled');
 *     tokens.toString(); // => returns 'active disabled'
 *
 *     tokens.toggle('hovered') // adds 'hovered' and returns true
 *     tokens.toString(); // returns 'active disabled hovered'
 *
 *     tokens.toggle('disabled') // removes 'disabled' and returns false
 *     tokens.toString(); // returns 'active hovered'
 */
EDM.namespace('helper').TokenList = function() {
    'use strict';

    var
        /**
         * The list of tokens
         * @property _list
         * @private
         * @type {Array}
         */
        _list = [],

        /**
         * Used for matching whitespaces
         * @property _regCheckWhite
         * @private
         * @type {RegExp}
         */
        _regCheckWhite = /\s+/g;

    /**
     * Returns true if token is valid, otherwise false
     * @private
     * @method _isValidToken
     * @param {String} token The token
     * @return {Boolean}
     */
    function _isValidToken(token) {
        if (typeof token !== 'string' || token.length === 0) {
            return false;
        }
        return !token.match(_regCheckWhite);
    }

    /**
     * Returns an item in the list by its index.
     * The function returns `undefined` if the number is smaller than 0 and greater than or equal to the length of the list
     * @method item
     * @param {Number} idx The item index
     * @return {String|undefined}
     */
    this.item = function(idx) {
        var index = idx | 0; // convert to int
        if (_list.length > index && index > 0) {
            return _list[index];
        }
    };

    /**
     * Return true if the list contains token, otherwise false
     * @method contains
     * @param {String} token The token
     * @return {Boolean}
     */
    this.contains = function(token) {
        var length = _list.length,
            i = 0;
        for ( ; i < length; i++) {
            if (_list[i] === token) {
                return true;
            }
        }
        return false;
    };

    /**
     * Adds token to the list
     * @method add
     * @param {String} token The token
     */
    this.add = function(token) {
        if (!_isValidToken(token)) {
            return;
        }
        if (!this.contains(token)) {
            _list.push(token);
        }
    };

    /**
     * Removes token from the list
     * @method remove
     * @param {String} token The token
     */
    this.remove = function(token) {
        var length = _list.length,
            i = 0, tail;
        for ( ; i < length; i++) {
            if (_list[i] === token) {
                tail = _list.slice(i + 1);
                _list.length = i;
                _list.push.apply(_list, tail);
                return;
            }
        }
    };

    /**
     * Removes token from list and returns false. If token doesn't exist it's added and the function returns true
     * @method toggle
     * @param {String} token The token
     * @return {Boolean}
     */
    this.toggle = function(token) {
        if (this.contains(token)) {
            this.remove(token);
            return false;
        }
        this.add(token);
        return true;
    };

    /**
     * Returns the number of unique tokens
     * @return {Number}
     */
    this.getLength = function() {
        return _list.length;
    };

    /**
     * Returns the string of tokens joined whitespaces
     * @return {String}
     */
    this.toString = function() {
        return _list.join(' ');
    };

};

EDM.namespace('helper').HTMLElementClassList = function(element) {

    var
        nativeClassList = element.classList,
        _element = element;

    function _getClassList(element) {
        var classList = new EDM.helper.TokenList(),
            classNames = element.className.split(/\s+/g),
            length = classNames.length,
            i = 0;
        for ( ; i < length; i++) {
            classList.add(classNames[i]);
        }
        return classList;
    }

    this.contains = function(className) {
        if (nativeClassList) {
            return nativeClassList.contains(className);
        }
        return _getClassList(_element).contains(className);
    };

    this.add = function(className) {
        var classList;
        if (nativeClassList) {
            return nativeClassList.add(className);
        }
        classList = _getClassList(_element);
        classList.add(className);
        _element.className = classList.toString();
    };

    this.remove = function(className) {
        var classList;
        if (nativeClassList) {
            return nativeClassList.remove(className);
        }
        classList = _getClassList(_element);
        classList.remove(className);
        _element.className = classList.toString();
    };

    this.toggle = function(className) {
        var classList;
        if (nativeClassList) {
            return nativeClassList.toggle(className);
        }
        classList = _getClassList(_element);
        classList.toggle(className);
        _element.className = classList.toString();
    };

};

/**
 * @class Observable
 * @namespace EDM.mixin
 * @example
 *      var obj = { counter: 1 };
 *      EDM.extend(obj, EDM.mixin.Observable)
 */
EDM.namespace('mixin').Observable = (function() {

    var slice = Array.prototype.slice;

    return {

        /**
         * Binds an event to a callback function.
         * @param {String} name The event name
         * @param {Function} callback The callback function
         * @param {Object} context The context object
         * @chainable
         */
        on: function(name, callback, context) {
            var events;
            if (!this._events) {
                this._events = {};
            }
            if (!this._events[name]) {
                this._events[name] = [];
            }
            events = this._events[name];
            events.push({
                callback: callback,
                context: context
            });
            return this;
        },

        /**
         * Removes a previously-bound callback function from an object.
         * If no event name is specified, all callbacks will be removed.
         * @param {String} name The event name
         * @chainable
         */
        off: function(name) {
            var events, i, length;
            if (!this._events) {
                return this;
            }
            if (!name) {
                this._events = {};
                return this;
            }
            delete this._events[name];
            return this;
        },

        /**
         * Trigger callbacks for the given event. Subsequent arguments to trigger will be passed along to the event callbacks.
         * @param {String} name The event name
         * @param [arg*] The arguments
         * @chainable
         */
        trigger: function(name) {
            var args = slice.call(arguments, 1),
                events, event, length, i;
            if (!this._events) {
                return this;
            }
            events = this._events[name];
            if (events) {
                length = events.length;
                for (i = 0; i < length; i++) {
                    event = events[i];
                    event.callback.apply(event.context, args);
                }
            }
            return this;
        }

    };

}());

/**
 * Class-wrapper for an HTMLElement. Provides functionality to manipulate element
 *
 * @module edm-dom
 *
 * @class Element
 * @namespace EDM.dom
 *
 * @constructor
 *
 * @example
 *     var el = new Element(document.getElementById('test'));
 *     el.addClass('active'); // adds `active` class name to the element
 *     el.hasClass('active'); // => true
 *     el.toggleClass('active disabled'); // removes class `active` and adds `disabled`
 *     el.hasClass('active'); // => false
 *     el.hasClass('disabled'); // => true
 */
EDM.namespace('dom').Element = function(element) {
    'use strict';

    var
        _element = element,
        /**
         * @private
         * @property _regSplitWhite
         * @type {RegExp}
         */
        _regSplitWhite = /\s+/g,

        // shortcut
        ElementClassList = EDM.helper.HTMLElementClassList;

    // TODO throw exception if element is not HTMLElement

    /**
     * @private
     * @method _parseClassNames
     * @param {String}
     * @return {Array}
     */
    function _parseClassNames(str) {
        // TODO trim string
        return (typeof str === 'string' && str.length > 0) ? str.split(_regSplitWhite) : [];
    }

    /**
     * @method hasClass
     * @param {String} className
     * @return {Boolean}
     */
    this.hasClass = function(className) {
        var classList = new ElementClassList(_element);
        // TODO trim and replace whitespaces
        return classList.contains(className);
    };

    /**
     * @method addClass
     * @param {String} className
     * @chainable
     */
    this.addClass = function(className) {
        var classList = new ElementClassList(_element),
            classNames = _parseClassNames(className),
            length = classNames.length,
            i = 0;
        for ( ; i < length; i++) {
            classList.add(classNames[i]);
        }
    };

    /**
     * @method removeClass
     * @param {String} className
     * @chainable
     */
    this.removeClass = function(className) {
        var classList = new ElementClassList(_element),
            classNames = _parseClassNames(className),
            length = classNames.length,
            i = 0;
        for ( ; i < length; i++) {
            classList.remove(classNames[i]);
        }
    };

    /**
     * @method toggleClass
     * @param {String} className
     * @chainable
     */
    this.toggleClass = function(className) {
        var classList = new ElementClassList(_element),
            classNames = _parseClassNames(className),
            length = classNames.length,
            i = 0;
        for ( ; i < length; i++) {
            classList.toggle(classNames[i]);
        }
    };

    /**
     * @method on
     */
    this.on = function(type, handler) {
        // for modern browsers
        if (_element.addEventListener) {
            _element.addEventListener(type, handler, false);
            return;
        }
        // for IE
        if (_element.attachEvent) {
            _element.attachEvent('on' + type, handler, false);
            return;
        }
    };

    /**
     * @method off
     */
    this.off = function(type, handler) {
        // for modern browsers
        if (_element.removeEventListener) {
            _element.removeEventListener(type, handler, false);
            return;
        }
        // for IE
        if (_element.detachEvent) {
            _element.detachEvent('on' + type, handler, false);
            return;
        }
    };

    /**
     * @method trigger
     */
    this.trigger = function(type) {
    };

};

/**
 * Base View Class
 * @class View
 * @namespace EDM.ui
 *
 * @extends EDM.mixin.Observable
 */
EDM.namespace('ui').View = (function() {

    var // dependencies
        Element = EDM.dom.Element,
        Observable = EDM.mixin.Observable,
        extend = EDM.extend;

    function View(options) {
        var el, $el, attr;
        // extend options
        options = extend({}, {
            tagName: this.tagName,
            className: this.className,
            attributes: this.attributes
        }, options);
        // create element
        el = this.el = options.el || document.createElement(options.tagName);
        $el = this.$el = new Element(el);
        for (attr in options.attributes) {
            el.setAttribute(attr, options.attributes[attr]);
        }
        $el.addClass(options.className);
        this.delegateEvents();
        this.initialize.apply(this, arguments);
    }

    extend(View.prototype, Observable, {

        /**
         * @property el
         * @type {HTMLElement}
         */

        /**
         * @property $el
         * @type {EDM.dom.Element}
         */

        tagName: 'div',

        /**
         *
         */
        initialize: function() {},

        /**
         *
         */
        render: function() {
            return this;
        },

        delegateEvents: function() {
            var $el = this.$el,
                events = this.events,
                event, fn, fnName;
            for (event in events) {
                fnName = events[event];
                if (this[fnName]) {
                    fn = EDM.util.Function.bind(this[fnName], this);
                    $el.on(event, fn);
                }
            }
        },

        /**
         *
         */
        show: function() {
            this.$el.removeClass('hide');
            return this;
        },

        /**
         *
         */
        hide: function() {
            this.$el.addClass('hide');
            return this;
        },

        /**
         *
         */
        remove: function() {
            this.el.remove();
        },

        /**
         *
         */
        disable: function() {
            if (typeof this.disabled !== 'undefined') {
                this.disabled = true;
            }
            this.$el.addClass('disabled');
            return this;
        },

        /**
         *
         */
        enable: function() {
            if (typeof this.disabled !== 'undefined') {
                this.disabled = false;
            }
            this.$el.removeClass('disabled');
            return this;
        }

    });

    View.extend = function(properties, statics) {
        var parent = this,
            child;
        if (properties && Object.prototype.hasOwnProperty.call(properties, 'constructor')) {
            child = properties.constructor;
        } else {
            child = function() {
                return parent.apply(this, arguments);
            };
        }
        // add static properties
        extend(child, parent, statics);
        // set the prototype chain to inherit from parent
        function Surrogate() {
            this.constructor = child;
        }
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate();
        // add prototype properties
        if (properties) {
            extend(child.prototype, properties);
        }
        return child;
    };

    return View;

}());
// Backward compatibility for the old Observable API
EDM.fixObservable = function() {
    var newObservable = EDM.mixin.Observable,
        oldObservable = EDM.Observable;
    newObservable.call = newObservable.apply = function(obj) {
        //console.log('`EDM.mixin.Observable` is no longer a function. Please use `EDM.extend` to mix `EDM.mixin.Observable` with object');
        obj.on = this.on;
        obj.off = this.off;
        obj.trigger = this.trigger;
    };
    if (oldObservable) {
        oldObservable = {};
        oldObservable.call = oldObservable.apply = function(obj) {
            //console.log('`EDM.Observable` is deprecated. Please use `EDM.mixin.Observable` mixin instead.');
            newObservable.call(obj);
        };
    }
};
EDM.fixObservable();

var EDM = window.EDM || {};

EDM.jsonp = (function(global) {
    'use strict';

    var callbackId = 0,
        documentHead = document.head || document.getElementsByTagName('head')[0];

    function createScript(url) {
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('async', true);
        script.setAttribute('src', url);
        return script;
    }

    return function(options) {
        options = options || {};

        var callbackName = 'callback' + (++callbackId),
            url = options.url + '&callback=EDM.' + callbackName + (options.cache ? '' : '&_dc=' + new Date().getTime()),
            script = createScript(url),
            abortTimeout;

        function cleanup() {
            if (script) {
                script.parentNode.removeChild(script);
            }
            clearTimeout(abortTimeout);
            delete global[callbackName];
        }

        function success(data) {
            if (typeof options.success === 'function') {
                options.success(data);
            }
        }

        function error(errorType) {
            if (typeof options.error === 'function') {
                options.error(errorType);
            }
        }

        function abort(errorType) {
            cleanup();
            if (errorType === 'timeout') {
                global[callbackName] = function() {};
            }
            error(errorType);
        }

        global[callbackName] = function(data) {
            cleanup();
            success(data);
        };

        script.onerror = function() {
            abort('error');
        };

        documentHead.appendChild(script);

        if (options.timeout > 0) {
            abortTimeout = setTimeout(function() {
                abort('timeout');
            }, options.timeout);
        }

    };

}(EDM));

/**
 * Core functionality for the Edmunds API JavaScript SDK
 *
 * @class EDMUNDSAPI
 */
function EDMUNDSAPI(key) {
	/**
	 * Assigned API Key. Register for an API Key <a href="http://developer.edmunds.com/apps/register">here</a>
	 *
	 * @config _api_key
	 * @private
	 * @type string
	 */
	var _api_key = key;
	/**
	 * The API version
	 *
	 * @config _api_version
	 * @private
	 * @type string
	 */
	var _api_version = "v1";
	/**
	 * The base URL for the API
	 *
	 * @property _base_url
	 * @private
	 * @type string
	 */
	var _base_url = "http://api.edmunds.com/";
	/**
	 * The base URL for the QA API
	 *
	 * @property _base_url_qa
	 * @private
	 * @type string
	 */
	var _base_url_qa = "http://widgets.edmunds.com";
	/**
	 * The API response format
	 *
	 * @property _response_format
	 * @private
	 * @type string
	 */
	var _response_format = 'json';
	/**
	 * The document HEAD element
	 *
	 * @property _head
	 * @private
	 * @type DOMElement
	 */
	var _head = document.getElementsByTagName('head')[0];

	/**
	 * The base URL for the API
	 *
	 * @method _serializeParams
	 * @private
	 * @param object JSON object of parameters and their values
	 * @return {string} Serialized parameters in the form of a query string
	 */
	function _serializeParams(params) {
		var str = '';
		for(var key in params) {
			if(params.hasOwnProperty(key)) {
				if (str !== '') str += "&";
		   		str += key + "=" + params[key];
			}
		}
		return str;
	}

	/**
	 * The base URL for the API
	 *
	 * @method getBaseUrl
	 * @param void
	 * @return {string} API URL stub
	 */
	this.getBaseUrl = function() {
		return _base_url + _api_version;
	};
	/**
	 * The base URL for the API
	 *
	 * @method getVersion
	 * @param void
	 * @return {string} API version
	 */
	this.getVersion = function() {
		return _api_version;
	};
	/**
	 * The base URL for the API
	 *
	 * @method setVersion
	 * @param void
	 * @return {string} API version
	 */
	this.setVersion = function(version) {
		_api_version = version;
		return _api_version;
	};
	/**
	 * Make the API REST call
	 *
	 * @method invoke
	 * @param string method The API method to be invoked
	 * @param object params JSON object of method parameters and their values
	 * @param function callback The JavaScript function to be invoked when the results are returned (JSONP implementation)
	 * @return {string} API REST call URL
	 */
	/*
	this.invoke = function(method, params, callback) {
		var qs = _serializeParams(params);
		var url = this.getBaseUrl();
		var uniq = 'cb'+new Date().getTime();
		EDMUNDSAPI[uniq] = callback;
		qs = (qs) ? '?' + qs + '&api_key=' + _api_key + "&fmt=" + _response_format : '?api_key=' + _api_key + "&fmt=" + _response_format;
		var rest_call = url + method + qs + "&callback=EDMUNDSAPI."+uniq;
		var js = document.createElement('script');
		js.type = 'text/javascript';
		js.src = rest_call;
		_head.appendChild(js);
		return rest_call;
	};
	*/
	this.invoke = function(method, params, successCallback, errorCallback) {
        var queryString = _serializeParams(params),
            baseUrl = this.getBaseUrl();
        queryString = (queryString) ? '?' + queryString + '&api_key=' + _api_key + "&fmt=" + _response_format : '?api_key=' + _api_key + "&fmt=" + _response_format;
        return EDM.jsonp({
            url: baseUrl + method + queryString,
            timeout: 7000,
            success: successCallback,
            error: errorCallback
        });
	};

	/**
	 * Make the API REST call
	 *
	 * @method invokeString
	 * @param string method The API method to be invoked
	 * @param object params JSON object of method parameters and their values
	 * @param function callback The JavaScript function to be invoked when the results are returned (JSONP implementation)
	 * @return {string} API REST call URL
	 */
	/*
	this.invokeString = function(method, params, callback) {
		var qs = _serializeParams(params);
		var url = this.getBaseUrl();
		var uniq = 'cbs'+new Date().getTime();
		EDMUNDSAPI[uniq] = callback;
		// if params is empty but we have '?' in url
		qs = (qs) ? qs + '&api_key=' + _api_key + "&fmt=" + _response_format : '&api_key=' + _api_key + "&fmt=" + _response_format;
		var rest_call = url + method + qs + "&callback=EDMUNDSAPI."+uniq;
		var js = document.createElement('script');
		js.type = 'text/javascript';
		js.src = rest_call;
		_head.appendChild(js);
		return rest_call;
	};
	*/
    this.invokeString = function(method, params, successCallback, errorCallback) {
        var queryString = _serializeParams(params),
            baseUrl = this.getBaseUrl();
        queryString = (queryString) ? queryString + '&api_key=' + _api_key + "&fmt=" + _response_format : '&api_key=' + _api_key + "&fmt=" + _response_format;
        return EDM.jsonp({
            url: baseUrl + method + queryString,
            timeout: 7000,
            success: successCallback,
            error: errorCallback
        });
    };

	/**
	 * Make the QA API REST call
	 *
	 * @method invoke
	 * @param string method The API method to be invoked
	 * @param object params JSON object of method parameters and their values
	 * @param function callback The JavaScript function to be invoked when the results are returned (JSONP implementation)
	 * @return {string} API REST call URL
	 */
    /*
	this.invoke_qa = function(method, params, callback) {
		var qs = _serializeParams(params);
		var uniq = 'cbq'+new Date().getTime();
		EDMUNDSAPI[uniq] = callback;
		// if params is empty but we have '?' in url
		qs = (qs) ? qs + '&api_key=' + _api_key + "&fmt=" + _response_format : '&api_key=' + _api_key + "&fmt=" + _response_format;
		var rest_call = _base_url_qa + method + qs + "&callback=EDMUNDSAPI."+uniq;
		var js = document.createElement('script');
		js.type = 'text/javascript';
		js.src = rest_call;
		_head.appendChild(js);
		return rest_call;
	}
	*/
    this.invoke_qa = function(method, params, successCallback, errorCallback) {
        var queryString = _serializeParams(params),
            baseUrl = this.getBaseUrl();
        queryString = (queryString) ? queryString + '&api_key=' + _api_key + "&fmt=" + _response_format : '&api_key=' + _api_key + "&fmt=" + _response_format;
        return EDM.jsonp({
            url: _base_url_qa + method + queryString,
            timeout: 7000,
            success: successCallback,
            error: errorCallback
        });
    };

}

/**
 * The Vehicle API commonly used methods and structures
 * @module Vehicle
 * @namespace EDMUNDSAPI
 * @requires EDMUNDSAPI
 */
(function() {
	if (!window.EDMUNDSAPI) throw new Error('Edmunds API: Core class is not loaded.');

	/**
	 * Vehice Data and Repositories
	 *
	 * @constructor
     * @class Vehicle
  	 * @namespace EDMUNDSAPI
	 * @extends EDMUNDSAPI
	 */
	window.EDMUNDSAPI.Vehicle = function(key) {
		window.EDMUNDSAPI.apply(this, arguments);
	};

	window.EDMUNDSAPI.Vehicle.prototype = new window.EDMUNDSAPI;
	var proto = window.EDMUNDSAPI.Vehicle.prototype;

	//========================================================= GENERICS
	/**
	* Get a valid of zip code
	*
	* @method getValidZip
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getValidZip = function(zip, successCallback, errorCallback) {
		return this.invoke('/api/region/zip/validation/' + zip, {}, successCallback, errorCallback);
	};
	/**
	* Get a location
	*
	* @method getUpdateLocation
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
    // http://www.edmunds.com/api/region/regionrepository/findstatebyzip?zip=90404&fmt=json
	proto.getUpdateLocation = function(zip, successCallback, errorCallback) {
		return this.invoke('/api/region/regionrepository/findstatebyzip', {"zip": zip}, successCallback, errorCallback);
	};
	/**
	* Get a dealers list
	*
	* @method getDealersList
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	//api.edmunds.com/v1/api/dealer?makeName=ford&model=mustang&styleid=101356438&zipcode=90404&radius=100&rows=5&isPublic=false&fmt=json&api_key=gmxhexjaxgd528wtxdf9fs8y
	proto.getDealersList = function(makeName, model, styleid, zipcode, radius, rows, isPublic, bookName, keywords, premierOnly, successCallback, errorCallback) {
		return this.invoke('/api/dealer', {
			makeName:    makeName,
			model:       model,
			styleid:     styleid,
			zipcode:     zipcode,
			radius:      radius,
			rows:        rows,
			isPublic:    isPublic,
			bookName:    bookName,
			keywords:    keywords,
			premierOnly: premierOnly
		}, successCallback, errorCallback);
	};
	/**
	* Get a dealers list
	*
	* @method getDependenciesList
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getDependenciesList = function(url, successCallback, errorCallback) {
		return this.invokeString('/api/configurator/withOptions?' + url, {}, successCallback, errorCallback);
	};
	/**
	* Submit form
	*
	* @method submitLeadForm
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.submitLeadForm = function(url, successCallback, errorCallback) {
		return this.invokeString('/api/dealer/lead?' + url, {}, successCallback, errorCallback);
	};
	/**
	* Get a dealers list
	*
	* @method getOptionsList
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	//http://api.edmunds.com/v1/api/tmv/tmvservice/calculatenewtmv?styleid=101409209&optionid=200396306&optionid=200396335&zip=33756&fmt=json&api_key=g2dgxhfatcspkunbb7m33zv6&alg=rethink
	proto.getOptionsList = function(url, zip, styleid, successCallback, errorCallback) {
		return this.invokeString('/api/tmv/tmvservice/calculatenewtmv?' + url, {"zip": zip, "styleid": styleid, "alg": "rethink"}, successCallback, errorCallback);
	};
	/**
	* Get a list of available makes in this particular year
	*
	* @method getListOfMakes
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getListOfMakes = function(publicationState, successCallback, errorCallback) {
		return this.invoke('/api/vehicle-directory-ajax/findmakes', {
		    ps: publicationState || 'all'
		}, successCallback, errorCallback);
	};
	/**
	* Get a list of available models of a particular make in this particular year
	*
	* @method getListOfModelsByMake
	* @param string make The vehicle make (use niceName value)
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getListOfModelsByMake = function(make, successCallback, errorCallback) {
		return this.invoke('/api/vehicle-directory-ajax/findmakemodels', {"make": make}, successCallback, errorCallback);
	};
	/**
	* Get a list of available vehicle types (will return an array)
	*
	* @method getListOfTypes
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getListOfTypes = function(successCallback, errorCallback) {
		return this.invoke('/api/vehicle/stylerepository/findallvehicletypes', {}, successCallback, errorCallback);
	};
	/**
	* Get a the details on a particular vehicle
	*
	* @method getVehicle
	* @param string make The vehicle make (use niceName value)
	* @param string model The vehicle model (use niceName value)
	* @param int year The year of the make/model
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getVehicle = function(make, model, year, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelyearrepository/foryearmakemodel', {"make":make, "model":model, "year":year}, successCallback, errorCallback);
		//return this.invoke('/api/vehicle/'+make+'/'+model+'/'+year, {}, successCallback, errorCallback);
	};

	/**
	* Get a the photo on a particular vehicle
	*
	* @method getVehiclePhoto
	* @param string make The vehicle make (use niceName value)
	* @param string model The vehicle model (use niceName value)
	* @param int year The year of the make/model
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getVehiclePhoto = function(make, model, year, style, successCallback, errorCallback) {
		return this.invoke('/api/vehiclephoto/service/findphotobystyleid', {"make":make, "model":model, "year":year, "style":style}, successCallback, errorCallback);
		//return this.invoke('/api/vehicle/'+make+'/'+model+'/'+year, {}, successCallback, errorCallback);
	};

	/**
	* Get a the configuration on a particular vehicle
	*
	* @method getVehicleConfig
	* @param string make The vehicle make (use niceName value)
	* @param string model The vehicle model (use niceName value)
	* @param int year The year of the make/model
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	//http://api.edmunds.com/v1/api/configurator/default?zip=33756&styleid=200437180&api_key=g2dgxhfatcspkunbb7m33zv6&fmt=json&callback=EDMUNDSAPI.cb1366228012266
	proto.getVehicleConfig = function(styleId, zip, successCallback, errorCallback) {
		return this.invoke('/api/configurator/default', { zip: zip, styleid: styleId }, successCallback, errorCallback);
		//return this.invoke('/api/vehicle/'+make+'/'+model+'/'+year, {}, successCallback, errorCallback);
	};

	//========================================================= Make Repository Calls
	/**
	* Get a list of all makes in our databases
	*
	* @method getMakes
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getMakes = function(successCallback, errorCallback) {
		return this.invoke('/api/vehicle/makerepository/findall', {}, successCallback, errorCallback);
	};
	/**
	* Get a list of available makes in this particular year
	*
	* @method getMakesByYear
	* @param int year The year of the make
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getMakesByYear = function(year, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/makerepository/findmakesbymodelyear', {"year": year}, successCallback, errorCallback);
	};
	/**
	* Get a list of available makes in this particular year
	*
	* @method getMakesByState
	* @param string state The state of the make (new|used|future)
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getMakesByState = function(state, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/makerepository/findmakesbypublicationstate', {"state": state}, successCallback, errorCallback);
	};
	/**
	* Get a list of new makes only
	*
	* @method getNewMakes
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getNewMakes = function(successCallback, errorCallback) {
		return this.invoke('/api/vehicle/makerepository/findnewmakes', {}, successCallback, errorCallback);
	};
	/**
	* Get a list of used makes only
	*
	* @method getUsedMakes
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getUsedMakes = function(successCallback, errorCallback) {
		return this.invoke('/api/vehicle/makerepository/findusedmakes', {}, successCallback, errorCallback);
	};
	/**
	* Get a list of all future makes
	*
	* @method getFutureMakes
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getFutureMakes = function(successCallback, errorCallback) {
		return this.invoke('/api/vehicle/makerepository/findfuturemakes', {}, successCallback, errorCallback);
	};
	/**
	* Get a the details of a particular make
	*
	* @method getMakeById
	* @param int id The id of the make
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getMakeById = function(id, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/makerepository/findbyid', {"id": id}, successCallback, errorCallback);
	};
	/**
	* Get the details of a particular name
	*
	* @method getMakeByName
	* @param string name The name of the make (use niceName value)
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getMakeByName = function(name, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/makerepository/findmakebyname', {"name": name}, successCallback, errorCallback);
		//return this.invoke('/api/vehicle/'+name, {}, successCallback, errorCallback);
	};

	//========================================================= Model Repository Calls
	/**
	* Get model details for a particular make and year
	*
	* @method getModelsByMakeAndYear
	* @param string make The vehicle make (use niceName value)
	* @param string year The vehicle year
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getModelsByMakeAndYear = function(make, year, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelrepository/findmodelsbymakeandyear', {"make": make, "year": year}, successCallback, errorCallback);
	};
	/**
	* Get model details for a particular make and a publication state
	*
	* @method getModelsByMakeAndState
	* @param string make The vehicle make (use niceName value)
	* @param string state The vehicle publication state (new|used|future)
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getModelsByMakeAndState = function(make, state, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelrepository/findmodelsbymakeandpublicationstate', {"make": make, "state": state}, successCallback, errorCallback);
	};
	/**
	* Get model details for a specific make ID
	*
	* @method getModelsByMakeId
	* @param int id The make ID
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getModelsByMakeId = function(id, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelrepository/findbymakeid', {"makeid": id}, successCallback, errorCallback);
	};
	/**
	* Get model details for a speicifc make name
	*
	* @method getModelsByMakeName
	* @param string name The make name (use niceName value)
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getModelsByMakeName = function(name, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelrepository/findmodelsbymake', {"make": name}, successCallback, errorCallback);
	};
	/**
	* Get list of future models for a specific make ID
	*
	* @method getFutureModelsByMakeId
	* @param int id The make ID
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getFutureModelsByMakeId = function(id, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelrepository/findfuturemodelsbymakeid', {"makeId": id}, successCallback, errorCallback);
	};
	/**
	* Get list of used models for a specific make ID
	*
	* @method getUsedModelsByMakeId
	* @param int id The make ID
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getUsedModelsByMakeId = function(id, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelrepository/findusedmodelsbymakeid', {"makeId": id}, successCallback, errorCallback);
	};
	/**
	* Get list of new models for a specific make ID
	*
	* @method getNewModelsByMakeId
	* @param int id The make ID
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getNewModelsByMakeId = function(id, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelrepository/findnewmodelsbymakeid', {"makeId": id}, successCallback, errorCallback);
	};
	/**
	* Get mode details for this specific model ID
	*
	* @method getModelById
	* @param int id The model ID
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getModelById = function(id, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelrepository/findbyid', {"id": id}, successCallback, errorCallback);
	};
	/**
	* Get model details for a specific make and model names
	*
	* @method getModelByMakeAndModelName
	* @param string make The make name (use niceName value)
	* @param string model The model name (use niceName value)
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getModelByMakeAndModelName = function(make, model, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelrepository/findmodelbymakemodelname', {"make": make, "model": model}, successCallback, errorCallback);
		//return this.invoke('/api/vehicle/'+make+'/'+model, {}, successCallback, errorCallback);
	};

	//========================================================= Model Year Repository
	/**
	* Get a list of model years of a particular vehicle by the model year ID
	*
	* @method getModelYearById
	* @param int id The model year ID
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getModelYearById = function(id, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelyearrepository/findbyid', {"id": id}, successCallback, errorCallback);
	};
	/**
	* Get a list of years that have new vehicles listed in them
	*
	* @method getListOfYearsWithNew
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getListOfYearsWithNew = function(successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelyearrepository/finddistinctyearwithnew', {}, successCallback, errorCallback);
	};
	/**
	* Get a list of years that have both new and used vehicles listed in them
	*
	* @method getListOfYearsWithNewOrUsed
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getListOfYearsWithNewOrUsed = function(successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelyearrepository/finddistinctyearwithneworused', {}, successCallback, errorCallback);
	};
	/**
	* Get a list of years that have used vehicles listed in them
	*
	* @method getListOfYearsWithUsed
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getListOfYearsWithUsed = function(successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelyearrepository/finddistinctyearwithused', {}, successCallback, errorCallback);
	};
	/**
	* Get a list of future model years of a particular vehicle by the model ID
	*
	* @method getFutureModelYearsByModelId
	* @param int modelId The model ID
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getFutureModelYearsByModelId = function(modelId, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelyearrepository/findfuturemodelyearsbymodelid', {"modelId": modelId}, successCallback, errorCallback);
	};
	/**
	* Get a list of model years of a particular vehicle by the make and year of production
	*
	* @method getModelYearsByMakeAndYear
	* @param string make The make name (use niceName value)
	* @param int year The four-digit year
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getModelYearsByMakeAndYear = function(make, year, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelyearrepository/findmodelyearsbymakeandyear', {"make": make, "year": year}, successCallback, errorCallback);
	};
	/**
	* Get a list of model years of a particular vehicle by the make and model of the vehicle
	*
	* @method getModelYearsByMakeAndModel
	* @param string make The make name (use niceName value)
	* @param string model The model name (use niceName value)
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getModelYearsByMakeAndModel = function(make, model, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelyearrepository/findmodelyearsbymakemodel', {"make": make, "model": model}, successCallback, errorCallback);
	};
	/**
	* Get a list of model years of a particular vehicle by the make ID and the year of production
	*
	* @method getNewAndUsedModelYearsByMakeIdAndYear
	* @param int makeId The make ID
	* @param int year The 4-digit year
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getNewAndUsedModelYearsByMakeIdAndYear = function(makeId, year, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelyearrepository/findnewandusedmodelyearsbymakeidandyear', {"makeid": makeId, "year": year}, successCallback, errorCallback);
	};
	/**
	* Get a list of new model years of a particular vehicle by the model ID
	*
	* @method
	* @param int modelId The model ID
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getNewModelYearsByModelId = function(modelId, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelyearrepository/findnewmodelyearsbymodelid', {"modelId": modelId}, successCallback, errorCallback);
	};
	/**
	* Get a list of used model years of a particular vehicle by the model ID
	*
	* @method
	* @param int modelId The model ID
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getUsedModelYearsByModelId = function(modelId, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelyearrepository/findusedmodelyearsbymodelid', {"modelId": modelId}, successCallback, errorCallback);
	};
	/**
	* Get a list of model years of a particular vehicle by the vehicle's category and state (i.e. new, used or future)
	*
	* @method getModelYearsByCatAndState
	* @param string category The vehicle category (i.e. Sedan, suv, truck, ..etc)
	* @param string state The publication state (used|new|future)
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getModelYearsByCatAndState = function(category, state, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelyearrepository/findyearsbycategoryandpublicationstate', {"category": category, "state": state}, successCallback, errorCallback);
	};
	/**
	* Get a list of model years of a particular vehicle by the model's ID
	*
	* @method getModelYearsByModelId
	* @param int modelId The model id
	* @param function callback The callback function to be invoked when the response is returned (JSONP implementation)
	* @return {string} The URL of the REST call to Edmunds' API Service
	*/
	proto.getModelYearsByModelId = function(modelId, successCallback, errorCallback) {
		return this.invoke('/api/vehicle/modelyearrepository/formodelid', {"modelid": modelId}, successCallback, errorCallback);
	};
})();
(function(global) {
    'use strict';
    // define global namespace
    var EDM = global.EDM = global.EDM || {};


/**
 * Observable mixin
 * @class Observable
 * @namespace EDM
 * @example
 *     // create constructor
 *     var Widget = function() {
 *       // make the widget observable
 *       // Observable.call(Widget.prototype);
 *       Observable.call(this);
 *       // test method
 *       this.test = function(data) {
 *         this.trigger('test', data);
 *       }
 *     };
 *     // create new instance of the Widget
 *     var widget = new Widget();
 *     // add event listener
 *     widget.on('test', function(data) {
 *         console.log(data);
 *     });
 *     // test
 *     widget.test('lorem ipsum'); // => writes to console "lorem ipsum"
 * @return {Function}
 */
 EDM.Observable = (function() {

    /**
     * List of events
     * @property _events
     * @private
     * @type {Object}
     */
    var _events = {};

    /**
     * Binds a callback function to an object. The callback will be invoked whenever the event is fired.
     * @method on
     * @example
     *     // External usage example:
     *     widget.on('change:make', function(makeId) {
     *         // this code is executed when the change event is fired by the widget
     *     });
     *
     *     // Internal usage example:
     *     this.on('change:make', function(makeId) {
     *         // this code is executed when the change event is fired by the widget
     *     });
     * @param {String} event The event name
     * @param {Function} callback The callback function
     * @param {Object} [context] The context object
     * @chainable
     */
    function on(name, callback, context) {
        if (typeof name !== 'string' || name.length === 0) {
            throw new Error('The event name must be a string and not be empty.');
        }
        if (typeof callback !== 'function') {
            throw new Error('The callback must be a function.'); 
        }
        (_events[name] || (_events[name] = [])).push({
            callback: callback,
            context: context
        });
    }

    /**
     * Removes a previously-bound callback function from an object. If no event name is specified, all callbacks will be removed.
     * @method off
     * @example
     *     // External usage example:
     *     widget.off('change:make');
     *
     *     // Internal usage example:
     *     this.off('change:make');
     * @param {String} [event] The event name
     * @chainable
     */
    function off(name) {
        if (typeof name !== 'string' || name.length === 0) {
            _events = {};
            return this;
        }
        _events[name] = [];
    }

    /**
     * Trigger callbacks for the given event. Subsequent arguments to trigger will be passed along to the event callbacks.
     * @method trigger
     * @example
     *     this.trigger('change:make', makeId);
     * @param {String} event The event name
     * @param {Function} [arg*] The arguments
     * @chainable
     */
    function trigger(name) {
        var args, list, length, i, event;
        if (!name || !_events[name]) {
            return;
        }
        args = slice.call(arguments, 1);
        list = _events[name];
        length = list.length;
        for (i = 0; i < length; i++) {
            event = list[i];
            event.callback.apply(event.context, args);
        }
    }

    return function() {
        this.on = on;
        this.off = off;
        this.trigger = trigger;
        return this;
    };

}());

    // Utils
    /**
    * This module contains classes for running a store.
    * @class util
    * @example
    *
    * @namespace EDM
    */
    (function() {
        var util = EDM.Util = {},
            // prototypes
            arrayProto = Array.prototype,
            functionProto = Function.prototype,
            objectProto = Object.prototype,
            // shortcuts
            hasOwnProp = objectProto.hasOwnProperty,
            nativeBind = functionProto.bind,
            nativeIsArray = Array.isArray,
            nativeIndexOf = arrayProto.indexOf,
            slice = arrayProto.slice,
            toString = objectProto.toString;

        /**
         * Bind a function to an object.
         * @method bind
         * @param {Function} fn
         * @param {Object} obj
         * @return {Function}
         * @example
         *      var obj = {},           // Some object
         *          fn = function(){    // Some function
         *              return this;
         *          };
         *      EDM.Util.bind(fn, obj);
         */
        util.bind = function(fn, obj) {
            if (fn.bind === nativeBind && nativeBind) {
                return nativeBind.apply(fn, slice.call(arguments, 1));
            }
            return function() {
                return fn.apply(obj, slice.call(arguments));
            };
        };

        /**
         * Returns true if the value is present in the list.
         * @method contains
         * @param {Array} list
         * @param {Object} key
         * @return {Boolean}
         * @example
         *      var array = [96, 97, 98, 99, 100, 101, 102, 103, 104, 105], // Array
         *          key = 100;                                              // Numder or string
         *      EDM.Util.contains(array, key); // => true
         */
        util.contains = function(list, key) {
            var i, length;
            if (!util.isArray(list)) {
                return false;
            }
            if (nativeIndexOf && list.indexOf) {
                return list.indexOf(key) !== -1;
            }
            for (i = 0, length = list.length; i < length; i++) {
                if (list[i] === key) {
                    return true;
                }
            }
            return false;
        };

        /**
         * Copy all of the properties in the source objects over to the destination object.
         * @method extend
         * @param {Object} destination
         * @param {Object} source
         * @return {Object}
         * @example
         *      EDM.Util.extend(object1, object2);
         */
        util.extend = function(obj) {
            var args = slice.call(arguments, 1),
                length = args.length,
                i, source, prop;
            for (i = 0; i < length; i++) {
                source = args[i];
                for (prop in source) {
                    if (hasOwnProp.call(source, prop)) {
                        obj[prop] = source[prop];
                    }
                }
            }
            return obj;
        };

        /**
         * Returns true if object is an Array.
         * @method isArray
         * @param {Object} obj
         * @return {Boolean}
         * @example
         *      EDM.Util.isArray([1990, 1999, 1996, 2010]); // => true
         */
        util.isArray = nativeIsArray || function(obj) {
            return toString.call(obj) === '[object Array]';
        };

        util.isEmpty = function(source) {
            var prop;
            for (prop in source) {
                if (hasOwnProp.call(source, prop)) {
                    return false;
                }
            }
            return true;
        };

        /**
         * Renders options to HTMLSelectElement.
         * @method renderSelectOptions
         * @param {HTMLSelectElement} element
         * @param {Object} records
         * @param {Boolean} hasOptGroups
         * @return {HTMLSelectElement}
         * @example
         *      // for example element can be {HTMLSelectElement}
         *      EDM.Util.renderSelectOptions(element, {}, 'Select a Make');
         */
        util.renderSelectOptions = function(element, records, defaultText, hasOptGroups) {
            var fragment = document.createDocumentFragment(),
                key, optgroup, options, option;
            // clear inner html
            if (element.innerHTML) {
                element.innerHTML = '';
            }
            // add default option
            if (defaultText) {
                option = document.createElement('option');
                option.innerHTML = defaultText;
                option.setAttribute('value', '');
                element.appendChild(option);
            }
            // render option groups
            if (hasOptGroups === true) {
                for (key in records) {
                    optgroup = document.createElement('optgroup');
                    optgroup.setAttribute('label', key);
                    options = util.renderSelectOptions(optgroup, records[key]);
                    fragment.appendChild(optgroup);
                }
                element.appendChild(fragment);
                return element;
            }
            // render options
            for (key in records) {
                option = document.createElement('option');
                option.setAttribute('value', key);
                option.innerHTML = records[key];
                fragment.appendChild(option);
            }
            element.appendChild(fragment);
            return element;
        };

        /**
         * Finds and replaces all variables in template.
         * @method renderTemplate
         * @example
         *      EDM.Util.renderTemplate('<div><%= text %></div>', { text: 'test' }); // => <div>test</div>
         * @param {String} template
         * @param {Object} options
         * @return {String}
         */
        util.renderTemplate = function(text, options, useBraces) {
            var replacementsReg = useBraces ? /\{\{\s+\w+\s+\}\}/gi : /<%=\s+\w+\s+%>/gi,
                variableReg = useBraces ? /\{\{\s+|\s+\}\}/gi : /^<%=\s+|\s+%>$/gi,
                replacements, replacement, i, length, variableName;

            if (typeof text !== 'string') {
                throw new Error('template must be a string');
            }

            if (text.length === 0 || !options) {
                return text;
            }

            options = options || {};

            replacements = text.match(replacementsReg);
            length = replacements !== null ? replacements.length : 0;

            if (length === 0) {
                return text;
            }

            for (i = 0; i < length; i++) {
                replacement = replacements[i];
                variableName = replacement.replace(variableReg, '');
                text = text.replace(replacement, options[variableName]);
            }

            return text;
        };

    }());

    var $ = EDM.Util,
        slice = Array.prototype.slice,
        proto;

    /**
     * Base Widget Class
     * @constructor
     * @class Widget
     * @namespace EDM
     * @example
     *      // create new instance of the Widget
     *      var widget = new Widget();
     */
    var Widget = EDM.Widget = function(apiKey, options) {

        var
            /**
             * Vehicle API Key.
             * @property _apiKey
             * @private
             * @type {String}
             */
            _apiKey,

            /**
             * Base class name.
             * @property _baseClass
             * @private
             * @type {String}
             */
            _baseClass,

            /**
             * Base ID.
             * @property _baseId
             * @private
             * @type {String}
             */
            _baseId,

            /**
             * List of events.
             * @property _events
             * @private
             * @type {Object}
             */
            _events,

            /**
             * Base Options of widget.
             * @property _options
             * @private
             * @type {Object}
             */
            _options,

            /**
             * Root element of widget.
             * @property _rootElement
             * @private
             * @type {HTMLElement}
             */
            _rootElement;

        /**
         * Returns the API key.
         * @method getApiKey
         * @return {String}
         */
        this.getApiKey = function() {
            return _apiKey;
        };

        /**
         * Returns base class name.
         * @method getBaseClass
         * @return {String}
         */
        this.getBaseClass = function() {
            return _baseClass;
        };

        /**
         * Returns base Id.
         * @method getBaseId
         * @return {String}
         */
        this.getBaseId = function() {
            return _baseId;
        };

        /**
         * Returns a copy of the options to prevent the change.
         * @method getOptions
         * @return {Object}
         */
        this.getOptions = function() {
            return $.extend({}, _options);
        };

        /**
         * Returns a root element.
         * @method getRootElement
         * @return {Object}
         */
        this.getRootElement = function() {
            return _rootElement;
        };

        /**
         * Set a copy of the options to prevent the change.
         * @method setOptions
         * @return {Object}
         */
        this.setOptions = function(options) {
            _options = $.extend({}, _options, options);
        };

        /**
         * Configures the widget.
         * @private
         * @method _configure
         * @param {String} apiKey
         * @param {Object} options
         */
        function _configure(apiKey, options) {
            if (typeof apiKey !== 'string') {
                throw new Error('The API key must be a string.');
            }
            _apiKey = apiKey;
            this.setOptions(options);
            _baseClass = _options.baseClass || '';
            _baseId = 'edm' + new Date().getTime();
            // define root element
            _rootElement = document.getElementById(_options.root);
            if (_rootElement === null) {
                throw new Error('The root element was not found.');
            }
            _rootElement.className = _baseClass;
        }

        _configure.apply(this, arguments);

    };

    proto = Widget.prototype;

    proto.destroy = function() {
        var root = this.getRootElement();
        if (root !== null) {
            root.remove();
        }
    };

    EDM.Observable.call(proto);


}(this));