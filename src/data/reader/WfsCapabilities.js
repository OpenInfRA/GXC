/**
 * An Ext.data.reader implementation to read WFS capabilities responses.
 * It inherits from GeoExt.data.reader.WfsCapabilities to add more metadata
 * to the returned data structure.
 */
Ext.define('GXC.data.reader.WfsCapabilities', {
    extend: 'GeoExt.data.reader.WfsCapabilities',

    alias: 'reader.gxc_data_reader_wfscapabilities',

    inject: [
        'mapService'
    ],

    /**
     * Create a data block containing Ext.data.Records from an XML document.
     *
     * @param {DOMElement/String/Object} data A document element or XHR
     *     response string. As an alternative to fetching capabilities data
     *     from a remote source, an object representing the capabilities can
     *     be provided given that the structure mirrors that returned from the
     *     capabilities parser.
     * @return  {Object} A data block which is used by an Ext.data.Store
     *     as a cache of Ext.data.Model objects.
     * @private
     */
    readRecords: function(data) {
        if (data instanceof Ext.data.ResultSet) {
            // we get into the readRecords method twice,
            // called by Ext.data.reader.Reader#read:
            // check if we already did our work in a previous run
            return data;
        }

        if(typeof data === "string" || data.nodeType) {
            data = this.format.read(data);
        }

        var projection = this.mapService.getMap().getProjection();

        var featureTypes = data.featureTypeList.featureTypes;
        var fields = this.getFields();

        var featureType, metadata, field, v, parts, layer;
        var layerOptions, protocolOptions;

        var wfs11version = 1.1,
            url,
            opMeta;
        if (parseFloat(data.version) >= wfs11version) {
            // WFS 1.1.0 needs special treatment
            opMeta = data.operationsMetadata;
            url = opMeta && opMeta.GetFeature.dcp.http.post[0].url;
        } else {
            url = data.capability.request.getfeature.href.post;
        }

        var protocolDefaults = {
            url: url
        };

        var records = [];

        for(var i=0, lenI=featureTypes.length; i<lenI; i++) {
            featureType = featureTypes[i];
            if(featureType.name) {
                metadata = {};

                for(var j=0, lenJ=fields.length; j<lenJ; j++) {
                    field = fields[j];
                    v = featureType[field.name];
                    metadata[field.name] = v;
                }

                metadata['name'] = featureType.name;
                metadata['featureNS'] = featureType.featureNS;
                metadata['operationsMetadata'] = opMeta;

                protocolOptions = {
                    version: data.version,
                    srsName: projection,
                    featureType: featureType.name,
                    featureNS: featureType.featureNS
                };
                if(this.protocolOptions) {
                    Ext.apply(protocolOptions, this.protocolOptions,
                        protocolDefaults);
                } else {
                    Ext.apply(protocolOptions, {}, protocolDefaults);
                }

                layerOptions = {
                    metadata: metadata,
                    protocol: new OpenLayers.Protocol.WFS(protocolOptions),
                    strategies: [new OpenLayers.Strategy.Fixed()],
                    projection: projection
                };
                var metaLayerOptions = this.getLayerOptions();
                if (metaLayerOptions) {
                    Ext.apply(layerOptions, Ext.isFunction(metaLayerOptions) ?
                        metaLayerOptions() : metaLayerOptions);
                }

                layer = new OpenLayers.Layer.Vector(
                    featureType.title || featureType.name,
                    layerOptions
                );

                records.push(layer);
            }
        }
        return Ext.data.reader.Json.prototype.readRecords.call(this, records);
    }
});
