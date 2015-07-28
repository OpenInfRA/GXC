/**
 * A form to configure point symbolizers.
 */
Ext.define('GXC.panel.PointSymbolizer', {
    extend: 'Ext.form.Panel',
    requires: [
        'GXC.form.StrokeSymbolizer',
        'GXC.form.FillSymbolizer',
        'GXC.panel.PointSymbolizerViewController'
    ],

    controller: 'GXC.panel.PointSymbolizerViewController',

    alias: 'widget.gxc_panel_pointsymbolizer',

    /**
     *  A symbolizer object that will be used to fill in form values.
     *  This object will be modified when values change.
     */
    symbolizer: null,

    graphicCircleText: "circle",
    graphicSquareText: "square",
    graphicTriangleText: "triangle",
    graphicStarText: "star",
    graphicCrossText: "cross",
    graphicXText: "x",
    graphicExternalText: "external",
    urlText: "URL",
    opacityText: "opacity",
    symbolText: "Symbol",
    sizeText: "Size",
    rotationText: "Rotation",

    /**
     *  A list of objects to be used as the root of the data for a
     *  JsonStore.  These will become records used in the selection of
     *  a point graphic.  If an object in the list has no "value" property,
     *  the user will be presented with an input to provide their own URL
     *  for an external graphic.  By default, names of well-known marks are
     *  provided.  In addition, the default list will produce a record with
     *  display of "external" that create an input for an external graphic
     *  URL.
     *
     * Fields:
     *
     *  * display - ``String`` The name to be displayed to the user.
     *  * preview - ``String`` URL to a graphic for preview.
     *  * value - ``String`` Value to be sent to the server.
     *  * mark - ``Boolean`` The value is a well-known name for a mark.  If
     *      ``false``, the value will be assumed to be a url for an external graphic.
     */
    pointGraphics: null,

    /**
     *  ``Boolean``
     *  Currently using an external graphic.
     *
     * @private
     */
    external: null,

    initComponent: function() {

        if(!this.symbolizer) {
            this.symbolizer = {};
        }

        if (!this.pointGraphics) {
            this.pointGraphics = [
                {display: this.graphicCircleText, value: "circle", mark: true},
                {display: this.graphicSquareText, value: "square", mark: true},
                {display: this.graphicTriangleText, value: "triangle", mark: true},
                {display: this.graphicStarText, value: "star", mark: true},
                {display: this.graphicCrossText, value: "cross", mark: true},
                {display: this.graphicXText, value: "x", mark: true},
                {display: this.graphicExternalText}
            ];
        }

        this.external = !!this.symbolizer["externalGraphic"];

        this.items = [{
            xtype: "combo",
            name: "mark",
            itemId: 'markCombo',
            fieldLabel: this.symbolText,
            store: Ext.create('Ext.data.JsonStore', {
                proxy: 'memory',
                data: this.pointGraphics,
                fields: ["value", "display", "preview", {name: "mark", type: "boolean"}]
            }),
            value: this.external ? 0 : this.symbolizer["graphicName"],
            displayField: "display",
            valueField: "value",
            mode: "local",
            allowBlank: false,
            triggerAction: "all",
            editable: false
        }, {
            itemId: 'urlField',
            xtype: 'textfield',
            name: "url",
            fieldLabel: this.urlText,
            value: this.symbolizer["externalGraphic"],
            hidden: !this.external
        }, {
            xtype: "textfield",
            name: "size",
            itemId: 'sizeField',
            fieldLabel: this.sizeText,
            value: this.symbolizer["pointRadius"] &&
                        this.symbolizer["pointRadius"] * 2
        }, {
            xtype: "textfield",
            name: "rotation",
            itemId: 'rotationField',
            fieldLabel: this.rotationText,
            value: this.symbolizer["rotation"]
        }, {
            xtype: 'panel',
            itemId: 'markPanel',
            border: false,
            hidden: this.external,
            preventHeader: true,
            hideCollapseTool: true,
            items: [{
                xtype: "gxc_form_fillsymbolizer",
                itemId: 'fillSymbolizer',
                symbolizer: this.symbolizer
            }, {
                xtype: "gxc_form_strokesymbolizer",
                itemId: 'strokeSymbolizer',
                symbolizer: this.symbolizer
            }]
        }, {
            itemId: 'graphicOpacitySlider',
            hidden: !this.external,
            xtype: "slider",
            name: "opacity",
            width: 250,
            fieldLabel: this.opacityText,
            value: (this.symbolizer["graphicOpacity"] == null) ?
                    100 : this.symbolizer["graphicOpacity"] * 100,
            isFormField: true
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
