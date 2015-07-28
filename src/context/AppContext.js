/**
 * Fire events related to the Layer UI, which other objects can respond to.
 */
Ext.define('GXC.context.AppContext', {
    mixins: {
        observable: 'Ext.util.Observable'
    },

    /**
     * Available UI modi
     */
    statics: {
        UI_MODE_SIMPLE: 1,
        UI_MODE_ADVANCED: 2,
        UI_MODE_ADMIN: 3
    },

    config: {
        /**
         * Active ui mode.
         * Defaults to 'simple' on startup.
         */
        uiMode: null
    },

    /**
     * Constructor.
     */
    constructor: function(config) {
        if (config === null) {
            config = {};
        }
        this.mixins.observable.constructor.call(this);
        this.initConfig(config);
        this.callParent(arguments);
    },

    /**
     * Notifies interested objects that the map has been loaded.
     */
    mapIsReady: function(mapPanel, width, height) {
        /**
         * @event mapready Maps boxready has been seen.
         */
        this.fireEvent('mapready', mapPanel, width, height);
    },

    /**
     * Notifies interested objects that initial data has been loaded.
     */
    initialDataLoaded: function() {
        /**
         * @event initialDataLoaded Initial data loaded.
         */
        this.fireEvent('initialdataloaded');
    },

    addLayer: function(layer) {
        this.fireEvent('addlayer', layer);
    },

    fileLayerLoaded: function(layer) {
        this.fireEvent('filelayerloaded', layer);
    },

    /**
     * Notifies interested objects that initial data has been loaded.
     */
    showServiceCapabilities: function(service) {
        /**
         * @event initialDataLoaded Initial data loaded.
         */
        this.fireEvent('showservicecapabilities', service);
    },

    zoomToExtent: function(extent) {
        /**
         * @event zoomtoextent About to zoom listening map views to this extent.
         */
         this.fireEvent('zoomtoextent', extent);
    }
});
