describe('GXC.panel.Print', function() {
    var printCapabilities = {
            "scales": [{
                "name": "1:50",
                "value": "50.0"
            }, {
                "name": "1:500",
                "value": "500.0"
            }],
            "dpis": [{
                "name": "75",
                "value": "75"
            }],
            "outputFormats": [{
                "name": "jpg"
            }, {
                "name": "tiff"
            }],
            "layouts": [{
                "name": "A3",
                "map": {
                    "width": 900,
                    "height": 650
                },
                "rotation": true
            }, {
                "name": "A4",
                "map": {
                    "width": 350,
                    "height": 440
                },
                "rotation": true
            }],
            "printURL": "http://localhost:8080/geoserver/pdf/print.pdf",
            "createURL": "http://localhost:8080/geoserver/pdf/create.json"
        },
        panel;

    var initPanel = function() {
        panel = Ext.create('GXC.panel.Print', {
            capabilities: printCapabilities,
            renderTo: Ext.getBody()
        });
    };

    before(function() {
        Ext.DomHelper.append(Ext.getBody(), '<div id="map">')
        Deft.Injector.configure({
            appConfig: 'GXC.config.AppConfig',
            layerStore: 'GXC.store.Layer',
            mapService: 'GXC.service.Map'
        });
    });

    it('should be initializable', function() {
        expect(initPanel).to.not.throw(Error);
        expect(panel).to.exist;
        expect(Ext.ComponentQuery.query('gxc_panel_print')).to.have.length(1);
    });

    after(function() {
        Deft.Injector.reset();
    });
});
