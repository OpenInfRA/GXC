/**
 * ViewController to the GXC.form.FillSymbolizer class.
 */
Ext.define('GXC.form.FillSymbolizerViewController', {
    extend: 'Deft.mvc.ViewController',

    control: {
        'view': {
            'collapse': 'onViewCollapse',
            'expand': 'onViewExpand'
        },
        'colorField': {
            'change': 'onColorFieldChange'
        },
        'opacitySlider': {
            'changecomplete': 'onOpacitySliderChangecomplete'
        }
    },

    onViewCollapse: function(view) {
        var symbolizer = view.symbolizer;

        if (symbolizer.fill !== false) {
            symbolizer.fill = false;
            view.fireEvent("change", symbolizer);
        }
    },

    /**
     * Activates fill property of the symbolizer on expand.
     * @param  {GXC.form.FillSymbolizer} view The view
     */
    onViewExpand: function(view) {
        var symbolizer = view.symbolizer;

        symbolizer.fill = true;
        view.fireEvent("change", symbolizer);
    },

    /**
     * Sets the color property of the symbolizer if value is valid.
     * @param  {GXC.form.ColorField} field
     * @param  {String} newValue
     */
    onColorFieldChange: function(field, newValue) {
        var view = this.getView(),
            symbolizer = view.symbolizer,
            modified;

        if (field.isValid()) {
            newValue = newValue.startsWith('#') ? newValue : '#' + newValue;
            modified = symbolizer[view.colorProperty] != newValue;
            symbolizer[view.colorProperty] = newValue;
            modified && view.fireEvent("change", symbolizer);
        }
    },

    /**
     * Sets the opacity property of the symbolizer if the value is valid.
     * @param  {Ext.form.Slider} slider
     * @param  {Number} value
     */
    onOpacitySliderChangecomplete: function(slider, value) {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        symbolizer[view.opacityProperty] = value / 100;
        view.fireEvent("change", symbolizer);
    }
});
