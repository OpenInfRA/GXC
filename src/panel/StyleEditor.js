/**
 * Create a dialog for selecting and layer styles. If the WMS supports
 * GetStyles, styles can also be edited. The dialog does not provide any
 * means of writing modified styles back to the server. To save styles,
 * configure the dialog with a :class:`gxp.plugins.StyleWriter` plugin
 * and call the ``saveStyles`` method.
 */
Ext.define('GXC.panel.StyleEditor', {
    extend: 'Ext.form.Panel',
    requires: [
        'GXC.panel.Styles',
        'GXC.panel.Rules',
        'GXC.panel.StyleEditorViewController'
    ],

    controller: 'GXC.panel.StyleEditorViewController',

    alias: 'widget.gxc_panel_styleeditor',

    /**
     * The layer to edit/select styles for.
     * @type {GeoExt.data.LayerRecord}
     *
     * @private
     */
    layerRecord: null,

    /**
     * Array entry of a DescribeLayer response as read by
     * ``OpenLayers.Format.WMSDescribeLayer``.
     *
     * @private
     */
    layerDescription: null,

    /**
     * ``Point`` or ``Line`` or ``Polygon`` - the primary symbol type for the
     * layer. This is the symbolizer type of the first symbolizer of the
     * first rule of the current layer style. Only available if the WMS
     * supports GetStyles.
     *
     * @private
     */
    symbolType: null,

    /**
     * A store representing the styles returned from
     * GetCapabilities and GetStyles. It has "name", "title", "abstract",
     * "legend" and "userStyle" fields. If the WMS supports GetStyles, the
     * "legend" field will not be available. If it does not, the "userStyle"
     * field will not be available.
     *
     * @type {Ext.data.Store}
     */
    stylesStore: null,

    /**
     * The currently selected style from the
     * ``stylesStore``.
     *
     * @type {Ext.data.Record}
     */
    selectedStyle: null,

    /**
     * The currently selected rule, or null if none
     * selected.
     *
     * @type {OpenLayers.Rule}
     */
    selectedRule: null,

    /**
     * Will be true if styles were modified. Initial state is
     * false.
     *
     * @type {Boolean}
     * @private
     */
    modified: false,

    defaults: {
        border: false
    },

    /**
     * i18m
     * @type {String}
     */
    txtLegendFieldsetTitle: 'Legend',

    dialogCls: 'Ext.window.Window',

    initComponent: function() {
        this.addEvents(
            /**
             * Fires when this component is ready for user interaction.
             */
            "ready",

            /**
             * Fires on every style modification.
             */
            "modified",

            /**
             * Fires whenever an existing style is selected from this dialog's
             * Style combo box.
             */
            "styleselected"
        );

        Ext.apply(this, {
            items: [{
                itemId: 'stylesPanel',
                xtype: 'gxc_panel_styles',
                layerRecord: this.layerRecord
            }]
        });

        this.callParent(arguments);
    }
});
