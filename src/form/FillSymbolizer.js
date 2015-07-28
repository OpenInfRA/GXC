/**
 * A symbolizer to choose feature fills with.
 * @type {String}
 */
Ext.define('GXC.form.FillSymbolizer', {
    extend: 'Ext.form.FieldSet',
    requires: [
        'GXC.form.ColorField',
        'Ext.slider.Single',
        'GXC.form.FillSymbolizerViewController'
    ],

    controller: 'GXC.form.FillSymbolizerViewController',

    alias: 'widget.gxc_form_fillsymbolizer',

    /**
     *  A symbolizer object that will be used to fill in form values.
     *  This object will be modified when values change.  Clone first if
     *  you do not want your symbolizer modified.
     *
     * @type {Object}
     */
    symbolizer: null,

    /**
     * The property that should be set on the symbolizer to
     * represent the fill color. Defaults to fillColor. But can also be
     * set to fontColor for labels.
     *
     * @type {String}
     */
    colorProperty: 'fillColor',

    /**
     * The property that should be set on the symbolizer to
     * represent the fill opacity. Defaults to fillOpacity. But can also be
     * set to fontOpacity for labels.
     *
     * @type {String}
     */
    opacityProperty: 'fillOpacity',

    /**
     * Set to false if the 'Fill' fieldset should not be
     * toggleable. Default is true.
     *
     * @type {Boolean}
     */
    checkboxToggle: true,

    /**
     * Default background color for the Color field. This
     * color will be displayed when no fillColor value for the symbolizer
     * is available. Defaults to the ``fillColor`` property of
     * ``OpenLayers.Renderer.defaultSymbolizer``.
     *
     * @type {String}
     */
    defaultColor: null,

    fillText: 'Fill',
    colorText: 'Color',
    opacityText: 'Opacity',

    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },

    initComponent: function() {

        if(!this.symbolizer) {
            this.symbolizer = {};
        }

        var sliderValue = 100;
        if (this.opacityProperty in this.symbolizer) {
            sliderValue = this.symbolizer[this.opacityProperty]*100;
        }
        else if (OpenLayers.Renderer.defaultSymbolizer[this.opacityProperty]) {
            sliderValue = OpenLayers.Renderer.defaultSymbolizer[this.opacityProperty]*100;
        }

        Ext.apply(this, {
            title: this.fillText,
            autoHeight: true,
            checkboxToggle: this.checkboxToggle,
            collapsed: this.checkboxToggle === true &&
                    this.symbolizer.fill === false,
            hideMode: 'offsets',
            items: [{
                xtype: 'gxc_form_colorfield',
                fieldLabel: this.colorText,
                itemId: 'colorField',
                name: 'color',
                allowBlank: true,
                emptyText: OpenLayers.Renderer.defaultSymbolizer[this.colorProperty],
                value: this.symbolizer[this.colorProperty],
                defaultBackground: this.defaultColor ||
                    OpenLayers.Renderer.defaultSymbolizer[this.colorProperty]
            }, {
                xtype: 'slider',
                fieldLabel: this.opacityText,
                name: 'opacity',
                itemId: 'opacitySlider',
                width: 250,
                values: [sliderValue],
                isFormField: true
            }]
        });

        this.addEvents(
            /**
             * Event: change
             * Fires before any field blurs if the field value has changed.
             *
             * Listener arguments:
             * symbolizer - {Object} A symbolizer with fill related properties
             *     updated.
             */
            'change'
        );

        this.callParent(arguments);

    }


});
