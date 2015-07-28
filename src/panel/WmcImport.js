Ext.define('GXC.panel.WmcImport', {
    extend: 'Ext.form.Panel',
    requires: [
        'GXC.form.WmcImportViewController'
    ],

    controller: 'GXC.form.WmcImportViewController',

    alias: 'widget.gxc_panel_wmcimport',

    bodyPadding: '10px',

    layout: 'fit',

    /**
     * The OpenLayers format the WMC document will be read with.
     * @type {OpenLayers.Format.WMC}
     */
    format: null,

    initComponent: function() {
        var items = [{
                itemId: 'wmcField',
                fieldLabel: 'WMC document',
                labelAlign: 'top',
                xtype: 'textarea'
            }],
            bbar = [{
                itemId: 'loadButton',
                disabled: true,
                text: 'Load'
            }, {
                itemId: 'clearButton',
                text: 'Clear'
            }];

        Ext.apply(this, {
            items: items,
            bbar: bbar,
            format: new OpenLayers.Format.WMC()
        });

        this.callParent(arguments);
    }
});
