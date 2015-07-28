/**
 * A simple Zoom-Out button that can be added to toolbars.
 * Triggers the zoom event of the map.
 */
Ext.define('GXC.button.ZoomOut', {
    extend: 'GXC.button.OlButton',

    alias: 'widget.gxc_button_zoomout',

    inject: [
        'mapService'
    ],

    iconCls: 'gxc-icon-zoom-out',

    tooltip: 'Zoom out',

    /**
     * @inheritdoc
     */
    initComponent: function(config) {
        config = config || {};

        this.map = this.mapService.getMap();
        this.control = new OpenLayers.Control.ZoomOut();

        this.callParent(arguments);
    }
});
