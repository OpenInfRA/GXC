/**
 * A simple panel that allows to drop feature text files like GML that will be
 * loaded as layers to the map.
 */
Ext.define('GXC.panel.LayerFileDrop', {
    extend: 'Ext.Component',
    requires: [
        'GXC.plugin.FileDrop'
    ],

    inject: [
        'appContext'
    ],

    alias: 'widget.gxc_panel_layerfiledrop',

    plugins: [{
        ptype: 'filedrop',
        readType: 'Text'
    }],

    cls: 'gxc-layerfiledrop',

    tpl: '<div><div>' +
            '<span>{msg}</span><br>' +
            '<span><small>{formats}</small></span>' +
         '</div></div>',

    statics: {
        isSupported: function() {
            return (window.File && window.FileReader && window.FileList && window.Blob);
        }
    },

    txtDefaultLayerName: 'unnamed',
    txtNotSupported: 'File API unsupported.',
    txtDropFile: 'Drop file here.',
    txtSupportedFormats: '(*.gml, *.kml, *.[geo]json, *.osm)',
    txtProgress: 'Loading..',
    txtParsingFile: 'Parsing File',

    supportedFormats: [{
        parser: 'GML',
        extensions: ['gml']
    }, {
        parser: 'KML',
        extensions: ['kml']
    }, {
        parser: 'GeoJSON',
        extensions: ['json', 'geojson']
    }, {
        parser: 'OSM',
        extensions: ['osm']
    }],

    initComponent: function() {
        this.data = {
            msg: this.txtDropFile,
            formats: this.txtSupportedFormats
        };

        this.addEvents('layerloaded');

        this.on({
            beforeread: this.onBeforeRead,
            loadstart: this.onLoadProgress,
            progress: this.onLoadProgress,
            loadend: this.onLoadEnd,
            loadabort: this.onLoadAbort,
            loaderror: this.onLoadError,
            scope: this
        });

        this.callParent();
    },

    /**
     * Parses the file format matching the file extension with
     * this components supportedFormats.
     * Parses an appropiate layer name using the file name without
     * an extensions. Dots are replaced with underscores.
     * If the extension is not supported, the files property
     * olFormat is set to false.
     */
    parseFileFormat: function(file) {
        var fileName = file.name || '',
            fileNameArr = fileName.split('.'),
            extension = fileNameArr.pop().toLowerCase(),
            formats = this.supportedFormats,
            length = formats.length,
            format = false;

        for (var i = 0; i < length; i++) {
            if (formats[i].extensions.indexOf(extension) > -1) {
                format = formats[i].parser;
                break;
            }
        }

        return Ext.apply(file, {
            olFormat: format,
            olLayerName: fileNameArr.join('_') || 'unnamed'
        });
    },

    parseLayer: function(result, file) {
        var format = file.olFormat,
            parser, features, layer;

        if (format) {
            parser = new OpenLayers.Format[format]();
            features = parser.read(result);
            layer = new OpenLayers.Layer.Vector(file.olLayerName);
            layer.addFeatures(features);

            this.appContext.fileLayerLoaded(layer);
        }
    },

    /**
     * Parses the file format aborting the process of loading a file
     * if the format is unsupported.
     */
    onBeforeRead: function(cmp, file) {
        this.parseFileFormat(file);

        if (!file.olFormat) {
            return false;
        }
    },

    onLoadProgress: function(cmp, e) {
        var progress = Math.ceil((e.loaded / e.total) * 100);
        this.setLoading({
            msg: this.txtProgress + ' ' + progress + '%'
        });
    },

    onLoadEnd: function(cmp, e, file) {
        this.setLoading({
            msg: this.txtParsingFile
        });

        this.parseLayer(e.target.result, file);

        this.setLoading(false);
    },

    onLoadAbort: function() {
        this.setLoading(false);
    },

    onLoadError: function() {
        this.setLoading(false);
    }
});
