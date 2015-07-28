/**
 * A service that allows to retrieve OWS capabilities.
 */
Ext.define('GXC.service.OwsCapabilities', {
    requires: [
        'Deft.promise.Deferred',
        'GXC.data.WfsCapabilitiesStore',
        'GXC.data.WmsCapabilitiesStore',
        'GXC.Cache'
    ],

    /**
     * If the the service should cache remote requests. Defaults to true.
     * @type {Boolean}
     */
    cached: true,

    /**
     * A cache that may be used to improve performance
     * interacting with many different layers from the same host.
     * @type {Object}
     */
    localCache: null,

    /**
     * @inheritdoc
     */
    constructor: function(config) {
        if (config === null) {
            config = {};
        }
        this.initConfig(config);

        // init the cache
        this.localCache = Ext.create('GXC.Cache');

        return this.callParent(arguments);
    },

    /**
     * Retrieves a layer by name from a capabilities response. Returns a promise
     * of the layer.
     *
     * @param  {String} name    Name of the layer.
     * @param  {String} url     Url of the ows service.
     * @param  {String} type    Type of the ows service.
     * @param  {String} version Version string supported by the ows service.
     * @return {Deft.Promise|OpenLayers.Layer}
     */
    loadLayer: function(name, url, type, version) {
        return this.loadCapabilities(url, type, version)
            .then(function(store) {
                var layer = store.getLayerBy('name', name);
                if (layer) {
                    return layer;
                }
                throw Error('Layer of name ' + name +
                    ' could not be retrieved from ' + type + ' with url ' + url);
            });
    },

    /**
     * Loads ows capabilities as defined by provided parameters.
     * @param  {String} url     The url of the ows service.
     * @param  {String} type    A string defining the type of the service (WMS,WFS).
     * @param  {String} version Version string the service supports.
     * @return {Deft.Promise}   A promise object resolving to the loaded store.
     */
    loadCapabilities: function(url, type, version) {
        var deferred = Q.defer(),
            store;

        // retrieve response from cache if any
        if (this.localCache.exist(url)) {
            return this.localCache.get(url);
        } else {
            this.localCache.set(url, deferred.promise);
        }

        type = type || 'WMS';

        // init instance
        store = this.getCapabilitiesStoreInstance(url, type);

        // set version of the ows service
        if (version) {
            store.getProxy().extraParams['version'] = version;
        }

        store.load({
            callback: function(records, operation, success) {
                if (success) {
                    deferred.resolve(store);
                } else {
                    deferred.reject('Error loading capabilities: ' + url);
                    this.localCache.remove(url);
                }
            },
            scope: this
        });

        return deferred.promise;
    },

    /**
     * Returns the appropriate OwsCapabilities implementation for a layer source
     * record.
     *
     * @param  {String} url     The url of the ows service.
     * @param  {String} type    The ows type the store should interact with.
     * @return {GXC.store.OwsStore}
     */
    getCapabilitiesStoreInstance: function(url, type) {
        var gxcClass;

        switch (type.toLowerCase()) {
            case 'wms':
                gxcClass = 'GXC.data.WmsCapabilitiesStore';
                break;
            case 'wfs':
                gxcClass = 'GXC.data.WfsCapabilitiesStore';
                break;
            default:
                Ext.Error.raise({
                    msg: 'OWS Type not supported.',
                    type: type
                });
        }

        return Ext.create(gxcClass, {
            url: url
        });
    }
});
