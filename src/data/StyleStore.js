/**
 * A simple store of GXC.model.Style instances.
 */
Ext.define('GXC.data.StyleStore', {
    extend: 'Ext.data.Store',
    model: 'GXC.model.Style',
    proxy: {
        type: 'memory',
        reader: 'json'
    }
});
