/**
 * @class
 */
Ext.define('GXC.panel.WmsCapabilities', {
    extend: 'Ext.tree.Panel',
    requires: [
        'Ext.data.TreeStore',
        'GXC.data.reader.WmsCapabilities',
        'GXC.data.WmsCapabilitiesModel',
        'GXC.panel.WmsCapabilitiesViewController',
        'GXC.plugin.SelectionMixin'
    ],

    alias: 'widget.gxc_panel_wmscapabilities',

    controller: 'GXC.panel.WmsCapabilitiesViewController',

    mixins: [
        'GXC.plugin.SelectionMixin'
    ],

    /**
     * The service that capabilities will be retrieved for.
     * @type {GXC.model.Service}
     */
    service: null,

    txtAdd: 'Add..',
    txtAddLayers: 'Add',
    txtTitle: 'Title',
    txtName: 'Name',

    /**
     * @inheritDoc
     */
    initComponent: function() {
        var service = this.service,
            store = Ext.create(Ext.data.TreeStore, {
                model: 'GXC.data.WmsCapabilitiesModel',
                proxy: {
                    type: 'ajax',
                    url: service.get('url'),
                    reader: {
                        type: 'gxc_wmscapabilities',
                        root: 'nestedLayers'
                    },
                    extraParams: {
                        node: null,
                        request: 'GetCapabilities',
                        service: 'WMS',
                        version: service.get('version')
                    }
                }
            });

        Ext.apply(this, {
            store: store,
            columns: {
                items: [{
                    xtype: 'treecolumn',
                    text: this.txtTitle,
                    dataIndex: 'title'
                }, {
                    text: this.txtName,
                    dataIndex: 'name'
                }],
                defaults: {
                    sortable: false,
                    flex: 1
                }
            },
            tbar: {
                items: [{
                    xtype: 'button',
                    text: this.txtAddLayers,
                    itemId: 'addButton',
                    disabled: true
                }]
            }
        });

        this.callParent(arguments);
    }
});
