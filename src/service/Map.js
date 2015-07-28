/**
 * @class
 */
Ext.define('GXC.service.Map', {
    requires: [
        'GXC.Version'
    ],

    inject: [
        'appConfig',
        'layerStore'
    ],

    config: {
        map: null
    },

    constructor: function(config) {
        var appConfig = this.appConfig,
            projections = appConfig.get('projections', {}),
            mapOptions = appConfig.get('mapOptions', {});

        this.initConfig(config);

        // merge user provided projections into OpenLayers defaults
        Ext.Object.each(projections, function(key, props) {
            if (props.def) {
                Proj4js.defs[key] = props.def;
            }
            if (props.maxExtent || props.yx) {
                OpenLayers.Projection.defaults[key] = {
                    maxExtent: props.maxExtent,
                    yx: props.yx
                };
            }
        });

        mapOptions = Ext.apply({
            theme: null,            // we don't want openlayers styling
            fallThrough: true,      // bubble events to ext components
            allOverlays: true,      // no base layers
            fractionalZoom: true,   // user defined scale
            zoomMethod: null,       // zoom slider may get out of sync
            layers: [
                // a fake base layer that the projection will be read of
                new OpenLayers.Layer('gxc_base_', {
                    isBaseLayer: true,
                    displayInLayerSwitcher: false
                })
            ],
            controls: [
                // attribution as defined per layer
                new OpenLayers.Control.Attribution(),
                // no mouse wheel navigation due to bug
                new OpenLayers.Control.Navigation({
                    zoomWheelEnabled: false
                }),
                // allow to open map via center params
                new OpenLayers.Control.ArgParser()
            ]
        }, mapOptions);

        // center is always provided in EPSG:4326
        var center = new OpenLayers.LonLat(mapOptions.center);
        mapOptions.center = center.transform('EPSG:4326', mapOptions.projection);

        this.setMap(new OpenLayers.Map(mapOptions));
        this.addMousePositionControl();

        // bind the injected layer store to the map effectivly syncing layers.
        this.layerStore.bindMap(this.getMap());

        return this.callParent(arguments);
    },

    /**
     * Adds the custom mouse position control to the OpenLayers map object.
     */
    addMousePositionControl: function() {
        var displayProjection = this.map.displayProjection ||
                this.map.getProjection(),
            index = displayProjection.indexOf(':'),
            code = displayProjection,
            prefix = displayProjection,
            digits;

        if (index !== -1) {
            code = displayProjection.substring(index + 1);
            prefix = '<a target="_blank" href="http://epsg.io/' + code + '/">' +
                    displayProjection + '</a>: ';
        }

        digits = (new OpenLayers.Projection(displayProjection).getUnits() === 'm' ?
            2 : 5);

        this.map.addControl(new OpenLayers.Control.GXCMousePosition({
            prefix: prefix,
            separator: ' | ',
            numDigits: digits
        }));
    }
});
