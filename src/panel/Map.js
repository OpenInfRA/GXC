/**
 * The main map panel that retrieves the map configuration from an injected
 * map service.
 */
Ext.define('GXC.panel.Map', {
    extend: 'GeoExt.panel.Map',
    requires: [
        'GXC.panel.MapViewController',
        'GeoExt.slider.Zoom',
        'GeoExt.slider.Tip'
    ],

    alias: 'widget.gxc_panel_map',

    inject: [
        'mapService'
    ],

    controller: 'GXC.panel.MapViewController',

    cls: 'gxc-panel-map',

    stateful: true,
    stateId: 'gxcMap',

    initComponent: function() {
        var map = this.mapService.getMap();

        if (this.center) {
            map.setCenter(this.center, this.zoom);
        }

        Ext.apply(this, {
            map: this.mapService.getMap(),
            items: [{
                xtype: 'gx_zoomslider',
                aggressive: true,
                vertical: true,
                height: 150,
                maxHeight: 150,
                maxWidth: 15,
                x: 10,
                y: 20,
                plugins: Ext.create('GeoExt.slider.Tip', {
                    getText: function(thumb) {
                        var slider = thumb.slider,
                            map = slider.map,
                            out = '<div>Zoom Level: {0}</div>' +
                                  '<div>Resolution: {1}</div>' +
                                  '<div>Scale: 1 : {2}</div>',
                            zoom, resolution, scale;

                            zoom = map.getZoom();
                            resolution = map.getResolution();
                            scale = map.getScale();

                        return Ext.String.format(out,
                            Math.round(zoom * 10) / 10,
                            resolution,
                            Math.round(scale)
                        );
                    }
                })
            }]
        });
        this.callParent(arguments);
    }
});
