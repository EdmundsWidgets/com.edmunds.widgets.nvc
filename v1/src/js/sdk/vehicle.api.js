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