define(['dealers/collection/dealers'], function(Dealers) {

    describe('dealers/collection/dealers', function() {

        describe('getSelectedIds', function() {

            it('should return a list of ids', function() {
                var dealers = new Dealers([
                    { id: 4, selected: true },
                    { id: 3 },
                    { id: 2, selected: true },
                    { id: 1 }
                ]);
                expect(dealers.getSelectedIds()).toEqual([4, 2]);
            });

        });

    });

});