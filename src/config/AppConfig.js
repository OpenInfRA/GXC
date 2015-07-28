/**
 * Central application configuration provider.
 * This service reads the provided GXC_ENV variable and seeds the client
 * configuration from it.
 */
Ext.define('GXC.config.AppConfig', {
    statics: {
        DEMO_ENV: {
            endpoints: {},
            defaults: {
                suffix: '.json'
            }
        }
    },

    config: {
        /**
         * The environment the application is running in.
         * @type {Object}
         */
        environment: null
    },

    /**
     * Configures the application, particularly the endpoints used for server requests.
     * @param {Object} config A configuration object. Most importent setting is
     * environment, which may be an object defining the applications environment
     * or a String of the named environment provided by this class. Environment
     * defaults to GXC.config.AppConfig.DEMO_ENV
     */
    constructor: function(config) {
        this.setEnvironment(config.environment);

        this.parseUrlParams();
        this.initState();

        // set up the proxy host for non-same origin requests
        OpenLayers.ProxyHost = this.getProxyHost();
        if (this.getProxyHost() && this.getProxyHost() !== '') {
            Ext.Ajax.on({
                beforerequest: this.onBeforeRequest,
                scope: this
            });
        }
    },

    /**
     * Generic getter for configuration items.
     * @param  {String} key          The key of config item.
     * @param  {Any} defaultValue    Default config.
     * @return {Any}                 The config item retrieved.
     */
    get: function(key, defaultValue) {
        var value = this.getEnvironment()[key];
        return (value !== undefined ? value : defaultValue);
    },

    /**
     * Shortcut to retrieve the proxy host address if any.
     * @return {String}
     */
    getProxyHost: function() {
        var me = this;

        return this._proxyHost || (function() {
            var config = me.get('proxy');
            if (config && config.host) {
                me._proxyHost = config.host;
            } else {
                me._proxyHost = '';
            }
            return me._proxyHost;
        })();
    },

    /**
     * Gets the container the applications viewport is rendered in.
     * @return {Ext.Element} The container.
     */
    getContainer: function() {
        var domId = this.get('targetId');
        return Ext.get(domId);
    },

    /**
     * Convenience function to get Viewport.
     * @return {Ext.Component} The ExtJS viewport.
     */
    getViewport: function() {
        var domId = this.get('targetId');
        return Ext.get(domId) || Ext.get('viewport');
    },

    /**
     * Parses provided params from search string of window location setting
     * it onto the environments configuration.
     */
    parseUrlParams: function() {
        var params = Ext.urlDecode(location.search, true);

        if (params.srs) {
            this.environment.mapOptions.projection = params.srs;
        }
    },

    initState: function() {
        var stateLayers = Ext.state.Manager.get('gxc-sources') || [],
            configLayer = this.environment.layers,
            candidate, selectLayer;

        if (stateLayers && stateLayers.length) {
            candidate = Ext.Array.findBy(configLayer, function(item) {
                if (item.select && item.select.featureId) {
                    return true;
                }
            }, this);

            if (candidate) {
                selectLayer = Ext.Array.findBy(stateLayers, function(item) {
                    if (item.layer === candidate.layer && item.type === candidate.type) {
                        return true;
                    }
                }, this);
                if (selectLayer) {
                    selectLayer.select = candidate.select;
                } else {
                    stateLayers.push(candidate);
                }
            }

            this.environment.layers = stateLayers.reverse();
        }
    },

    /**
     * Event handler for Ext.Ajax requests that prepends the configured proxy
     * host if necessary.
     * @param  {Object} conn    The connection that will be used.
     * @param  {Object} options
     */
    onBeforeRequest: function(conn, options) {
        var origin = window.location.origin,
            requestUrl = options.url,
            proxyHost;

        if (!requestUrl.startsWith(origin)) {
            proxyHost = this.getProxyHost();
            options.url = proxyHost + options.url;
        }
    }
});
