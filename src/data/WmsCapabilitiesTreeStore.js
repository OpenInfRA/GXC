Ext.define('GXC.data.WmsCapabilitiesTreeStore', {
    extend: 'Ext.data.TreeStore',
    requires: [
        'GXC.data.reader.WmsCapabilities'
    ],

    model: 'GXC.data.WmsCapabilitiesModel',

    proxy: {
        type: 'ajax',
        reader: {
            type: 'gxc_wmscapabilities',
            root: 'nestedLayers'
        },
        extraParams: {
            node: null,
            request: 'GetCapabilities',
            service: 'WMS'
        }
    }
});
