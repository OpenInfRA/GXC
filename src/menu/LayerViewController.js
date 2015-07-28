/**
 * The view control of the GXC.menu.Layer class.
 *
 * It maps interaction with the context menu to higher class actions like
 * opening the style editor or exporting layer data.
 */
Ext.define('GXC.menu.LayerViewController', {
    extend: 'Deft.mvc.ViewController',
    requires: [
        'GXC.panel.StyleEditor'
    ],

    inject: [
        'appConfig',
        'layerService',
        'layerStore'
    ],

    control: {
        'serviceInfo': {
            live: true,
            listeners: {
                'click': 'onServiceInfoClick'
            }
        },
        'metadata': {
            live: true,
            listeners: {
                'click': 'onMetadataClick'
            }
        },
        'style': {
            live: true,
            listeners: {
                'click': 'onStyleClick'
            }
        },
        'attributesButton': {
            live: true,
            listeners: {
                'click': 'onAttributesButtonClick'
            }
        },
        'raiseLayer': {
            'click': 'onRaiseLayerClick'
        },
        'lowerLayer': {
            'click': 'onLowerLayerClick'
        },
        'maxExtent': {
            'click': 'onMaxExtentClick'
        },
        'remove': {
            'click': 'onRemoveClick'
        },
        'exportLayer': {
            live: true,
            listeners: {
                'select': 'onExportLayerSelect'
            }
        }
    },

    /**
     * Shows provided contact information of a layer.
     */
    onServiceInfoClick: function() {
        var layer = this.getView().layer,
            contactInfo = layer.metadata.service.contactInformation,
            tpl = new Ext.XTemplate(
                '<p><b>{personPrimary.person}</b> ({position})</p>',
                '<p>{contactAddress.email}</p>',
                '<p>',
                    '{personPrimary.organization}<br>',
                    '{contactAddress.address}<br>',
                    '{contactAddress.postcode} {contactAddress.city}<br>',
                    '{contactAddress.stateOrProvince}<br>',
                    '{contactAddress.country}<br>',
                '</p>'
            );

            Ext.create('Ext.window.Window', {
                title: 'Contact: ' + layer.name,
                bodyPadding: '5px',
                html: tpl.apply(contactInfo),
                autoShow: true
            });
    },

    /**
     * Opens the metadata url if provided.
     */
    onMetadataClick: function() {
        var meta = this.getView().layer.metadata.metadataURLs;

        if (meta.length > 0) {
            window.open(meta[0].href, '_blank');
        }
    },

    /**
     * Opens an editable attributes table of the layers features.
     */
    onAttributesButtonClick: function() {
        var layer = this.getView().layer;
        this.layerService.editLayer(layer);
    },

    /**
     * Calls the layer service to raise the selected layer.
     */
    onRaiseLayerClick: function() {
        var layer = this.getView().layer;
        this.layerService.raiseLayer(layer);
    },

    /**
     * Calls the layer service to lower the selected layer.
     */
    onLowerLayerClick: function() {
        var layer = this.getView().layer;
        this.layerService.lowerLayer(layer);
    },

    /**
     * Zooms to the extent of the underlying OpenLayers layer.
     * Extent is extracted via Capabilities of the OWS Layer.
     *
     * @returns {undefined}
     */
    onMaxExtentClick: function() {
        var layer = this.getView().layer;
        this.layerService.zoomToLayerExtent(layer);
    },

    /**
     * Opens the style layer for this layer.
     */
    onStyleClick: function() {
        var layer = this.getView().layer,
            layerRecord;

        layerRecord = this.layerStore.getByLayer(layer);

        if (layerRecord) {
            Ext.create('Ext.window.Window', {
                layout: 'fit',
                autoScroll: true,
                width: 400,
                items: [{
                    xtype: 'gxc_panel_styleeditor',
                    border: 0,
                    layerRecord: layerRecord
                }]
            }).show();
        }
    },

    /**
     * Handles the deletion of layers.
     */
    onRemoveClick: function() {
        var layer = this.getView().layer;
        this.layerService.removeLayer(layer);
    },

    /**
     * Exports the layers features in the choosen format.
     * @param  {Ext.form.ComboBox} combo The format ComboBox
     * @param  {String} newValue The choosen format
     */
    onExportLayerSelect: function(combo, newValue) {
        var layer = this.getView().layer,
            format, url;

        if (!newValue.length) {
            return;
        } else {
            format = newValue[0].get('field1');
        }

        if (layer.CLASS_NAME === 'OpenLayers.Layer.Vector') {
            url = this.exportVectorFormat(layer, format);
        } else {
            url = this.exportRasterFormat(layer, format);
        }

        window.open(url, '_blank');
    },

    /**
     * Returns an url that can be used to export the layers features in raster
     * format by calling the layers WMS-GetMap endpoint.
     * @param  {OpenLayers.Layer.WMS} layer
     * @param  {String} format
     * @return {String}
     */
    exportRasterFormat: function(layer, format) {
        var bounds = layer.adjustBounds(layer.getExtent()),
            imageSize = layer.getImageSize(bounds),
            newParams = {},
            reverseAxisOrder = layer.reverseAxisOrder();

        newParams.FORMAT = format;
        newParams.BBOX = layer.encodeBBOX ?
            bounds.toBBOX(null, reverseAxisOrder) :
            bounds.toArray(reverseAxisOrder);
        newParams.WIDTH = imageSize.w;
        newParams.HEIGHT = imageSize.h;

        return layer.getFullRequestString(newParams);
    },

    /**
     * Returns an url that can be used to export layer features in vector format
     * by calling the GetFeature request with the provided format param.
     * @param  {OpenLayers.Layer.Vector} layer
     * @param  {String} format
     * @return {String}
     */
    exportVectorFormat: function(layer, format) {
        var protocol = layer.protocol;

        return protocol.url + '?service=wfs&version=' + protocol.version +
            '&request=GetFeature&typeNames=' + protocol.featureType +
            '&outputFormat=' + format;
    }
});
