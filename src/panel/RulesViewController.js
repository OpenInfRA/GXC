/**
 * A ViewController to the GXC.panel.Rules panel.
 * @type {String}
 */
Ext.define('GXC.panel.RulesViewController', {
    extend: 'Deft.mvc.ViewController',
    requires: [
        'GXC.panel.Rule'
    ],

    control: {
        'view': {
            'boxready': 'onViewBoxready'
        },
        'addButton': {
            'click': 'onAddButtonClick'
        },
        'deleteButton': {
            'click': 'onDeleteButtonClick'
        },
        'editButton': {
            'click': 'onEditButtonClick'
        },
        'upButton': {
            'click': 'onUpButtonClick'
        },
        'downButton': {
            'click': 'onDownButtonClick'
        },
        'duplicateButton': {
            'click': 'onDuplicateButtonClick'
        },
        'rulesFieldset': true,
        'legend': {
            live: true,
            listeners: {
                'ruleselected': 'onLegendRuleselected',
                'ruleunselected': 'onLegendRuleunselected',
                'rulemoved': 'onLegendRulemoved'
            }
        }
    },

    /**
     * The symbolType of the selected style.
     * @type {String}
     *
     * @private
     */
    symbolType: null,

    /**
     * The selected rule that actions are called upon.
     * @type {OpenLayers.Rule}
     *
     * @private
     */
    selectedRule: null,

    onViewBoxready: function() {
        this.createLegend();
    },

    /**
     * @private
     */
    onAddButtonClick: function() {
        var view = this.getView(),
            style = view.layerStyle,
            legend = this.getLegend();

        style.get('userStyle').rules.push(
            this.createRule()
        );
        legend.update();
        // mark the style as modified if it is in a store
        if (style.store) {
            style.store.afterEdit(style);
        }
        this.updateRuleRemoveButton();
    },

    /**
     * @private
     */
    onDeleteButtonClick: function() {
        var view = this.getView(),
            selectedRule = this.selectedRule,
            style = view.layerStyle;

        this.getLegend().unselect();
        Ext.Array.remove(style.get('userStyle').rules, selectedRule);
        // mark the style as modified
        this.afterRuleChange();
        view.fireEvent('styleupdated', view, style);
    },

    onEditButtonClick: function() {
        this.getLayerDescription()
        .then(this.editRule.bind(this))
        .fail(function() {
            console.log(arguments);
        }).done();
    },

    onUpButtonClick: function() {
        var legend = this.getLegend(),
            rules = this.getView().layerStyle.get('userStyle').rules,
            idx = Ext.Array.indexOf(rules, this.selectedRule);

        if (idx > 0) {
            legend.moveRule(idx, idx - 1);
        }
    },

    onDownButtonClick: function() {
        var legend = this.getLegend(),
            rules = this.getView().layerStyle.get('userStyle').rules,
            idx = Ext.Array.indexOf(rules, this.selectedRule),
            maxIdx = rules.length - 1;

        if (idx < maxIdx) {
            legend.moveRule(idx, idx + 1);
        }
    },

    /** private: method[duplicateRule]
     */
    onDuplicateButtonClick: function() {
        var view = this.getView(),
            layerStyle = view.layerStyle,
            legend = this.getLegend();
            newRule = this.selectedRule.clone();

        layerStyle.get('userStyle').rules.push(
            newRule
        );
        legend.update();
        // mark the style as modified
        if (layerStyle.store) {
            layerStyle.store.afterEdit(this.layerStyle);
        }
        this.updateRuleRemoveButton();
    },

    onLegendRuleselected: function(cmp, rule) {
        this.selectedRule = rule;
        // enable the Remove, Edit and Duplicate buttons
        this.updateRuleRemoveButton();
        this.getEditButton().enable();
        this.getUpButton().enable();
        this.getDownButton().enable();
        this.getDuplicateButton().enable();
    },

    onLegendRuleunselected: function(cmp, rule) {
        this.selectedRule = null;
        // disable the Remove, Edit and Duplicate buttons
        this.getDeleteButton().disable();
        this.getEditButton().disable();
        this.getUpButton().disable();
        this.getDownButton().disable();
        this.getDuplicateButton().disable();
    },

    onLegendRulemoved: function() {
        // this.markModified();
    },

    onLegendAfterlayout: function(legend) {
        // restore selection
        if (this.selectedRule !== null &&
            legend.selectedRule === null &&
            legend.rules.indexOf(this.selectedRule) !== -1) {
            legend.selectRuleEntry(this.selectedRule);
        }
    },

    /**
     * Gets the layers description if it is not cached locally yet.
     * Since this is an async method, a promise of the description is returned.
     * @return {Q.Promise} The promise of the layer description.
     */
    getLayerDescription: function() {
        var deferred = Q.defer(),
            view = this.getView(),
            desc = this._layerDescription,
            layerRecord = view.layerRecord,
            layer = layerRecord.getLayer(),
            version, inlineAttr = [];

        if (desc) {
            deferred.resolve(desc);
        } else if (layer.CLASS_NAME === 'OpenLayers.Layer.Vector' && layer.protocol) {
            // if a Wfs layer is to be described, all settings can be taken
            // from the layers protocol
            this._layerDescription = {
                layerName: layer.protocol.featureType,
                owsType: "WFS",
                owsURL: layer.protocol.url,
                typeName: layer.protocol.featureType
            };
            deferred.resolve(this._layerDescription);
        } else if (layer.CLASS_NAME === 'OpenLayers.Layer.WMS') {
            // Wms layers may provide a DescribeLayer endpoint
            version = layer.params["VERSION"];

            if (parseFloat(version) > 1.1) {
                //TODO don't force 1.1.1, fall back instead
                version = "1.1.1";
            }
            Ext.Ajax.request({
                url: layer.url,
                params: {
                    "SERVICE": "WMS",
                    "VERSION": version,
                    "REQUEST": "DescribeLayer",
                    "LAYERS": [layer.params["LAYERS"]].join(",")
                },
                method: "GET",
                disableCaching: false,
                success: function(response) {
                    var result = new OpenLayers.Format.WMSDescribeLayer().read(
                        response.responseXML && response.responseXML.documentElement ?
                            response.responseXML : response.responseText);
                    this._layerDescription = result[0];
                    deferred.resolve(this._layerDescription);
                },
                scope: this
            });
        } else {
            // non WMS/WFS layer can not provide a layer description
            deferred.resolve();
        }

        return deferred.promise;
    },

    /** private: method[editRule]
     */
    editRule: function(layerDescription) {
        var view = this.getView(),
            layerRecord = view.layerRecord,
            layer = layerRecord.getLayer(),
            rule = this.selectedRule,
            desc = layerDescription,
            attributesStore, dialog;

        if (desc) {
            attributesStore = Ext.create('GeoExt.data.AttributeStore', {
                url: desc.owsURL,
                baseParams: {
                    "SERVICE": desc.owsType,
                    "REQUEST": "DescribeFeatureType",
                    "TYPENAME": desc.typeName
                },
                method: "GET",
                disableCaching: false
            });
        }

        dialog = Ext.create(view.dialogCls, {
            title: Ext.String.format(view.ruleWindowTitle, rule.title ||
                    rule.name || view.newRuleText),
            shortTitle: rule.title || rule.name || view.newRuleText,
            layout: 'fit',
            width: 320,
            height: 450,
            modal: true,
            items: [{
                xtype: 'gxc_panel_rule',
                ref: 'rulePanel',
                simple: layer.CLASS_NAME === 'OpenLayers.Layer.Vector',
                symbolType: this.symbolType,
                attributes: attributesStore,
                rule: rule,
                autoScroll: true,
                border: false,
                defaults: {
                    autoHeight: true,
                    hideMode: 'offsets'
                }
            }],
            bbar: ['->', {
                text: view.cancelText,
                iconCls: 'cancel',
                handler: function() {
                    dialog.destroy();
                },
                scope: this
            }, {
                text: view.saveText,
                iconCls: 'save',
                handler: function() {
                    this.saveRule(dialog.rulePanel, rule);
                    dialog.destroy();
                },
                scope: this
            }],
            listeners: {
                'close': function() {
                    dialog.destroy();
                },
                scope: this
            }
        });
        this.showDlg(dialog);
    },

    /** private: method[updateRuleRemoveButton]
     *  Enable/disable the 'Remove' button to make sure that we don't delete
     *  the last rule.
     */
    updateRuleRemoveButton: function() {
        var btn = this.getDeleteButton();

        btn.setDisabled(!this.selectedRule || this.getLegend().rules.length < 2);
    },

    /** private: method[createRule]
     */
    createRule: function() {
        var view = this.getView(),
            rules = view.layerStyle.get('userStyle').rules;

        if (rules.length && rules[0].symbolizer) {
            return new OpenLayers.Rule({
                symbolizer: new OpenLayers.Symbolizer[this.symbolType]
            });
        } else {
            return new OpenLayers.Rule({
                symbolizers: [new OpenLayers.Symbolizer[this.symbolType]]
            });
        }
    },

    /**
     * @param {OpenLayers.Rule} rule [description]
     */
    saveRule: function(cmp, rule) {
        var view = this.getView(),
            style = this.getView().layerStyle,
            userStyle = style.get('userStyle'),
            i = Ext.Array.indexOf(userStyle.rules, this.selectedRule);

        userStyle.rules[i] = rule;

        // trigger edited status
        style.set('userStyle', userStyle);

        // update legend
        this.afterRuleChange(rule);

        // let the editor know about change
        view.fireEvent('styleupdated', view, style);
    },

    /**
     *  Performs actions that are required to update the selectedRule and
     *  layerStyle after a rule was changed.
     *  @param {OpenLayers.Rule} rule Rule to select. May be null.
     */
    afterRuleChange: function(rule) {
        var legend = this.getLegend();

        legend.selectRuleEntry(rule);
        this.selectedRule = rule;
        this.getLegend().update();
    },

    /**
     * Creates legend description from array of rules.
     */
    createLegend: function() {
        var view = this.getView(),
            rules = view.layerStyle.get('userStyle').rules,
            R = OpenLayers.Symbolizer.Raster,
            symbolizer = rules[0].symbolizers ? rules[0].symbolizers[0] : rules[0].symbolizer;

        if (R && symbolizer instanceof R) {
            throw new Error('Raster symbolizers are not supported.');
        } else {
            this.addVectorLegend(rules);
        }
    },

    /**
     *  :arg rules: ``Array``
     *  :arg options: ``Object``
     *  :return: ``GeoExt.VectorLegend`` the legend that was created
     *
     *  Creates the vector legend for the provided rules and adds it to the
     *  rules fieldset.
     *
     * @private
     */
    addVectorLegend: function(rules, options) {
        var typeHierarchy, highest;

        options = options || {};

        this.symbolType = options.symbolType;
        if (!this.symbolType && rules.length) {
            typeHierarchy = ["Point", "Line", "Polygon"];
            // use the highest symbolizer type of the 1st rule
            highest = 0;
            var symbolizers = rules[0].symbolizers || [rules[0].symbolizer],
                symbolType;
            for (var i = symbolizers.length - 1; i >= 0; i--) {
                symbolType = symbolizers[i].CLASS_NAME.split(".").pop();
                highest = Math.max(highest, typeHierarchy.indexOf(symbolType));
            }
            this.symbolType = typeHierarchy[highest];
        }

        return this.getRulesFieldset().add({
            xtype: "gx_vectorlegend",
            itemId: 'legend',
            showTitle: false,
            border: false,
            height: rules.length > 10 ? 250 : undefined,
            autoScroll: rules.length > 10,
            rules: rules,
            symbolType: this.symbolType,
            selectOnClick: true
        });
    },

    /**
     *
     */
    showDlg: function(dlg) {
        dlg.show();
    }
});
