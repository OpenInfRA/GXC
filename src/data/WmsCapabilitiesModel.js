/**
 * The model for WMS layers coming from a WMS GetCapabilities document.
 */
Ext.define('GXC.data.WmsCapabilitiesModel', {
    extend: 'Ext.data.Model',

    alias: 'model.gxc_wmscapabilitiesmodel',

    /**
     * CSS class name for the attribution DOM elements.
     * Element class names append '-link', '-image', and '-title' as
     * appropriate.  Default is 'gx-attribution'.
     *
     * @cfg {String}
     */
    attributionCls: 'gxc-attribution',

    fields: [{
        name: 'title',
        type: 'string'
    }, {
        name: 'text',
        type: 'string',
        mapping: 'title'
    }, {
        name: 'legendURL',
        type: 'string'
    }, {
        name: 'hideTitle',
        type: 'bool'
    }, {
        name: 'hideInLegend',
        type: 'bool'
    }, {
        name: 'name',
        type: 'string'
    }, {
        name: 'abstract',
        type: 'string'
    }, {
        name: 'queryable',
        type: 'boolean'
    }, {
        name: 'opaque',
        type: 'boolean'
    }, {
        name: 'noSubsets',
        type: 'boolean'
    }, {
        name: 'cascaded',
        type: 'int'
    }, {
        name: 'fixedWidth',
        type: 'int'
    }, {
        name: 'fixedHeight',
        type: 'int'
    }, {
        name: 'minScale',
        type: 'float'
    }, {
        name: 'maxScale',
        type: 'float'
    }, {
        name: 'prefix',
        type: 'string'
    }, {
        name: 'attribution',
        type: 'string',
        convert: function(v, rec) {
            var markup = [],
                attrCls = rec.attributionCls,
                logoTmpl = '<img class="{0}-image" src="{1}" />',
                titleTmpl = '<span class="{0}-title">{1}</span>',
                hrefTempl = '<a class="{0}-link" href="{1}">{2}</a>',
                logoMarkup, titleMarkup, hrefMarkup;

            if (v.logo) {
                logoMarkup = Ext.String.format(logoTmpl, attrCls, v.logo.href);
                markup.push(logoMarkup);
            }
            if (v.title) {
                titleMarkup = Ext.String.format(titleTmpl, attrCls, v.title);
                markup.push(titleMarkup);
            }
            if (v.href){
                for(var i = 0; i < markup.length; i++){
                    hrefMarkup = Ext.String.format(hrefTempl, attrCls, v.href, markup[i]);
                    markup[i] = hrefMarkup;
                }
            }
            return markup.join(' ');
        }
    }, {
        name: 'formats'
    }, {
        name: 'infoFormats'
    }, {
        name: 'styles'
    }, {
        name: 'srs'
    }, {
        name: 'dimensions'
    }, {
        name: 'bbox'
    }, {
        name: 'llbbox'
    }, {
        name: 'keywords'
    }, {
        name: 'identifiers'
    }, {
        name: 'authorityURLs'
    }, {
        name: 'metadataURLs'
    }, {
        name: 'nestedLayers',
        defaultValue: [],
        convert: null
    }, {
        name: 'iconCls',
        type: 'string',
        convert: function(value, record) {
            return (record.get('name') ? 'gxc-icon-raster' : '');
        }
    }, {
        name: 'leaf',
        type: 'boolean',
        mapping: 'nestedLayers',
        convert: function(v) {
            return !(Ext.isArray(v) && v.length);
        }
    }],

    /**
     * Returns a new OpenLayers Layer that is created using the records
     * attributes or undefined of no real layer is derievable.
     * @return {OpenLayers.Layer} the ol layer
     */
    getLayer: function() {
        // guard clause to only return 'real' layers or undefined
        if (!this.get('name')) {
            return undefined
        }

        var meta = this.store.getProxy().getReader().metaData,
            exceptions = meta.exceptions ? meta.exceptions.formats : [],
            exceptions = this.serviceExceptionFormat(exceptions),
            format = this.imageFormat(),
            version = meta.version,
            transparent = this.imageTransparent(),
            metadata = this.getData();

        // we add meta information to the layer to allow
        // recreation of the layer from metadata or creation of
        // nested layers without recalling capabilities
        metadata['exceptions'] = exceptions;
        metadata['format'] = format;
        metadata['version'] = version;
        metadata['transparent'] = transparent;
        metadata['url'] = meta.request.getmap.href;

        // one may use service information like contact info
        metadata.service = Ext.clone(meta.service);

        var layerOptions = {
            singleTile: true,
            attribution: this.get('attribution'),
            metadata: metadata
        };

        console.log(this.get('minScale'));

        if (this.get('minScale')) {
            layerOptions.minScale = this.get('minScale');
        }
        if (this.get('maxScale')) {
            layerOptions.maxScale = this.get('maxScale');
        }

        return new OpenLayers.Layer.WMS(
            this.get('title') || this.get('name'),  // human readable title
            meta.request.getmap.href,               // url of wms service
            {                                       // extra wms params
                layers: this.get('name'),
                exceptions: exceptions,
                format: this.imageFormat(),
                transparent: this.imageTransparent(),
                version: meta.version
            },
            layerOptions
        );
    },

    /**
     * @param {String[]} formats An array of service exception format strings.
     * @return {String} The (supposedly) best service exception format.
     * @private
     */
    serviceExceptionFormat: function(formats) {
        if (OpenLayers.Util.indexOf(formats,
            'application/vnd.ogc.se_inimage')>-1) {
            return 'application/vnd.ogc.se_inimage';
        }
        if (OpenLayers.Util.indexOf(formats,
            'application/vnd.ogc.se_xml')>-1) {
            return 'application/vnd.ogc.se_xml';
        }
        return formats[0];
    },

    /**
     * @return {String} The (supposedly) best mime type for requesting
     *     tiles.
     * @private
     */
    imageFormat: function() {
        var formats = this.get('formats');
        if (this.get('opaque') &&
            OpenLayers.Util.indexOf(formats, 'image/jpeg')>-1) {
            return 'image/jpeg';
        }
        if (OpenLayers.Util.indexOf(formats, 'image/png')>-1) {
            return 'image/png';
        }
        if (OpenLayers.Util.indexOf(formats, 'image/png; mode=24bit')>-1) {
            return 'image/png; mode=24bit';
        }
        if (OpenLayers.Util.indexOf(formats, 'image/gif')>-1) {
            return 'image/gif';
        }
        return formats[0];
    },

    /**
     * @return {Boolean} The TRANSPARENT param.
     * @private
     */
    imageTransparent: function() {
        var opaque = this.get('opaque');
        return opaque == undefined || !opaque;
    }
});
