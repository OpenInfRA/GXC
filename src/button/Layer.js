/**
 * Allows to open a menu to add new layers to the map view.
 */
Ext.define('GXC.button.Layer', {
    extend: 'GXC.button.ViewDelegator',
    requires: [
        'GXC.panel.Layer',
        'GXC.panel.LayerFileDrop'
    ],

    alias: 'widget.gxc_button_layer',

    tooltip: 'Add Layer',

    iconCls: 'gxc-icon-add',

    txtWindowTitle: 'Add Layer',
    txtServiceTabTitle: 'OWS Service',
    txtFileTabTitle: 'Local vector file',

    initComponent: function() {
        this.dConfig = {
            title: this.txtWindowTitle,
            width: 600,
            height: 500,
            layout: 'fit',
            items: [{
                xtype: 'tabpanel',
                items: [{
                    xtype: 'gxc_panel_add',
                    title: this.txtServiceTabTitle
                }, {
                    xtype: 'gxc_panel_layerfiledrop',
                    title: this.txtFileTabTitle
                }]
            }]
        };

        this.callParent(arguments);
    }
});
