/**
 * A form to configure line symbolizers.
 */
Ext.define('GXC.panel.LineSymbolizer', {
    extend: 'Ext.form.Panel',
    requires: [
        'GXC.form.StrokeSymbolizer'
    ],

    alias: 'widget.gxc_panel_linesymbolizer',

    /** api: config[symbolizer]
     *  ``Object``
     *  A symbolizer object that will be used to fill in form values.
     *  This object will be modified when values change.  Clone first if
     *  you do not want your symbolizer modified.
     */
    symbolizer: null,

    layout: 'fit',

    initComponent: function() {

        this.items = [{
            xtype: "gxc_form_strokesymbolizer",
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
