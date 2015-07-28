/**
 * A ViewController to the GXC.panel.PointSymbolizer.
 */
Ext.define('GXC.panel.PointSymbolizerViewController', {
    extend: 'Deft.mvc.ViewController',

    control: {
        'markPanel': true,
        'markCombo': {
            'select': 'onMarkComboSelect'
        },
        'urlField': {
            'change': 'onUrlFieldChange'
        },
        'sizeField': {
            'change': 'onSizeFieldChange'
        },
        'rotationField': {
            'change': 'onRotationFieldChange'
        },
        'fillSymbolizer': {
            'change': 'onSymbolizerChange'
        },
        'strokeSymbolizer': {
            'change': 'onSymbolizerChange'
        },
        'graphicOpacitySlider': {
            'changecomplete': 'onGraphicOpacitySliderChangecomplete'
        }
    },

    onMarkComboSelect: function(combo, records) {
        var view = this.getView(),
            symbolizer = view.symbolizer,
            record = records[0],
            mark = record.get('mark'),
            value = record.get('value'),
            urlField = this.getUrlField(),
            urlValue;

        if (!mark) {
            // non predefined sld symbol

            if (value) {
                // pre configured external graphic
                urlField.hide();
                symbolizer['externalGraphic'] = value;
            } else {
                urlField.show();
            }

            if (!view.external) {
                view.external = true;
                urlValue = urlField.getValue();
                if (!Ext.isEmpty(urlValue)) {
                    symbolizer['externalGraphic'] = urlValue;
                }
                delete symbolizer['graphicName'];
                this.updateGraphicDisplay();
            }

        } else {

            if (view.external) {
                urlField.hide();
                view.external = false;
                delete symbolizer['externalGraphic'];
                this.updateGraphicDisplay();
            }
            symbolizer['graphicName'] = value;
        }

        view.fireEvent('change', symbolizer);
    },

    onUrlFieldChange: function(field, value) {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        symbolizer['externalGraphic'] = value;
        view.fireEvent('change', symbolizer);
    },

    onSizeFieldChange: function(field, value) {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        symbolizer['pointRadius'] = value / 2;
        view.fireEvent('change', symbolizer);
    },

    onRotationFieldChange: function(field, value) {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        symbolizer['rotation'] = value;
        view.fireEvent('change', symbolizer);
    },

    onSymbolizerChange: function(symbolizer) {
        var view = this.getView();
        view.fireEvent('change', view.symbolizer);
    },

    onGraphicOpacitySliderChangecomplete: function(slider, value) {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        symbolizer['graphicOpacity'] = value / 100;
        view.fireEvent('change', symbolizer);
    },

    updateGraphicDisplay: function() {
        var view = this.getView(),
            markPanel = this.getMarkPanel(),
            graphicOpacitySlider = this.getGraphicOpacitySlider();

        if(view.external) {
            markPanel.hide();
            graphicOpacitySlider.show();
        } else {
            graphicOpacitySlider.hide();
            markPanel.show();
        }
    }
});
