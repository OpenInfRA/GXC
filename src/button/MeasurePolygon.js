/**
 * Allows to interactively measure polygons on the map view.
 */
Ext.define('GXC.button.MeasurePolygon', {
    extend: 'GXC.button.Measure',

    alias: 'widget.gxc_button_measurepolygon',

    iconCls: 'gxc-icon-measure-polygon',

    tooltip: 'Measure Polygon',

    /**
     * Defaults to the OpenLayers Polygon-Handler.
     *
     * @inheritdoc
     */
    handlerType: 'Polygon'
});
