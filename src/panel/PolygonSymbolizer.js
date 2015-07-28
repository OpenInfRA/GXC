/**
 * A form to configure polygon symbolizers.
 */
Ext.define('GXC.panel.PolygonSymbolizer', {
    extend: 'Ext.form.Panel',
    requires: [
        'GXC.form.FillSymbolizer',
        'GXC.form.StrokeSymbolizer'
    ],

    alias: 'widget.gxc_panel_polygonsymbolizer',

    /**
     *  A symbolizer object that will be used to fill in form values.
     *  This object will be modified when values change.  Clone first if
     *  you do not want your symbolizer modified.
     */
    symbolizer: null,

    initComponent: function() {

        this.items = [{
            xtype: 'gxc_form_fillsymbolizer',
            symbolizer: this.symbolizer,
            listeners: {
                change: function(symbolizer) {
                    this.fireEvent("change", this.symbolizer);
                },
                scope: this
            }
        }, {
            xtype: 'gxc_form_strokesymbolizer',
            symbolizer: this.symbolizer,
            listeners: {
                change: function(symbolizer) {
                    this.fireEvent("change", this.symbolizer);
                },
                scope: this
            }
        }];

        this.addEvents(
            /**
             * Event: change
             * Fires before any field blurs if the field value has changed.
             *
             * Listener arguments:
             * symbolizer - {Object} A symbolizer with stroke related properties
             *     updated.
             */
            "change"
        );

        this.callParent(arguments);

    }
});
