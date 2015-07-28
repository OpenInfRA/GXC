/**
 * A convinience implementation of a WFS Capabilities model.
 * It preferes the {@link GXC.proxy.OwsProxy} over the GeoExt provided
 * proxy implementation.
 * It opts for WFS version 1.0.0 as default.
 *
 * @class
 */
Ext.define('GXC.model.WfsCapabilitiesLayerModel', {
    extend: 'GeoExt.data.WfsCapabilitiesLayerModel',
    requires: [
        'GXC.data.reader.WfsCapabilities'
    ],

    proxy: {
        type: 'ajax',
        reader: 'gxc_data_reader_wfscapabilities',
        extraParams: {
            request: 'GetCapabilities',
            service: 'WFS',
            version: '1.0.0'
        }
    }
});
