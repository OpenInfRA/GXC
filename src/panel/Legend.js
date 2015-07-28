/**
 * A simple legend component binding to the injected layer store.
 */
Ext.define('GXC.panel.Legend', {
    extend: 'GeoExt.panel.Legend',
    requires: [
        'GeoExt.container.UrlLegend',
        'GeoExt.container.VectorLegend',
        'GeoExt.container.WmsLegend'
    ],

    alias: 'widget.gxc_panel_legend',

    inject: [
        'layerStore'
    ],

    itemId: 'legend',

    initComponent: function() {
        Ext.apply(this, {
            layerStore: this.layerStore
        });

        this.callParent(arguments);
    }
});
