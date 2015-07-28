/**
 * ViewController of StrokeSymbolizer.
 */
Ext.define('GXC.form.StrokeSymbolizerViewController', {
    extend: 'Deft.mvc.ViewController',

    control: {
        'view': {
            'collapse': 'onViewCollapse',
            'expand': 'onViewExpand'
        },
        'styleCombo': {
            'select': 'onStyleComboSelect'
        },
        'colorField': {
            'change': 'onColorFieldChange'
        },
        'widthField': {
            'change': 'onWidthFieldChange'
        },
        'opacitySlider': {
            'changecomplete': 'onOpacitySliderChangecomplete'
        }
    },

    onViewCollapse: function(view) {
        var symbolizer = view.symbolizer;

        if (symbolizer.stroke !== false) {
            symbolizer.stroke = false;
            view.fireEvent("change", symbolizer);
        }
    },

    /**
     * Sets the stroke property of the symbolizer to true on expand.
     * @param  {GXC.form.StrokeSymbolizer} view
     */
    onViewExpand: function(view) {
        var symbolizer = view.symbolizer;

        symbolizer.stroke = true;
        view.fireEvent("change", symbolizer);
    },

    /**
     * Sets the strokeDashstyle property on the StrokeSymbolizer.
     * @param  {Ext.form.field.ComboBox} combo
     * @param  {Array} records
     */
    onStyleComboSelect: function(combo, records) {
        var view = this.getView();

        view.symbolizer.strokeDashstyle = records[0].get('value');
        view.fireEvent('change', this.symbolizer);
    },

    /**
     * Sets the strokeColor property on the StrokeSymbolizer.
     * @param  {GXC.form.ColorField} field
     */
    onColorFieldChange: function(field) {
        var view = this.getView(),
            symbolizer = view.symbolizer,
            newValue = field.getValue(),
            modified;

        newValue = newValue.startsWith('#') ? newValue : '#' + newValue;
        modified = symbolizer.strokeColor != newValue;
        symbolizer.strokeColor = newValue;
        modified && view.fireEvent("change", symbolizer);
    },

    /**
     * Sets the strokeWidth property on the StrokeSymbolizer.
     * @param  {Ext.form.field.Number} field
     * @param  {Number} value
     */
    onWidthFieldChange: function(field, value) {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        value = parseFloat(value);

        if (isNaN(value)) {
            delete symbolizer.strokeWidth;
        } else {
            symbolizer.strokeWidth = value;
        }

        view.fireEvent("change", symbolizer);
    },

    /**
     * Sets the strokeOpacity property on the StrokeSymbolizer.
     * @param  {Ext.slider.Slider} slider
     * @param  {Number} value
     */
    onOpacitySliderChangecomplete: function(slider, value) {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        symbolizer.strokeOpacity = value / 100;
        view.fireEvent("change", symbolizer);
    }
});
