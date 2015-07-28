/**
 * ViewController to the GXC.panel.StyleEditor class.
 */
Ext.define('GXC.panel.StyleEditorViewController', {
    extend: 'Deft.mvc.ViewController',
    requires: [
        'Ext.data.JsonStore',
        'Ext.form.FieldSet',
        'GeoExt.container.WmsLegend'
    ],

    control: {
        'stylesPanel': {
            'styleselected': 'onStylesPanelStyleselected'
        },
        'legendPanel': {
            live: true,
            listeners: {
                'styleupdated': 'onLegendPanelStyleupdated'
            }
        }
    },

    onStylesPanelStyleselected: function(panel, styleRecord) {
        var view = this.getView(),
            layerRecord = view.layerRecord,
            legend = this.getLegendPanel();

        if (legend) {
            legend.hide().destroy();
        }

        this.mergeLayerParams(styleRecord);

        if (styleRecord.get('userStyle')) {
            view.add({
                xtype: 'gxc_panel_rules',
                itemId: 'legendPanel',
                layerRecord: layerRecord,
                layerStyle: styleRecord
            });
        } else {
            view.add([{
                xtype: 'panel',
                bodyPadding: '10px',
                maxHeight: 250,
                items: [{
                    xtype: 'fieldset',
                    itemId: 'legendPanel',
                    border: true,
                    title: view.txtLegendFieldsetTitle,
                    autoScroll: true,
                    padding: '10px',
                    items: [{
                        xtype: 'gx_wmslegend',
                        showTitle: false,
                        layerRecord: layerRecord
                    }]
                }]
            }]);
        }
    },

    onLegendPanelStyleupdated: function(panel, styleRecord) {
        this.mergeLayerParams(styleRecord);
    },

    /**
     * Merges settings into layers params to reload layer.
     * @param  {[type]} styleRecord [description]
     * @return {[type]}             [description]
     */
    mergeLayerParams: function(styleRecord) {
        var view = this.getView(),
            layerRecord = view.layerRecord,
            layer = layerRecord.getLayer();

        if (layer.CLASS_NAME === 'OpenLayers.Layer.WMS') {
            if (styleRecord.get('edited')) {
                layerRecord.getLayer().mergeNewParams({
                    SLD_BODY: this.createSld(styleRecord)
                });
            } else {
                delete layerRecord.getLayer().params.SLD_BODY;
                layerRecord.getLayer().mergeNewParams({
                    STYLES: styleRecord.get('name')
                });
            }
        } else if (layer.CLASS_NAME === 'OpenLayers.Layer.Vector') {
            layer.styleMap.styles['default'] = styleRecord.get('userStyle');
            layer.redraw();
        }
    },

    /**
     * @param {Object} styleRecord
     * @returns {String} The current SLD for the NamedLayer.
     */
    createSld: function(styleRecord, options) {
        var view = this.getView(),
            layerRecord = view.layerRecord,
            layer = layerRecord.getLayer(),
            layerName = layer.metadata['name'],
            sld = {
                version: '1.0.0',
                namedLayers: {}
            };


        sld.namedLayers[layerName] = {
            name: layerName,
            userStyles: [styleRecord.get('userStyle')]
        };

        return new OpenLayers.Format.SLD({
            multipleSymbolizers: true,
            profile: 'GeoServer'
        }).write(sld);
    }
});
