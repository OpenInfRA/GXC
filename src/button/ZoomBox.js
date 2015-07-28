/**
 * An abstract base class for buttons that handle OpenLayers measurement controls.
 */
Ext.define('GXC.button.ZoomBox', {
    extend: 'GXC.button.OlButton',

    alias: 'widget.gxc_button_zoombox',

    inject: [
        'mapService'
    ],

    enableToggle: true,

    /**
     * Default toggle group for gxc interactions.
     * @cfg {String}
     */
    toggleGroup: 'gxc_interaction',

    iconCls: 'gxc-icon-zoom-to-box',

    tooltip: 'Zoom to extent',

    /**
     * @inheritdoc
     */
    initComponent: function(config) {
        config = config || {};

        this.map = config.map || this.mapService.getMap();
        this.control = config.control || new OpenLayers.Control.ZoomBox({
            alwaysZoom: true
        });

        this.callParent(arguments);
    },

    onEnable: function() {
        var map = this.mapService.getMap();

        map.div.style.cursor = 'crosshair';

        this.callParent(arguments);
    },

    onDisable: function() {
        var map = this.mapService.getMap();

        map.div.style.cursor = 'auto';

        this.callParent(arguments);
    }
});
