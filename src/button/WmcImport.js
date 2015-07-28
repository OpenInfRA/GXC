/**
 * Opens a panel that allows to import WMS-Layers from a WMC-format.
 */
Ext.define('GXC.button.WmcImport', {
    extend: 'GXC.button.Button',
    requires: [
        'GXC.panel.WmcImport'
    ],

    inject: [
        'mapService'
    ],

    alias: 'widget.gxc_button_wmcimport',

    /**
     * The GXC icon class.
     * @cfg {String}
     */
    iconCls: 'gxc-icon-wmc-import',

    /**
     * The OpenLayers format to write WMC documents.
     * @type {OpenLayers.Format.WMC}
     */
    format: null,

    tooltip: 'Import WMS layers as WMC document',

    initComponent: function() {
        this.format = new OpenLayers.Format.WMC();

        this.callParent(arguments);
    },

    handler: function() {
        Ext.create('Ext.window.Window', {
            layout: 'fit',
            width: 400,
            height: 400,
            items: [{
                xtype: 'gxc_panel_wmcimport'
            }]
        }).show();
    },

    destroy: function() {
        this.format.destroy();

        this.callParent(arguments);
    }
});
