/**
 * Zooms to the maximum extent of the map or to zoom level 0 if no layer is
 * visible.
 */
Ext.define('GXC.button.ZoomToMaxExtent', {
    extend: 'GXC.button.Button',

    alias: 'widget.gxc_button_zoomtomaxextent',

    inject: [
        'layerStore',
        'mapService'
    ],

    iconCls: 'gxc-icon-zoom-extent',

    tooltip: 'Zoom to max extent',

    handler: function() {
        var map = this.mapService.getMap(),
            store = this.layerStore,
            bounds = new OpenLayers.Bounds();

        store.each(function(rec) {
            var layer = rec.getLayer()
            if (layer.displayInLayerSwitcher && layer.getVisibility()) {
                if (layer.getMaxExtent) {
                    bounds.extend(layer.getMaxExtent());
                } else {
                    bounds.extend(layer.getDataExtent());
                }
            }
        });

        if (bounds.toBBOX() === '0,0,0,0') {
            map.zoomTo(0);
        } else {
            map.zoomToExtent(bounds);
        }
    }
});
