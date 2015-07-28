/**
 * Extends the {@link GeoExt.data.LayerModel} to include application specific
 * fields for each layer.
 *
 * @class
 */
Ext.define('GXC.model.Layer', {
    extend: 'GeoExt.data.LayerModel',
    fields: [{
        name: 'displayInOverview',
        type: 'boolean',
        mapping: 'metadata.displayInOverview',
        defaultValue: false
    }]
});
