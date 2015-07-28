describe('GXC.service.OwsCapabilities', function() {
    var service,
        url = 'http://localhost';

    before(function() {
        Ext.syncRequire([
            'GXC.service.OwsCapabilities'
        ]);
    });

    it('should be instantiable', function() {
        var fn = function() {
            service = Ext.create('GXC.service.OwsCapabilities');
        };
        expect(fn).to.not.throw(Error);
    });

    it('should not be cached if cache is not injected', function() {
        expect(service.cached).to.be.false;
    });

    describe('#getCapabilitiesStoreInstance', function() {
        var store;

        var fn = function(type) {
            store = service.getCapabilitiesStoreInstance(url, type);
        };

        it('should return correct wms capabilities store instances', function() {
            expect(fn.bind(this, 'wms')).to.not.throw(Error);
            expect(Ext.getClassName(store)).to.equal('GXC.store.WmsCapabilities');
            expect(store.getProxy().url).to.equal(url);
        });

        it('should return correct wfs capabilities store instances', function() {
            expect(fn.bind(this, 'wfs')).to.not.throw(Error);
            expect(Ext.getClassName(store)).to.equal('GXC.store.WfsCapabilities');
            expect(store.getProxy().url).to.equal(url);
        });

        afterEach(function() {
            store = null;
        });
    });

    describe('#loadCapabilities (WMS)', function() {
        it('should load wms capabilities', function() {
            return service.loadCapabilities('resources/wmsCapabilities.xml', 'wms', '1.0.0')
                .should.eventually.be.fulfilled;
        });

        it('should hand over a wms capabilities store', function() {
            service.loadCapabilities('resources/wmsCapabilities.xml', 'wms', '1.0.0')
                .then(function(store) {
                    expect(Ext.getClassName(store)).to.equal('GXC.store.WmsCapabilities');
                    expect(store.getCount()).to.equal(22);
                })
                .catch(function(error) {
                    throw error;
                })
                .done();
        });
    });

    describe('#loadCapabilities (WFS)', function() {
        it('should load wfs capabilities', function() {
            return service
                .loadCapabilities('resources/wfsCapabilities.xml', 'wfs', '1.3.0')
                .should.eventually.be.fulfilled;
        });

        it('should hand over a wfs capabilities store', function() {
            return service
                .loadCapabilities('resources/wfsCapabilities.xml', 'wfs', '1.3.0')
                .then(function(store) {
                    expect(Ext.getClassName(store)).to.equal('GXC.store.WfsCapabilities');
                    expect(store.getCount()).to.equal(14);
                })
                .catch(function(error) {
                    throw error;
                })
                .done();
        });
    });
});
