/**
 * Allows to interactively measure paths on the map view.
 */
Ext.define('GXC.button.MeasurePath', {
    extend: 'GXC.button.Measure',

    alias: 'widget.gxc_button_measurepath',

    iconCls: 'gxc-icon-measure-path',

    tooltip: 'Measure Path',

    /**
     * Defaults to the OpenLayers Path-Handler.
     *
     * @inheritdoc
     */
    handlerType: 'Path'
});
