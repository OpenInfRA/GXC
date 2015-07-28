/**
 * A tree panel that allows interaction with layers of the map view.
 */
Ext.define('GXC.panel.Layer', {
    extend: 'GeoExt.tree.Panel',
    requires: [
        'Ext.tree.plugin.TreeViewDragDrop',
        'Ext.grid.column.Action',
        // see: http://www.sencha.com/forum/showthread.php?262124-Missed-(-)-dependency-reference-to-a-Ext.util.Point-in-Ext.EventObjectImpl
        'Ext.util.Point',
        'GXC.panel.LayerViewController'
    ],

    inject: [
        'layerTreeStore'
    ],

    controller: 'GXC.panel.LayerViewController',

    alias: 'widget.gxc_panel_layer',

    viewType: 'gx_treeview',

    cls: 'gxc-layer-tree',

    // configuration
    rootVisible: false,
    useArrows: true,
    enableColumnHide: false,
    enableColumnMove: false,
    sortableColumns: false,
    hideHeaders: true,

    viewConfig: {
        plugins: [{
            ptype: 'treeviewdragdrop'
        }]
    },

    initComponent: function() {
        var me = this;

        this.addEvents(
            /**
             * Fired when a getfeatureinfo control is requested for a layer.
             * @event
             */
            'getfeatureinfo',

            /**
             * Fired when a layer is to be deleted from the tree.
             * @event
             */
            'deletelayer'
        );

        this.store = this.layerTreeStore;

        if (!me.columns) {
            if (me.initialConfig.hideHeaders === undefined) {
                me.hideHeaders = true;
            }
            me.addCls(Ext.baseCSSPrefix + 'autowidth-table');
            me.columns = [{
                xtype    : 'gx_treecolumn',
                text     : 'Name',
                // width    : Ext.isIE6 ? null : 10000,
                flex: 1,
                dataIndex: me.displayField
            }, {
                itemId: 'actionColumn',
                xtype:'actioncolumn',
                dataIndex: 'layer',
                width: 50,
                items: [{
                    iconCls: 'gxc-icon-info',
                    tooltip: 'Supports GetFeatureInfo',
                    getClass: function(v, meta, rec) {
                        var layer = rec.get('layer');

                        if (layer && layer.metadata &&
                            layer.metadata.queryable) {
                            return 'gxc-icon-info';
                        } else {
                            return 'x-hide-display';
                        }
                    }
                }]
            }];
        }

        this.callParent(arguments);
    }
});
