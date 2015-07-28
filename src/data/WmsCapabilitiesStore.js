/**
 * Extends the {@link GeoExt.data.WfsCapabilitiesLayerStore} by using our provided
 * {@link GXC.model.WfsCapabilitiesLayerModel}.
 */
Ext.define('GXC.data.WmsCapabilitiesStore', {
    extend: 'GeoExt.data.WmsCapabilitiesLayerStore',

    model: 'GXC.model.WmsCapabilitiesLayerModel',

    /**
     * Returns an OpenLayers.Layer if property is found in capabilities.
     * @param  {String} property
     * @return {OpenLayers.Layer|undefined}
     */
    getLayerBy: function(property, value) {
        var idx = this.findExact(property, value),
            layer;

        if (idx > -1) {
            layer = this.getAt(idx).getLayer().clone();
        }

        return layer;
    }
});
