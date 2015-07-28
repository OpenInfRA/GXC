/**
 * Store that holds the data of a layer tree.
 */
Ext.define('GXC.data.LayerTreeStore', {
    extend: 'Ext.data.TreeStore',
    requires: [
        'GeoExt.tree.LayerLoader',
        'GeoExt.tree.LayerContainer'
    ],

    inject: [
        'layerStore'
    ],

    model: 'GXC.data.LayerTreeModel',

    constructor: function() {
        this.root = {
            plugins: [{
                ptype: 'gx_layercontainer',
                loader: Ext.create('GeoExt.tree.LayerLoader', {
                    store: this.layerStore
                })
            }],
            expanded: true
        };

        this.callParent(arguments);
    }
});
