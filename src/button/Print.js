/**
 * A button control to open a floating overview map.
 * The overview mirrors active layers of the map view.
 */
Ext.define('GXC.button.Print', {
    extend: 'GXC.button.ViewDelegator',
    requires: [
        'GeoExt.data.MapfishPrintProvider'
    ],

    inject: [
        'appConfig'
    ],

    alias: 'widget.gxc_button_print',

    iconCls: 'gxc-icon-print',

    tooltip: 'Print',

    txtWindowTitle: 'Print Map',

    /**
     * The base url of the print service. It will be retrieved from the application
     * configuration by key 'printBaseUrl'.
     *
     * @cfg {String}
     */
    printUrl: null,

    /**
     * The print provider that will be init when the button is rendered.
     * Capabilities will be retrieved from the url set in the configuration
     * object.
     * @type {GeoExt.data.MapFishPrintProvider}
     */
    printProvider: null,

    initComponent: function() {
        var me = this,
            printUrl = this.printUrl || this.appConfig.get('printBaseUrl');

        this.printProvider = Ext.create('GeoExt.data.MapfishPrintProvider', {
            autoLoad: true,
            url: printUrl
        });

        this.dConfig = {
            title: this.txtWindowTitle,
            layout: 'fit',
            width: 300,
            items: [{
                xtype: 'gxc_panel_print',
                printProvider: this.printProvider
            }]
        };

        this.callParent(arguments);
    }
});
