/**
 * Button that triggers a Geolocation control that allows to find ones
 * own position on the map. Uses the Html5 Geolocation API.
 */
Ext.define('GXC.button.Geolocate', {
    extend: 'GXC.button.OlButton',

    alias: 'widget.gxc_button_geolocate',

    /**
     * Component is injected with
     * * appConfig - to decorate the mouse control with a waiting icon
     * * mapService - to have access to the actual map
     * * notificationService - to proclaim errors
     * @cfg {Array}
     */
    inject: [
        'appConfig',
        'mapService',
        'notificationService'
    ],

    /**
     * The icon class of the button.
     * @cfg {String}
     */
    iconCls: 'gxc-icon-marker',

    /**
     * The buttons tooltip on mouseover.
     * @cfg {String}
     */
    tooltip: 'My Position',

    /**
     * Geolocation can be toggled.
     *
     * @inheritDoc
     */
    enableToggle: true,

    /**
     * Allows to untoggle the button by pressing the ESC key.
     * @cfg {Boolean}
     */
    untoggleByEsc: false,

    /**
     * The name of the layer that will be added to the OpenLayers map.
     * @cfg {String}
     */
    layerName: 'gx_geolocation',

    /**
     * Custom options that will be merged into the layers default options.
     * @cfg {Object}
     */
    layerOptions: null,

    /**
     * The notification title if an error occours during geolocation call.
     * @cfg {String}
     */
    txtErrorTitle: 'Geolocation error',

    /**
     * The notification body if an error occours during geolocation call.
     * @cfg {String}
     */
    txtError: 'Geolocation could not be retrieved',

    /**
     * @inheritdoc
     */
    initComponent: function(config) {
        config = config || {};

        this.map = config.map || this.mapService.getMap();
        this.control = config.control || new OpenLayers.Control.Geolocate({
            bind: false,
            geolocationOptions: {
                enableHighAccuracy: false,
                maximumAge: 0,
                timeout: 7000
            }
        });

        this.layer = new OpenLayers.Layer.Vector(this.layerName, Ext.apply({
            displayInLayerSwitcher: false
        }, this.layerOptions));

        this.callParent(arguments);
    },

    /**
     * @inheritdoc
     */
    onControlActivate: function() {
        this.control.events.on({
            'locationupdated': this.onLocationUpdate,
            'locationfailed': this.onLocationFailed,
            scope: this
        });

        // clear the layer of old positions if any
        this.layer.removeAllFeatures();

        // add it to the map with index insuring visibility
        this.map.addLayer(this.layer);
        this.map.setLayerIndex(this.layer, 99);

        // add css class to viewport to show status
        this.appConfig.getViewport().addCls('wait');

        this.callParent(arguments);
    },

    /**
     * @inheritDoc
     */
    onControlDeactivate: function() {
        this.control.events.un({
            'locationupdated': this.onLocationUpdate,
            'locationfailed': this.onLocationFailed,
            scope: this
        });

        this.map.removeLayer(this.layer);
        this.clearCursorClass();

        this.callParent(arguments);
    },

    /**
     * Called when the location is updated.
     * @param  {OpenLayers.Event} e The Event Object
     */
    onLocationUpdate: function(e) {
        var coords = e.position.coords,
            point = new OpenLayers.Geometry.Point(coords.longitude,
                coords.latitude),
            pointOSM = point.clone().transform('EPSG:4326', 'EPSG:900913'),
            accuracy = coords.accuracy,
            projection = this.map.getProjectionObject(),
            circle, polygon, layer, zoom;

        // polygon plotting accuracy of coordinates
        // calculation is in Spherical Mercator coordinates to be safe
        // using accuracy in meteric units
        polygon = new OpenLayers.Geometry.Polygon.createRegularPolygon(pointOSM,
            accuracy / 2, 40, 0);

        // make sure to transform features to maps actual projection
        point.transform('EPSG:4326', projection);
        polygon.transform('EPSG:900913', projection);

        // clear the layer of old positions if any
        this.layer.removeAllFeatures();

        this.layer.addFeatures([
            // position marker
            new OpenLayers.Feature.Vector(point, {}, {
                graphicName: 'cross',
                strokeColor: '#f00',
                strokeWidth: 2,
                fillOpacity: 0,
                pointRadius: 10
            }),
            // accuracy
            new OpenLayers.Feature.Vector(polygon, {}, {
                    fillColor: '#000',
                    fillOpacity: 0.1,
                    strokeWidth: 0
                }
            )
        ]);

        // center on position
        this.map.setCenter(this.layer.getDataExtent().getCenterLonLat());

        // remove waiting cursor
        this.clearCursorClass();
    },

    /**
     * Called when an error occured when retrieving the geolocation.
     */
    onLocationError: function() {
        this.notificationService.error(this.txtErrorTitle, this.txtError);
        this.clearCursorClass();
    },

    /**
     * Removes waiting cursor class from viewport div.
     */
    clearCursorClass: function() {
        this.appConfig.getViewport().removeCls('wait');
    }
});
