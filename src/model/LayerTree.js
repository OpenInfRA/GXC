/**
 * Model representing layer tree nodes in a tree view.
 * It extends the {@link GeoExt.data.LayerTreeModel} to present the loading
 * state of the underlaying OpenLayers Layer.
 */
Ext.define('GXC.model.LayerTree', {
    extend: 'GeoExt.data.LayerTreeModel',

    fields: [{
        name: 'name',
        type: 'string'
    }, {
        name: 'prefix',
        mapping: 'metadata.prefix',
        convert: function(v, record) {
            if (v === record.get('name')) {
                return '';
            } else {
                return v;
            }
        }
    }, {
        name: 'loading',
        type: 'boolean',
        persist: false,
        defaultValue: false
    }, {
        name: 'query',
        type: 'boolean',
        persist: false,
        defaultValue: false
    }],

    /**
     * After calling the parent constructor this implementation binds to
     * the "loading" events of the records underlaying Layer instance.
     */
    constructor: function() {
        this.callParent(arguments);

        var layer = this.get('layer');

        // used to trigger the spinner load icon in the tree when underlaying
        // layer is retrieving new data
        if (layer) {
            if (layer.loading) {
                this.set('loading', true);
            }
            layer.events.on({
                'loadstart': this.setLoading,
                'loadend': this.unsetLoading,
                scope: this
            });
        }
    },

    /**
     * Remove added event listeners.
     */
    destroy: function() {
        var layer = this.get('layer');

        if (layer) {
            layer.events.un({
                'loadstart': this.setLoading,
                'loadend': this.unsetLoading,
                scope: this
            });
        }

        this.callParent(arguments);
    },

    setLoading: function() {
        this.set('loading', true);
    },

    unsetLoading: function() {
        this.set('loading', false);
    }
});
