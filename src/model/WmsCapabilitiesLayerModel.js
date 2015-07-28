/**
 * A convinience implementation of a WFS Capabilities model.
 * It preferes the {@link GXC.proxy.OwsProxy} over the GeoExt provided
 * proxy implementation.
 * It opts for WMS version 1.1.0 as default.
 *
 * The configured proxy defaults to GeoExt.data.reader.WmsCapabilities which
 * maps capabilities records to a flat table structure.
 */
Ext.define('GXC.model.WmsCapabilitiesLayerModel', {
    extend: 'GeoExt.data.WmsCapabilitiesLayerModel',

    proxy: {
        type: 'ajax',
        reader: 'gx_wmscapabilities',
        extraParams: {
            request: 'GetCapabilities',
            service: 'WMS',
            version: '1.1.0'
        }
    }
});
