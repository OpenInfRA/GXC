/**
 * Triggers a OpenLayers WMSGetFeatureInfo control that can be used to query
 * for feature information.
 */
Ext.define('GXC.button.FeatureInfo', {
    extend: 'GXC.button.OlButton',
    requires: [
        'Ext.grid.property.Grid',
        'Ext.layout.container.Accordion',
        'GeoExt.window.Popup'
    ],

    alias: 'widget.gxc_button_featureinfo',

    /**
     * Component is injected with mapService and notificationService.
     *
     * @cfg {Array}
     */
    inject: [
        'mapService',
        'notificationService'
    ],

    /**
     * Allows the toggling of the underlying OL control.
     *
     * cfg {Boolean} enableToggle
     */
    enableToggle: true,

    /**
     * Default toggle group for gxc interactions.
     * @cfg {String}
     */
    toggleGroup: 'gxc_interaction',

    /**
     * The GXC icon class for this button.
     *
     * @cfg {String} iconCls
     */
    iconCls: 'gxc-icon-info',

    /**
     * The tooltip for this button.
     * @type {String}
     */
    tooltip: 'WMS Feature Info',

    txtNoInfoTitle: 'WMS feature info',
    txtNoInfo: 'No WMS feature info available at this position',

    initComponent: function() {
        this.map = this.mapService.getMap();

        this.control = new OpenLayers.Control.WMSGetFeatureInfo({
            drillDown: true,
            queryVisible: false,
            infoFormat: 'application/vnd.ogc.gml',
            vendorParams: {
                'EXCEPTIONS': 'application/vnd.ogc.se_xml'
            },
            maxFeatures: 3,
            eventListeners: {
                nogetfeatureinfo: this.noGetFeatureInfoHandler,
                getfeatureinfo: this.getFeatureInfoHandler,
                scope: this
            }
        });

        this.callParent(arguments);
    },


    onEnable: function() {
        var map = this.mapService.getMap(),
            layers = map.layers,
            query = [],
            layer;

        this._highlightLayer = new OpenLayers.Layer.Vector("_gxc_highlight", {
            displayInLayerSwitcher: false,
            isBaseLayer: false
            }
        );

        map.addLayer(this._highlightLayer);

        for (var i = 0; i < layers.length; i++) {
            layer = layers[i];
            if (layer.getVisibility() && layer.metadata.queryable) {
                query.push(layers[i]);
            }
        }

        this.control.layers = query;
        map.div.style.cursor = 'help';

        this.callParent(arguments);
    },

    onDisable: function() {
        var map = this.mapService.getMap();

        map.div.style.cursor = 'auto';

        map.removeLayer(this._highlightLayer);
        this._highlightLayer.destroy();
        delete this._highlightLayer;

        this.callParent(arguments);
    },

    noGetFeatureInfoHandler: function() {
        if (this._popup && this._popup.isVisible()) {
            this._popup.close();
        }

        if (this._highlightLayer) {
            this._highlightLayer.destroyFeatures();
        }

        this.notificationService.error(this.txtNoInfoTitle, this.txtNoInfo);
    },

    getFeatureInfoHandler: function(e) {
        var featureItems = [],
            features = e.features,
            map = this.mapService.getMap(),
            projection = map.getProjection(),
            extent = map.getExtent();

        if (this._popup && this._popup.isVisible()) {
            this._popup.close();
        }

        this._highlightLayer.destroyFeatures();

        Ext.each(features, function(feature) {
            // naive workaround to check for geometries returned
            // in other projection that requested
            // geoserver always returns EPSG:4326
            var geom = feature.geometry;
            if (geom &&
                !geom.getBounds().intersectsBounds(extent)) {
                feature.geometry = geom.transform('EPSG:4326', projection);
            }
            featureItems.push({
                xtype: 'propertygrid',
                title: feature.fid,
                source: feature.attributes
            });
        });

        this._highlightLayer.addFeatures(features);
        console.log(this._highlightLayer);
        this._highlightLayer.redraw();

        if (featureItems.length > 0) {
            this._popup = Ext.create('GeoExt.window.Popup', {
                title: 'Feature Info',
                width: 400,
                height: 300,
                layout: 'accordion',
                map: e.object.map,
                location: e.xy,
                items: featureItems
            }).show();
        }
    }
});
