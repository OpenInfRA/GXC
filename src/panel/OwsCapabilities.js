/**
 * A base class for OWS capabilities.
 */
Ext.define('GXC.panel.OwsCapabilities', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Ext.grid.plugin.RowExpander',
        'GXC.button.Button',
        'GXC.panel.OwsCapabilitiesViewController'
    ],

    controller: 'GXC.panel.OwsCapabilitiesViewController',

    mixins: [
        'GXC.plugin.SelectionMixin'
    ],

    alias: 'widget.gxc_panel_owscapabilities',

    txtAdd: 'Add..',
    txtAddLayers: 'Add',
    txtTitle: 'Title',
    txtName: 'Name',
    txtAbstract: '',

    service: null,

    selModel: {
        mode: 'MULTI'
    },

    initComponent: function() {
        var service = this.service;

        Ext.apply(this, {
            store: Ext.create(this.store, {
                url: service.get('url')
            }),
            columns: {
                items: [{
                    header: this.txtTitle,
                    dataIndex: 'title',
                    flex: 1
                }, {
                    header: this.txtName,
                    dataIndex: 'name',
                    flex: 1
                }],
                defaults: {
                    sortable: true
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
