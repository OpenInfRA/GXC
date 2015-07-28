/**
 * Triggers a OpenLayers WMSGetFeatureInfo control that can be used to query
 * for feature information.
 */
Ext.define('GXC.button.SelectFeature', {
    extend: 'GXC.button.OlButton',
    requires: [
        'Ext.grid.property.Grid',
        'GeoExt.window.Popup'
    ],

    alias: 'widget.gxc_button_selectfeature',

    /**
     * Component is injected with mapService and notificationService.
     *
     * @cfg {Array}
     */
    inject: [
        'appConfig',
        'mapService'
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
    iconCls: 'gxc-icon-vector-info',

    /**
     * The tooltip for this button.
     * @type {String}
     */
    tooltip: 'Select Feature',

    /**
     * Switch to determine if a boxselection is in progress.
     *
     * @type {Boolean}
     * @private
     */
    boxselection: false,

    initComponent: function() {
        this.map = this.mapService.getMap();

        this.control = new OpenLayers.Control.SelectFeature([], {
            box: true,
            multiple: true,
            clickout: true,
            toggle: true,
            eventListeners: {
                boxselectionstart: this.onBoxSelectionStart,
                boxselectionend: this.onBoxSelectionEnd,
                scope: this
            },
            onSelect: this.onSelect,
            scope: this
        });

        this.callParent(arguments);
    },

    onEnable: function() {
        var map = this.mapService.getMap(),
            layers = map.layers,
            query = [],
            layer;

        for (var i = 0; i < layers.length; i++) {
            layer = layers[i];
            if (layer.getVisibility() &&
                layer.CLASS_NAME === 'OpenLayers.Layer.Vector') {
                query.push(layers[i]);
            }
        }

        this.control.setLayer(query);

        map.div.style.cursor = 'help';

        this.callParent(arguments);
    },

    onDisable: function() {
        var map = this.mapService.getMap();

        this.control.unselectAll();

        map.div.style.cursor = 'auto';

        this.callParent(arguments);
    },

    onBoxSelectionStart: function() {
        this.boxselection = true;
    },

    onBoxSelectionEnd: function(e) {
        var layers = e.layers,
            features = [];

        Ext.Array.each(layers, function(layer) {
            features.push.apply(features, layer.selectedFeatures);
        }, this);

        this.showPropertiesWindow(features);

        this.boxselection = false;
    },

    onSelect: function(feature) {
        if (!this.boxselection) {
            this.showPropertiesWindow([feature]);
        }
    },

    showPropertiesWindow: function(features) {
        var featureItems = [];

        Ext.each(features, function(feature) {
            var sourceConfig = {};

            Ext.Object.each(feature.attributes, function(key) {
                sourceConfig[key] = {
                    editor: Ext.create('Ext.form.DisplayField')
                };
            });

            console.log(feature);

            featureItems.push({
                xtype: 'propertygrid',
                title: feature.fid,
                source: feature.attributes,
                sourceConfig: sourceConfig
            });
        });

        if (featureItems.length > 0) {
            Ext.create('Ext.window.Window', {
                title: 'Properties',
                width: 300,
                height: 250,
                layout: 'accordion',
                items: featureItems
            }).show();
        }
    }
});
