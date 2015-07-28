Ext.define('GXC.form.TextSymbolizerViewController', {
    extend: 'Deft.mvc.ViewController',

    control: {
        attributesCombo: {
            'select': 'onAttributesComboSelect'
        },
        fontCombo: {
            'select': 'onFontComboSelect'
        },
        fontSizeField: {
            'change': 'onFontSizeFieldChange'
        },
        fontWeightButton: {
            'toggle': 'onFontWeightButtonToggle'
        },
        fontStyleButton: {
            'toggle': 'onFontStyleButtonToggle'
        },
        fontColorSymbolizer: {
            'change': 'onFontColorSymbolizerChange'
        },
        graphicFieldSet: {
            'collapse': 'onGraphicFieldSetCollapse'
        },
        fontGraphicSymbolizer: {
            'change': 'onFontGraphicSymbolizerChange'
        },
        graphicResizeCombo: {
            'select': 'onGraphicResizeCombo',
            'change': 'onVendorSpecificFieldChange'
        },
        graphicMarginField: {
            'change': 'onVendorSpecificFieldChange'
        },
        haloFieldSet: {
            'collapse': 'onHaloFieldSetCollapse'
        },
        haloRadiusField: {
            'change': 'onHaloRadiusFieldChange'
        },
        haloColorSymbolizer: {
            'change': 'onHaloColorSymbolizerChange'
        },
        pointLabelAlignCombo: {
            'select': 'onPointLabelAlignComboSelect'
        },
        displamcementXField: {
            'change': 'onDisplacementXChange'
        },
        displamcementYField: {
            'change': 'onDisplacementYChange'
        },
        perpendicularOffsetField: {
            'change': 'onPerpendicularOffsetFieldChange'
        },
        polygonAlignCombo: {
            'change': 'onVendorSpecificFieldChange'
        },
        priorityCombo: {
            'select': 'onPriorityComboSelect'
        },
        autoWrapField: {
            'change': 'onVendorSpecificFieldChange'
        },
        followLineField: {
            'change': 'onFollowLineFieldCheck'
        },
        maxAngleDeltaField: {
            'change': 'onVendorSpecificFieldChange'
        },
        maxDisplacementField: {
            'change': 'onVendorSpecificFieldChange'
        },
        repeatField: {
            'change': 'onVendorSpecificFieldChange'
        },
        forceLeftToRightField: {
            'change': 'onVendorSpecificFieldChange'
        },
        groupField: {
            'change': 'onGroupFieldChange'
        },
        labelAllGroupField: {
            'change': 'onVendorSpecificFieldChange'
        },
        conflictResolutionField: {
            'change': 'onConflictResolutionFieldChange'
        },
        spaceAroundField: {
            'change': 'onVendorSpecificFieldChange'
        },
        goodnessOfFitField: {
            'change': 'onVendorSpecificFieldChange'
        }
    },

    onAttributesComboSelect: function(combo, records) {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        symbolizer.label = "${" + records[0].get("name") + "}";
        view.fireEvent("change", symbolizer);
    },

    onFontComboSelect: function(combo, records) {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        symbolizer.fontFamily = records[0].get("field1");
        view.fireEvent("change", symbolizer);
    },

    onFontSizeFieldChange: function(field, value) {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        value = parseFloat(value);
        if (isNaN(value)) {
            delete symbolizer.fontSize;
        } else {
            symbolizer.fontSize = value;
        }
        view.fireEvent("change", symbolizer);
    },

    onFontWeightButtonToggle: function(button, pressed) {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        symbolizer.fontWeight = pressed ? "bold" : "normal";
        view.fireEvent("change", symbolizer);
    },

    onFontStyleButtonToggle: function(button, pressed) {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        symbolizer.fontStyle = pressed ? "italic" : "normal";
        view.fireEvent("change", symbolizer);
    },

    onFontColorSymbolizerChange: function(symbolizer) {
        this.getView().fireEvent("change", symbolizer);
    },

    onFontGraphicSymbolizerChange: function(symbolizer) {
        symbolizer.graphic = !!symbolizer.graphicName || !!symbolizer.externalGraphic;
        this.getView().fireEvent("change", symbolizer);
    },

    onGraphicFieldSetCollapse: function() {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        delete symbolizer.externalGraphic;
        delete symbolizer.fillColor;
        delete symbolizer.fillOpacity;
        delete symbolizer.graphicName;
        delete symbolizer.pointRadius;
        delete symbolizer.rotation;
        delete symbolizer.strokeColor;
        delete symbolizer.strokeWidth;
        delete symbolizer.strokeDashStyle;

        view.fireEvent("change", symbolizer);
    },

    onGraphicResizeCombo: function(combo) {
        var view = this.getView(),
            symbolizer = view.symbolizer,
            graphicMarginField = this.getGraphicMarginField();

        if (combo.getValue() === "none") {
            graphicMarginField.hide();
        } else {
            if (Ext.isEmpty(graphicMarginField.getValue())) {
                graphicMarginField.setValue(0);
                symbolizer.vendorOptions["graphic-margin"] = 0;
            }
            graphicMarginField.show();
        }
    },

    onHaloFieldSetCollapse: function() {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        delete symbolizer.haloRadius;
        delete symbolizer.haloColor;
        delete symbolizer.haloOpacity;

        view.fireEvent("change", symbolizer);
    },

    onHaloRadiusFieldChange: function(field, value) {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        value = parseFloat(value);
        if (isNaN(value)) {
            delete symbolizer.haloRadius;
        } else {
            symbolizer.haloRadius = value;
        }
        view.fireEvent("change", symbolizer);
    },

    onHaloColorSymbolizerChange: function(haloSymbolizer) {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        symbolizer.haloColor = haloSymbolizer.fillColor;
        symbolizer.haloOpacity = haloSymbolizer.fillOpacity;
        view.fireEvent("change", symbolizer);
    },

    onPointLabelAlignComboSelect: function(combo) {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        symbolizer.labelAlign = combo.getValue();
        delete symbolizer.labelAnchorPointX;
        delete symbolizer.labelAnchorPointY;
        view.fireEvent("change", symbolizer);
    },

    onDisplacementXChange: function(field, value) {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        symbolizer.labelXOffset = value;
        view.fireEvent("change", symbolizer);
    },

    onDisplacementYChange: function(field, value) {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        symbolizer.labelYOffset = value;
        view.fireEvent("change", symbolizer);
    },

    onPerpendicularOffsetFieldChange: function(field, value) {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        if (Ext.isEmpty(value)) {
            delete symbolizer.labelPerpendicularOffset;
        } else {
            symbolizer.labelPerpendicularOffset = value;
        }
        view.fireEvent("change", symbolizer);
    },

    onPriorityComboSelect: function(combo, records) {
        var view = this.getView(),
            symbolizer = view.symbolizer;

        symbolizer[combo.name] = "${" + records[0].get("name") + "}";
        view.fireEvent("change", symbolizer);
    },

    onFollowLineFieldCheck: function(cb, checked) {
        var maxAngleDeltaField = this.getMaxAngleDeltaField();

        if (!checked) {
            maxAngleDeltaField.hide();
        } else {
            maxAngleDeltaField.show();
        }
        this.onVendorSpecificFieldChange(cb, checked);
    },

    onGroupFieldChange: function(cb, value) {
        var view = this.getView(),
            labelAllGroupField = this.getLabelAllGroupField();

        if (view.geometryType === 'LINE') {
            if (value === false) {
                labelAllGroupField.hide();
            } else {
                labelAllGroupField.show();
            }
        }

        this.onVendorSpecificFieldChange(cb, value);
    },

    onConflictResolutionFieldChange: function(cb, checked) {
        var spaceAroundField = this.getSpaceAroundField();

        if (!checked) {
            spaceAroundField.hide();
        } else {
            spaceAroundField.show();
        }

        this.onVendorSpecificFieldChange(cb, checked);
    },

    onVendorSpecificFieldChange: function(field, value) {
        var view = this.getView(),
            name = field.getName(),
            yesno = field.yesno,
            symbolizer = view.symbolizer;

        // empty VendorOption tags can cause null pointer exceptions in GeoServer
        if (Ext.isEmpty(value)) {
            delete symbolizer.vendorOptions[name];
        } else {
            if (yesno === true) {
                symbolizer.vendorOptions[name] = (value == true) ? 'yes' : 'no';
            } else {
                symbolizer.vendorOptions[name] = value;
            }
        }
        view.fireEvent("change", symbolizer);
    }
});
