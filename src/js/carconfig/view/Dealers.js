EDM.namespace('view').Dealers = Backbone.View.extend({

    events: {
        'click .tab': 'onTabClick'
    },

    selectedDealers: [],

    initialize: function(options) {
        this.premierDealers = new EDM.view.dealers.List({
            collection: new EDM.collection.Dealers()
        });
        this.allDealers = new EDM.view.dealers.List({
            collection: new EDM.collection.Dealers()
        });
        this.premierDealers.on('change', this.onPremierChange, this);
        this.allDealers.on('change', this.onAllChange, this);
        this.searchCriteria = new EDM.model.dealers.SearchCriteria();
        this.searchCriteria.on('change', this.findDealers, this);
        this.searchCriteria.on('change:makeName', this.onMakeChange, this);
    },

    isGMC: function() {
        return this.searchCriteria.get('makeName') === 'GMC';
    },

    onMakeChange: function(searchCriteria, makeName) {
        var isGMC = makeName === 'GMC';
        this.$('.tab[data-tab-id="all"]')[isGMC ? 'show' : 'hide']();
        this.showTabById('premier');
    },

    findDealers: function() {
        this.findPremierDealers();
        if (this.isGMC()) {
            this.findAllDealers();
        }
        return this;
    },

    findAllDealers: function() {
        var me = this;
        this.searchCriteria.set('premierOnly', false, { silent: true });
        return this.allDealers.collection
            .fetch({
                data:       this.searchCriteria.toJSON(),
                dataType:   'jsonp',
                timeout:    7000,
                reset:      true
            })
            .done(_.bind(this.onFindAllDealersDone, this))
            .fail(_.bind(this.onFindAllDealersFail, this));
    },

    findPremierDealers: function() {
        this.searchCriteria.set('premierOnly', true, { silent: true });
        return this.premierDealers.collection
            .fetch({
                data:       this.searchCriteria.toJSON(),
                dataType:   'jsonp',
                timeout:    7000,
                reset:      true
            })
            .done(_.bind(this.onFindPremierDealersDone, this))
            .fail(_.bind(this.onFindPremierDealersFail, this));
    },

    render: function() {
        this.$('.tab-panel-premier').html(this.premierDealers.render().el);
        this.$('.tab-panel-all').html(this.allDealers.render().el);
        return this;
    },

    onFindPremierDealersDone: function() {
        this.selectedDealers = this.premierDealers.collection.setSelected(this.selectedDealers);
    },

    onFindPremierDealersFail: function() {
        this.premierDealers.collection.reset();
    },

    onFindAllDealersDone: function() {
        this.selectedDealers = this.allDealers.collection.setSelected(this.selectedDealers);
    },

    onFindAllDealersFail: function() {
        this.premierDealers.collection.reset();
    },

    onTabClick: function(event) {
        var currentTab = $(event.currentTarget),
            activeClass = 'active';
        if (currentTab.hasClass(activeClass)) {
            return;
        }
        this.showTabById(currentTab.data('tabId'));
    },

    showTabById: function(id) {
        var activeClass = 'active';
        this.$('.tab')
            .removeClass(activeClass)
            .filter('[data-tab-id="' + id + '"]')
                .addClass(activeClass);
        this.$('.tab-panel')
            .removeClass(activeClass)
            .filter('.tab-panel-' + id)
                .addClass(activeClass);
        return this;
    },

    onAllChange: function(dealer, selected) {
        var dealerId = dealer.get('id'),
            premierDealer = this.premierDealers.collection.get(dealerId);
        if (premierDealer) {
            premierDealer.set('selected', selected);
        }
        if (selected) {
            this.selectedDealers = _.union(this.selectedDealers, [dealerId]);
        } else {
            this.selectedDealers = _.without(this.selectedDealers, dealerId);
        }
        this.trigger(selected ? 'select' : 'deselect', dealer);
    },

    onPremierChange: function(premierDealer, selected) {
        var premierDealerId = premierDealer.get('id'),
            dealer = this.allDealers.collection.get(premierDealerId);
        if (dealer) {
            dealer.set('selected', selected);
        }
        if (selected) {
            this.selectedDealers = _.union(this.selectedDealers, [premierDealerId]);
        } else {
            this.selectedDealers = _.without(this.selectedDealers, premierDealerId);
        }
        this.trigger(selected ? 'select' : 'deselect', premierDealer);
    },

    getSelected: function() {
        var dealers = new EDM.collection.Dealers(),
            filter = function(dealer) {
                return dealer.get('selected');
            };
        dealers.add(this.allDealers.collection.filter(filter));
        dealers.add(this.premierDealers.collection.filter(filter));
        return dealers;
    },

    reset: function() {
        this.selectedDealers = [];
        this.allDealers.collection.reset();
        this.premierDealers.collection.reset();
        this.searchCriteria.unset('makeName', { silent: true });
        return this;
    }

});
