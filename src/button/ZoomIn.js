/**
 * A simple Zoom-In button that can be added to toolbars.
 * Triggers the zoom event of the map.
 */
Ext.define('GXC.button.ZoomIn', {
    extend: 'GXC.button.OlButton',

    alias: 'widget.gxc_button_zoomin',

    inject: [
        'mapService'
    ],

    iconCls: 'gxc-icon-zoom-in',

    tooltip: 'Zoom in',

    /**
     * @inheritdoc
     */
    initComponent: function(config) {
        config = config || {};

        this.map = config.map || this.mapService.getMap();
        this.control = config.control || new OpenLayers.Control.ZoomIn();

        this.callParent(arguments);
    }
});
