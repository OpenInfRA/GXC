/**
 * Form for configuring a symbolizer stroke.
 */
Ext.define('GXC.form.StrokeSymbolizer', {
    extend: 'Ext.form.FieldSet',
    requires: [
        'Ext.slider.Single',
        'GXC.form.ColorField',
        'GXC.form.StrokeSymbolizerViewController'
    ],

    controller: 'GXC.form.StrokeSymbolizerViewController',

    alias: 'widget.gxc_form_strokesymbolizer',

    /* i18n */
    solidStrokeName: "solid",
    dashStrokeName: "dash",
    dotStrokeName: "dot",
    titleText: "Stroke",
    styleText: "Style",
    colorText: "Color",
    widthText: "Width",
    opacityText: "Opacity",
    /* ~i18n */

    /**
     *  A symbolizer object that will be used to fill in form values.
     *  This object will be modified when values change.  Clone first if
     *  you do not want your symbolizer modified.
     *
     * @type {Object}
     */
    symbolizer: null,

    /**
     * Set to false if the "Fill" fieldset should not be
     * toggleable. Default is true.
     *
     * @type {Boolean}
     */
    checkboxToggle: true,

    /**
     * Default background color for the Color field. This
     * color will be displayed when no strokeColor value for the symbolizer
     * is available. Defaults to the ``strokeColor`` property of
     * ``OpenLayers.Renderer.defaultSymbolizer``.
     *
     * @type {Boolean}
     */
    defaultColor: null,

    /**
     * A list of [value, name] pairs for stroke dash styles.
     * The first item in each list is the value and the second is the
     * display name.  Default is [["solid", "solid"], ["2 4", "dash"],
     * ["1 4", "dot"]].
     */
    dashStyles: null,

    defaults: {
        anchor: '100%'
    },

    initComponent: function() {
        var opacity = ("strokeOpacity" in this.symbolizer) ?
                this.symbolizer.strokeOpacity :
                OpenLayers.Renderer.defaultSymbolizer.strokeOpacity,
            dashArray = this.getDashArray(this.symbolizer.strokeDashstyle) ||
                OpenLayers.Renderer.defaultSymbolizer.strokeDashstyle;

        this.dashStyles = this.dashStyles || [
            ["solid", this.solidStrokeName],
            ["4 4", this.dashStrokeName],
            ["2 4", this.dotStrokeName]
        ];

        if(!this.symbolizer) {
            this.symbolizer = {};
        }

        Ext.apply(this, {
            xtype: "fieldset",
            title: this.titleText,
            checkboxToggle: this.checkboxToggle,
            collapsed: this.checkboxToggle === true &&
                this.symbolizer.stroke === false,
            hideMode: "offsets",
            items: [{
                xtype: "combo",
                name: "style",
                itemId: 'styleCombo',
                fieldLabel: this.styleText,
                store: new Ext.data.ArrayStore({
                    data: this.dashStyles,
                    fields: ["value", "display"]
                }),
                displayField: "display",
                valueField: "value",
                value: dashArray,
                mode: "local",
                allowBlank: true,
                triggerAction: "all",
                editable: false
            }, {
                xtype: 'gxc_form_colorfield',
                name: "color",
                itemId: 'colorField',
                allowBlank: true,
                fieldLabel: this.colorText,
                emptyText: OpenLayers.Renderer.defaultSymbolizer.strokeColor,
                value: this.symbolizer.strokeColor,
                defaultBackground: this.defaultColor ||
                    OpenLayers.Renderer.defaultSymbolizer.strokeColor
            }, {
                xtype: "numberfield",
                name: "width",
                itemId: 'widthField',
                fieldLabel: this.widthText,
                allowNegative: false,
                emptyText: OpenLayers.Renderer.defaultSymbolizer.strokeWidth,
                value: this.symbolizer.strokeWidth
            }, {
                xtype: "slider",
                name: "opacity",
                itemId: 'opacitySlider',
                fieldLabel: this.opacityText,
                increment: 5,
                minValue: 0,
                maxValue: 100,
                value: opacity * 100,
                isFormField: true
            }]
        });

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

    },

    getDashArray: function(style) {
        var array;
        if (style) {
            var parts = style.split(/\s+/);
            var ratio = parts[0] / parts[1];
            if (!isNaN(ratio)) {
                array = ratio >= 1 ? "4 4" : "2 4";
            }
        }
        return array;
    }
});
