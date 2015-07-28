/**
 * A context menu that is used in the layers tree view.
 */
Ext.define('GXC.menu.Layer', {
    extend: 'Ext.menu.Menu',
    requires: [
        'Ext.data.ArrayStore',
        'GXC.menu.LayerViewController',
        'GeoExt.slider.LayerOpacity'
    ],

    alias: 'widget.gxc_menu_layer',

    controller: 'GXC.menu.LayerViewController',

    inject: [
        'appConfig'
    ],

    /**
     * The OpenLayers layer this menu interacts with.
     * @type {OpenLayers.Layer}
     */
    layer: null,

    txtAttributes: 'Show attributes table',
    txtContactInfo: 'Show contact info',
    txtMetadata: 'Open medadata url',
    txtRaiseLayer: 'Raise layer',
    txtLowerLayer: 'Lower layer',
    txtMaxExtent: 'Zoom to max extent',
    txtStyleLayer: 'Edit style',
    txtRemoveLayer: 'Remove layer',
    txtExport: 'Export to file',
    txtGroupLayer: 'Group:',

    initComponent: function() {
        var layer = this.layer,
            rasterFormats = layer.metadata.formats,
            vecOps = layer.metadata.operationsMetadata,
            title = '',
            items = [],
            gsSettings = this.appConfig.get('geoserver');

        if (layer.metadata && layer.metadata.nestedLayers &&
                layer.metadata.nestedLayers.length) {
            title += this.txtGroupLayer + ' ';
        }

        // contact information
        if (layer.metadata.service &&
                layer.metadata.service.contactInformation) {
            items.push({
                text: this.txtContactInfo,
                iconCls: 'gxc-icon-info',
                itemId: 'serviceInfo'
            });
        }

        // metadata link
        if (layer.metadata && layer.metadata.metadataURLs &&
                layer.metadata.metadataURLs.length > 0) {
            items.push({
                text: this.txtMetadata,
                iconCls: 'gxc-icon-link',
                itemId: 'metadata'
            });
        }

        if (layer.CLASS_NAME === 'OpenLayers.Layer.Vector' ||
            layer.url.startsWith(gsSettings.host)) {
            items.push({
                text: this.txtAttributes,
                iconCls: 'gxc-icon-edit',
                itemId: 'attributesButton'
            });
        }

        if (Ext.isArray(rasterFormats)) {
            items.push({
                xtype: 'combo',
                emptyText: this.txtExport,
                store: rasterFormats,
                itemId: 'exportLayer'
            });
        } else if (vecOps && vecOps.GetFeature &&
                vecOps.GetFeature.parameters &&
                vecOps.GetFeature.parameters.outputFormat) {
            items.push({
                xtype: 'combo',
                emptyText: this.txtExport,
                store: Ext.Object.getKeys(vecOps.GetFeature.parameters.outputFormat),
                itemId: 'exportLayer'
            });
        }

        items = items.concat([{
            text: this.txtStyleLayer,
            iconCls: 'gxc-icon-palette',
            itemId: 'style'
        }, {
            text: this.txtRaiseLayer,
            iconCls: 'gxc-icon-up',
            itemId: 'raiseLayer'
        }, {
            text: this.txtLowerLayer,
            iconCls: 'gxc-icon-down',
            itemId: 'lowerLayer'
        }, {
            text: this.txtMaxExtent,
            iconCls: 'gxc-icon-zoom-extent',
            itemId: 'maxExtent'
        }, {
            text: this.txtRemoveLayer,
            iconCls: 'gxc-icon-remove',
            itemId: 'remove'
        }, {
            xtype: 'gx_opacityslider',
            iconCls: 'gxc-icon-eye',
            layer: layer,
            width: 100
        }]);

        Ext.apply(this, {
            title: title + layer.name,
            items: items
        });

        this.callParent(arguments);
    }
});
