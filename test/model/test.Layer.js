describe('GXC.model.Layer', function() {

    before(function() {
        Ext.syncRequire('GXC.model.Layer');
    });

    describe('#Layer', function() {
        it('should have inherited fields', function() {
            var layer = new OpenLayers.Layer.Vector('test'),
                model = GXC.model.Layer.createFromLayer(layer);

            expect(Ext.getClassName(model)).to.equal('GXC.model.Layer');
            expect(model.get('title')).to.equal('test');
        });

        it('should have added fields', function() {
            var layer = new OpenLayers.Layer.Vector('test', {
                    metadata: {
                        hideInLegend: false,
                        displayInOverview: true
                    }
                }),
                model = GXC.model.Layer.createFromLayer(layer);

            expect(model.get('hideInLegend')).to.be.false;
            expect(model.get('displayInOverview')).to.be.true;
        });
    });

    after(function() {
        Ext.undefine('GXC.model.Layer');
    });
});
