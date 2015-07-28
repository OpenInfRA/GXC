/**
 * Simple model representing layers that are loaded on application startup.
 * Model holds minimum required information to construct an
 * {@link GXC.model.LayerModel} on startup.
 */
Ext.define('GXC.model.LayerSource', {
    extend: 'Ext.data.Model',

    // TODO: this may not work if layer names are equal
    idProperty: {
        name: 'id',
        type: 'string',
        convert: function(v, record) {
            return record.get('type') + record.get('url') + record.get('layer');
        }
    },

    fields: [{
        name: 'url',
        type: 'string',
        convert: function(v) {
            var urlParts = v.split('?'),
                url = urlParts[0] + '?',
                owsParams = ['version', 'request', 'service', 'typename'],
                params;

            if (urlParts.length > 1) {
                params = Ext.Object.fromQueryString(urlParts[1]);
                Ext.Array.each(Ext.Object.getKeys(params), function(key) {
                    if (Ext.Array.indexOf(owsParams, key.toLowerCase()) !== -1) {
                        delete params[key];
                    }
                    url += Ext.Object.toQueryString(params);
                });
            }

        return url;
        }
    }, {
        name: 'type',
        type: 'string',
        defaultValue: 'WMS'
    }, {
        name: 'version',
        type: 'string',
        defaultValue: '1.0.0'
    }, {
        name: 'layer',
        type: 'string'
    }, {
        name: 'opacity',
        type: 'number',
        defaultValue: 1.0
    }, {
        name: 'visibility',
        type: 'boolean',
        defaultValue: true
    }, {
        name: 'isBaseLayer',
        type: 'boolean',
        defaultValue: false
    }, {
        // if of a feature that will be selected on startup
        name: 'select'
    }, {
        name: 'displayInOverview',
        type: 'boolean',
        defaultValue: false
    }]
});
