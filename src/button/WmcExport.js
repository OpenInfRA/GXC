/**
 * A button that allows to export the added WMS-Layers of the map view to
 * WMC format.
 */
Ext.define('GXC.button.WmcExport', {
    extend: 'GXC.button.Button',

    inject: [
        'mapService'
    ],

    alias: 'widget.gxc_button_wmcexport',

    /**
     * The GXC icon class.
     * @cfg {String}
     */
    iconCls: 'gxc-icon-wmc',

    /**
     * The OpenLayers format to write WMC documents.
     * @type {OpenLayers.Format.WMC}
     */
    format: null,

    tooltip: 'Export WMS layers as WMC document',

    initComponent: function() {
        this.format = new OpenLayers.Format.WMC();

        this.callParent(arguments);
    },

    handler: function() {
        var map = this.mapService.getMap(),
            text = this.format.write(map),
            blob = new Blob([text], {
            type: 'text/xml;charset=utf-8'
        });
        saveAs(blob, 'map.wmc');
    },

    destroy: function() {
        this.format.destroy();

        this.callParent(arguments);
    }
});
