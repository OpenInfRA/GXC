Ext.define('GXC.panel.StylesViewController', {
    extend: 'Deft.mvc.ViewController',
    requires: [
        'GXC.panel.Style'
    ],

    control: {
        'view': {
            'boxready': 'onViewBoxready'
        },
        'stylesFieldSet': true,
        'stylesCombo': {
            'select': 'onStylesComboSelect'
        },
        'stylesToolbar': true,
        'addButton': {
            'click': 'onAddButtonClick'
        },
        'deleteButton': {
            'click': 'onDeleteButtonClick'
        },
        'editButton': {
            'click': 'onEditButtonClick'
        },
        'exportButton': {
            'click': 'onExportButtonClick'
        },
        'duplicateButton': {
            'click': 'onDuplicateButtonClick'
        }
    },

    /**
     * The editing dialog.
     * @type {Ext.window.Window}
     *
     * @private
     */
    editingDialog: null,

    onViewBoxready: function(view) {
        this.getStyles();
    },

    onStylesComboSelect: function(combo, records) {
        var view = this.getView(),
            record = records[0];

        view.fireEvent('styleselected', view, record);
    },

    /**
     * Create a new style record and select it in the stlyes combo box.
     */
    onAddButtonClick: function() {
        var view = this.getView(),
            combo = this.getStylesCombo(),
            store = view.stylesStore,
            newStyle = new OpenLayers.Style2({
                name: this.newStyleName(),
                rules: []
            }),
            records;

        records = store.add(Ext.create(store.model, {
            'name': newStyle.name,
            'userStyle': newStyle
        }));

        if (records.length) {
            combo.select(records[0]);
        }
    },

    onDeleteButtonClick: function() {
        var view = this.getView(),
            combo = this.getStylesCombo(),
            store = view.stylesStore,
            record = store.getById(combo.getValue());

        if (record) {
            store.remove(record);
        }
    },

    onEditButtonClick: function() {
        this.editStyle();
    },

    onExportButtonClick: function() {
        var combo = this.getStylesCombo(),
            record = combo.findRecordByValue(combo.getValue()),
            sld, blob;

        if (record.get('userStyle')) {
            sld = this.createSld(record);
            blob = new Blob([sld], {
                type: 'text/xml;charset=utf-8'
            });
            saveAs(blob, record.get('name') + '.sld');
        }
    },

    onDuplicateButtonClick: function() {
        var view = this.getView(),
            combo = this.getStylesCombo(),
            store = view.stylesStore,
            record, newRecords, newStyle;

        record = store.getById(combo.getValue());

        if (record) {
            newStyle = record.get('userStyle');
            newStyle.isDefault = false;
            newStyle.name = this.newStyleName();

            newRecords = store.add(Ext.create(store.model, {
                'name': newStyle.name,
                'title': newStyle.title,
                'abstract': newStyle.description,
                'userStyle': newStyle
            }));

            if (newRecords.length) {
                combo.select(newRecords[0]);
            }
        }
    },

    onStylePanelSavestyle: function(panel, userStyle) {
        var view = this.getView(),
            combo = this.getStylesCombo(),
            store = view.stylesStore,
            record = store.getById(combo.getValue());

        if (record) {
            record.set('userStyle', userStyle);
            combo.setValue(userStyle.name);
        }
        this.hideEditingDialog();
    },

    onStylePanelCancelstyle: function() {
        this.hideEditingDialog();
    },

    getStyles: function() {
        var view = this.getView(),
            combo = this.getStylesCombo(),
            store = view.stylesStore,
            layer = view.layerRecord.getLayer(),
            version, userStyle;

        if (layer.CLASS_NAME === 'OpenLayers.Layer.WMS') {
            version = layer.params['VERSION'];

            if (parseFloat(version) > 1.1) {
                //TODO don't force 1.1.1, fall back instead
                version = '1.1.1';
            }
            Ext.Ajax.request({
                url: layer.url,
                params: {
                    'SERVICE': 'WMS',
                    'VERSION': version,
                    'REQUEST': 'GetStyles',
                    'LAYERS': [layer.params['LAYERS']].join(',')
                },
                method: 'GET',
                disableCaching: false,
                success: this.parseSLD,
                failure: this.setupNonEditable,
                scope: this
            });
        } else if (layer.CLASS_NAME === 'OpenLayers.Layer.Vector') {
            var userStyle = layer.styleMap.styles['default'],
                type, styleRecord;


            if (layer.features.length) {
                type = layer.features[0].geometry.CLASS_NAME.split('.').pop();
            } else if (layer.geometryType) {
                type = layer.geometryType.CLASS_NAME.split('.').pop();
            }

            // sanity check to provide at least one rule per style
            if (!userStyle.rules.length) {
                userStyle.rules.push(new OpenLayers.Rule({
                    symbolizer: new OpenLayers.Symbolizer[type](
                        OpenLayers.Renderer.defaultSymbolizer
                    )
                }));
            }

            // we can use the style map entry directly without further ado
            styleRecord = Ext.create(store.model, {
                'name': userStyle.id,
                'title': userStyle.title,
                'abstract': userStyle.description,
                'userStyle': userStyle
            });

            // add the style to the combo box and select it right away
            store.add(styleRecord);
            combo.setValue(styleRecord.get('name'));
            view.fireEvent('styleselected', view, styleRecord);

            // for vector layers, keep the user from adding more styles
            this.getStylesFieldSet().hide();
            this.getStylesToolbar().hide();
        }
    },

    /**
     *  private: method[parseSLD]
     *  :arg response: ``Object``
     *  :arg options: ``Object``
     *
     *  Success handler for the GetStyles response. Includes a fallback
     *  to GetLegendGraphic if no valid SLD is returned.
     */
    parseSLD: function(response, options) {
        var view = this.getView(),
            combo = this.getStylesCombo(),
            store = view.stylesStore,
            layerRecord = view.layerRecord,
            layerParams = layerRecord.getLayer().params,
            data = response.responseXML,
            format = new OpenLayers.Format.SLD({
                profile: 'GeoServer',
                multipleSymbolizers: true
            });

        if (!data || !data.documentElement) {
            data = new OpenLayers.Format.XML().read(response.responseText);
        }

        try {
            var sld = format.read(data);

            // add userStyle objects to the stylesStore
            //TODO this only works if the LAYERS param contains one layer
            var userStyles = sld.namedLayers[layerParams.LAYERS].userStyles;

            // add styles from the layer's SLD_BODY *after* the userStyles
            var inlineStyles;
            if (layerParams.SLD_BODY) {
                var sldBody = format.read(layerParams.SLD_BODY);
                inlineStyles = sldBody.namedLayers[layerParams.LAYERS].userStyles;
                Array.prototype.push.apply(userStyles, inlineStyles);
            }

            // our stylesStore comes from the layerRecord's styles - clear it
            // and repopulate from GetStyles
            store.removeAll();

            var userStyle, record, index, defaultStyle;
            for (var i=0, len=userStyles.length; i<len; ++i) {
                userStyle = userStyles[i];
                // remove existing record - this way we replace styles from
                // userStyles with inline styles.
                index = view.stylesStore.findExact('name', userStyle.name);
                index !== -1 && store.removeAt(index);
                record = Ext.create(store.model, {
                    'name': userStyle.name,
                    'title': userStyle.title,
                    'abstract': userStyle.description,
                    'edited': true,
                    'userStyle': userStyle
                });

                record.phantom = false;
                store.add(record);

                // preselect inline style of default style
                if (index !== -1 || userStyle.isDefault === true) {
                    defaultStyle = record;
                }
            }
            // fallback to the default style, this can happen when the layer referenced
            // a non-existing style as initialStyle
            if (!combo.getValue() && defaultStyle) {
                combo.setValue(defaultStyle.get('name'));
                view.fireEvent('styleselected', view, defaultStyle);
            }
        }
        catch(e) {
            if (window.console) {
                console.warn(e.message);
            }
        }
    },

    editStyle: function() {
        var view = this.getView(),
            combo = this.getStylesCombo(),
            store = view.stylesStore,
            record = store.getById(combo.getValue()),
            userStyle;

        if (!record) {
            return;
        }

        userStyle = record.get('userStyle');

        this.editingDialog = Ext.create(view.dialogCls, {
            title: Ext.String.format(view.styleWindowTitle,
                userStyle.title || userStyle.name),
            shortTitle: userStyle.title || userStyle.name,
            bodyBorder: false,
            autoHeight: true,
            width: 300,
            modal: true,
            defaults: {
                border: false
            },
            items: [{
                xtype: 'gxc_panel_style',
                userStyle: userStyle.clone(),
                listeners: {
                    'savestyle': this.onStylePanelSavestyle,
                    'cancelstyle': this.onStylePanelCancelstyle,
                    scope: this
                }
            }],
            listeners: {
                'hide': this.onStylePanelCancelstyle,
                scope: this
            }
        }).show();
    },

    hideEditingDialog: function() {
        var panel;

        if (this.editingDialog) {
            panel = this.editingDialog.query('gxc_panel_style')[0];

            panel.un({
                'savestyle': this.onStylePanelSavestyle,
                'cancelstyle': this.onStylePanelCancelstyle,
                scope: this
            });

            this.editingDialog.hide().destroy();
            this.editingDialog = null;
        }
    },

    newStyleName: function() {
        return Math.random().toString(36).substring(7);
    },

    createSld: function(styleRecord, options) {
        var view = this.getView(),
            layerRecord = view.layerRecord,
            layer = layerRecord.getLayer(),
            layerName = layer.metadata.name,
            sld = {
                version: '1.0.0',
                namedLayers: {}
            };

        sld.namedLayers[layerName] = {
            name: layerName,
            userStyles: [styleRecord.get('userStyle')]
        };

        return new OpenLayers.Format.SLD({
            multipleSymbolizers: true,
            profile: 'GeoServer'
        }).write(sld);
    },

    /** private: methos[setNonEditable]
     */
    setupNonEditable: function() {
        var view = this.getView(),
            combo = this.getStylesCombo(),
            value = combo.getValue(),
            record;

        this.getStylesToolbar().hide();

        if (value) {
            record = combo.findRecordByValue(value);
        }

        if (record) {
            view.fireEvent('styleselected', view, record);
        }
    }
});
