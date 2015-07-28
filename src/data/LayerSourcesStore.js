/**
 * Basic store that is ought to load layer sources on startup.
 * Right now it only loads static information from a provided file rather
 * dynamic content.
 *
 * @class
 */
Ext.define('GXC.data.LayerSourceStore', {
    extend: 'Ext.data.Store',

    inject: [
        'appConfig'
    ],

    model: 'GXC.model.LayerSource',

    proxy: {
        type: 'memory',
        reader: 'json'
    },

    constructor: function(config) {
        this.initConfig(config || {});

        var sources = this.appConfig.get('layers', []);

        // read initial layers from app config if not provided via store config.
        Ext.applyIf(this, {
            data: sources.reverse()
        });

        return this.callParent(arguments);
    }
});
