/**
 * A Ext.data.reader.Json implementation to read WMS-Capabilities responses parsed
 * by Openlayers.Format.WMSCapabilities.
 * Instead of mapping nested WMS layers to a flat table structure, this reader
 * returns a tree structure of nested layers.
 */
Ext.define('GXC.data.reader.WmsCapabilities', {
    extend: 'Ext.data.reader.Json',

    alias: 'reader.gxc_wmscapabilities',

    /**
     * Creates new Reader.
     *
     * @param {Object} [config] Config object.
     */
    constructor: function(config) {
        this.callParent(arguments);

        if (!this.format) {
            this.format = new OpenLayers.Format.WMSCapabilities();
        }
    },

    /**
     * Gets the records.
     *
     * @param {Object} request The XHR object which contains the parsed XML
     *     document.
     * @return {Object} A data block which is used by an Ext.data.Store
     *     as a cache of Ext.data.Model objects.
     */
    getResponseData: function(request) {
        var data = request.responseXML;

        if(!data || !data.documentElement) {
            data = request.responseText;
        }

        if (Ext.isArray(data)) {
            return this.callParent(data);
        }

        if(typeof data === "string" || data.nodeType) {
            data = this.format.read(data);
        }

        if (!!data.error) {
            Ext.Error.raise({
                msg: "Error parsing WMS GetCapabilities",
                arg: data.error
            });
        }

        var root = data.capability.nestedLayers[0];
        root.root = true;

        return this.readRecords({
            layers: data.capability.layers,
            nestedLayers: root,
            metaData: {
                request: data.capability.request,
                exceptions: data.capability.exception,
                service: data.service,
                version: data.version
            }
        });
    },

    destroyReader: function() {
        if (this.format) {
            this.format.destroy();
            delete this.format;
        }
        this.callParent(arguments);
    }
});
