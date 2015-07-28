/**
 * Extends the {@link GeoExt.data.LayerTreeModel} to include GXC specific
 * fields for each layer.
 */
Ext.define('GXC.data.LayerTreeModel', {
    extend: 'GeoExt.data.LayerTreeModel',
    fields: [{
        name: 'name',
        type: 'string'
    }, {
        name: 'inRange',
        type: 'bool',
        defaultValue: true
    }, {
        name: 'inViewport',
        type: 'bool',
        defaultValue: true
    }, {
        name: 'loading',
        type: 'boolean',
        persist: false,
        defaultValue: false
    }, {
        name: 'iconCls',
        type: 'string',
        convert: function(v, record) {
            var layer = record.get('layer'),
                cls = '';

            if (layer) {
                cls += 'gxc-icon-layer';
            }

            if (layer.CLASS_NAME === 'OpenLayers.Layer.Vector') {
                cls += ' gxc-icon-vector';
            } else {
                if (layer.metadata && layer.metadata.nestedLayers &&
                    layer.metadata.nestedLayers.length) {
                    cls += ' gxc-icon-layer-group';
                } else {
                    cls += ' gxc-icon-raster';
                }
            }

            if (!record.supportsMapProjection()) {
                cls = 'gxc-icon-layer gxc-icon-error';
            }

            return cls;
        }
    }, {
        name: 'qtip',
        type: 'string',
        convert: function(v, record) {
            var text = '',
                layer = record.get('layer');

            if (!record.get('inRange')) {
                text += '<b>Layer is out of range.</b><br>';
            }
            if (!record.get('inViewport')) {
                text += '<b>Layer is out of the current map extent.</b><br>';
            }

            if (!record.supportsMapProjection()) {
                text += '<b>Layer does not support map projection.</b><br>';
            }

            if (layer && layer.metadata && layer.metadata['abstract']) {
                text += layer.metadata['abstract'];
            }

            return text;
        }
    }],

    /**
     * Overrides the models set function to auto-update qtip of the layer node.
     *
     * @param {String} fieldName
     * @param {Any} value
     */
    set: function(fieldName, value) {
        this.callParent(arguments);

        if (fieldName === 'inRange' || fieldName === 'inViewport') {
            this.set('qtip');
        }
    },

    /**
     * Helper method to check if layer supports the maps projection.
     * @return {Boolean} True if srs is supported.
     */
    supportsMapProjection: function() {
        var layer = this.get('layer'),
            supported = true;

        if (layer &&
            layer.metadata &&
            layer.metadata.srs &&
            !layer.metadata.srs[layer.map.getProjection()]) {
            supported = false;
        }

        return supported;
    }
});
