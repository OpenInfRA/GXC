/**
 * Basic extend of the {@link GeoExt.data.LayerStore} that opts for the GXC
 * provided {@link GXC.model.Layer} model.
 */
Ext.define('GXC.data.LayerStore', {
    extend: 'GeoExt.data.LayerStore',
    requires: [
        'GXC.model.Layer'
    ],
    model: 'GXC.model.Layer',

    listeners: {
        /**
         * Persists layer state to Local Storage.
         *
         * @inheritDoc
         */
        add: function(store, records, index) {
            Ext.state.Manager.set('gxc-sources', this.convertToSources());
        },

        /**
         * Persists layer state to Local Storage.
         *
         * @inheritDoc
         */
        remove: function(store, record, index) {
            Ext.state.Manager.set('gxc-sources', this.convertToSources());
        }
    },

    /**
     * Converts the state of the store to an array of GXC.model.LayerSource
     * configurations.
     * Temporary layers are not persisted.
     *
     * @return {[Object]}
     */
    convertToSources: function() {
        var sources = [];

        this.each(function(record) {
            var layer = record.getLayer(),
                raster = layer.CLASS_NAME === 'OpenLayers.Layer.WMS';

            if (!layer.displayInLayerSwitcher || (!raster && !layer.protocol)) {
                return;
            }

            sources.push({
                url: layer.url || layer.protocol.url,
                type: raster ? 'WMS' : 'WFS',
                version: raster ? layer.params['VERSION'] : layer.protocol.version,
                layer: layer.metadata.name,
                visibility: layer.getVisibility(),
                opacity: layer.opacity
            });
        });

        return sources;
    }
});
