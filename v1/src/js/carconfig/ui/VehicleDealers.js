EDM.namespace('nvc').VehicleDealers = (function() {

    var // dependencies
        Observable = EDM.mixin.Observable,
        VehicleApi = EDMUNDSAPI.Vehicle,
        bind = EDM.util.Function.bind,
        template = EDM.template;

    function VehicleDealers(apiKey) {
        Observable.call(this);
        //this.initialize.apply(this, arguments);
        this.dealersChoiced = {};
        this.initialize(apiKey);
        this.bindEvents();
    }

    VehicleDealers.prototype = {

        initialize: function(apiKey) {
            this.vehicleApi = new VehicleApi(apiKey);
            this.template = template(this.template);
        },

        bindEvents: function() {
            this.off();
            this.on('choice-dealer', this.updateDealerList, this);
        },

        render: function(dealers) {
            var dealersList,
                length, id, name, i,
                me = this;
            if (dealers.length) {
                if (dealers.length === 1) {
                    dealers[0].checked = true;
                    this.addDealer(dealers[0]);
                    this.trigger('dealer-selected', this.dealersChoiced);
                }
                this.el.innerHTML = this.template({ dealers: dealers });
                this.trigger('dealers-available', true);
            } else {
                this.el.innerHTML = '<div class="loading">There are no dealers in our network that are located within your location.</div>';
                this.trigger('dealers-available', false);
            }
            dealersList = this.el.getElementsByTagName('input');
            length = dealersList.length;

            for (i = 0; i < length; i = i + 1) {
                dealersList[i].onchange = bindChangeEvent();
            }

            function bindChangeEvent(idElement, nameElement) {
                return function() {
                    me.trigger('choice-dealer', this);
                };
            }

            this.trigger('render');

            return this;
        },

        updateDealerList: function(element){
            var id = element.value,
                name = element.title;

            this[element.checked ? 'addDealer' : 'removeDealer']({id: id, name: name});
            this.trigger('dealer-selected', this.dealersChoiced);
        },

        removeDealer: function(options){
            if (this.dealersChoiced.hasOwnProperty(options.id)) {
                delete this.dealersChoiced[options.id];
            }
        },

        addDealer: function (options) {
            var opt;

            if (this.dealersChoiced.hasOwnProperty(options.id)) {
                delete this.dealersChoiced[options.id];
            }

            this.dealersChoiced[options.id] = {
                id: options.id,
                name: options.name
            };
        },

        loadDealers: function(root, options) {
            var successCallback = bind(this.onDealersLoad, this),
                errorCallback = bind(this.onDealersLoadError, this),
                makeName = options.makeName,
                model = options.model,
                styleid = options.styleId,
                zipcode = options.zipcode,
                radius = options.radius,
                rows = options.rows,
                isPublic = options.isPublic,
                bookName = options.bookName,
                apikey = options.apikey,
                keywords = encodeKeywords(options.keywords || []).join(','),
                premierOnly = options.premierOnly;

            function encodeKeywords(keywords) {
                var result = [],
                    length = keywords.length,
                    i = 0,
                    keyword;
                for ( ; i < length; i++) {
                    keyword = encodeURIComponent(decodeURIComponent(keywords[i]));
                    result.push(keyword);
                }
                return result;
            }

            this.el = root;
            this.options = options;

            this.el.innerHTML = '<div class="loading">Loading dealers...</div>';
            this.dealersChoiced = {};
            this.vehicleApi.getDealersList(makeName, model, styleid, zipcode, radius, rows, isPublic, bookName, keywords, premierOnly, successCallback, errorCallback);
        },

        onDealersLoad: function(response) {
            if (response.error) {
                return this.onDealersLoadError();
            }
            var dealers = this.parseDealers(response);
            this.trigger('dealersLoad');
            this.render(dealers);
        },

        onDealersLoadError: function() {
            this.el.innerHTML = '<div class="loading"><p>The dealers have not been loaded.</p><p>Please press the "Update" button to reload dealers.</p></div>';
            return this;
        },

        parseDealers: function(response) {
            var dealers = [], i, item, length,
                rating, review, ratingFull,
                dealersList = response.dealerHolder;

            if (dealersList){
                length = dealersList.length;
                for (i = 0; i < length; i = i + 1) {
                    item = dealersList[i];
                    if (item.ratings.SALES_OVERALL_RATING){
                        rating = parseInt(item.ratings.SALES_OVERALL_RATING, 10);
                        ratingFull = parseFloat(item.ratings.SALES_OVERALL_RATING);
                        review = parseInt(item.ratings.SALES_RECOMMENDED_REVIEW_COUNT, 10) + parseInt(item.ratings.SALES_NOT_RECOMMENDED_REVIEW_COUNT, 10);
                    } else {
                        rating = 0;
                        ratingFull = 0;
                        review = 0;
                    }
                    var fractal = (ratingFull - rating).toPrecision(1);
                    if (fractal >= 0.7) {
                        rating ++;
                    } else if (fractal >= 0.3) {
                        rating += '_5';
                    }

                    dealers.push({
                        id:         item.id,
                        name:       item.name,
                        logicalName:item.logicalName,
                        state:      item.address.stateName.replace(/ /g, ''),
                        city:       item.address.city.replace(/ /g, ''),
                        address:    item.address.city + ', ' + item.address.stateCode + ' ' + item.address.zipcode,
                        phone:      item.contactinfo.phone.split(', ').slice(0,1).join(', '),
                        distance:   parseFloat(item.displayinfo.dealer_distance).toFixed(2),
                        rating:     rating,
                        ratingFull: ratingFull,
                        review:     review,
                        checked:    false
                    });
                }
            }
            return dealers;
        },

        reset: function() {
            this.el.innerHTML = '';
        },

        template: [
            '<div class="list">',
            '<% for (var i = 0, length = dealers.length; i < length; i++) { %>',
                '<div class="item">',
                    '<input type="checkbox" value="<%= dealers[i].id %>" title="<%= dealers[i].name %>" name="dealers"<% if (dealers[i].checked) { %> checked="checked"<% } %>>',
                    '<div class="info">',
                        '<span class="name"><%= dealers[i].name %></span>',
                        '<span class="map"><span><%= dealers[i].distance %> mi</span><%= dealers[i].address %> <a href="http://www.edmunds.com/dealerships/<%= dealers[i].state %>/<%= dealers[i].city %>/<%= dealers[i].logicalName %>/" target="_blank"></a></span>',
                        '<span class="phone"><%= dealers[i].phone %></span>',
                        '<span class="rating r<%= dealers[i].rating %>" title="<%= dealers[i].ratingFull %>"></span>',
                        '<span class="reviews">',
                            '(<a href="http://www.edmunds.com/dealerships/<%= dealers[i].state %>/<%= dealers[i].city %>/<%= dealers[i].logicalName %>/sales.1.html" target="_blank"><%= dealers[i].review %> consumer review<% if (dealers[i].review > 1) { %>s<% } %></a>)',
                        '</span>',
                    '</div>',
                '</div>',
            '<% } %>',
            '</div>'
        ].join('')

    };

    return VehicleDealers;

}());