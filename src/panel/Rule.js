/**
 * A panel that is used to create style rules according to the SLD standard.
 */
Ext.define('GXC.panel.Rule', {
    extend: 'Ext.tab.Panel',
    requires: [
        'GeoExt.FeatureRenderer',
        'GXC.panel.PointSymbolizer',
        'GXC.panel.LineSymbolizer',
        'GXC.panel.PolygonSymbolizer',
        'GXC.panel.RuleViewController'
    ],

    controller: 'GXC.panel.RuleViewController',

    alias: 'widget.gxc_panel_rule',

    /**
     * List of fonts for the font combo.  If not set,
     * defaults  to the list provided by the GXC.form.FontComboBox.
     *
     * @type{[String]}
     */
    fonts: null,

    /**
     * One of 'Point', 'Line', or 'Polygon'.  If no rule is
     * provided, default is 'Point'.
     *
     * @type {String}
     */
    symbolType: null,

    /**
     * Optional rule provided in the initial
     * configuration.  If a rule is provided and no `symbolType` is provided,
     * the symbol type will be derived from the first symbolizer found in the
     * rule.
     *
     * @type {OpenLayers.Rule}
     */
    rule: null,

    /**
     * A configured attributes store for use
     * in the filter property combo.
     *
     * @type {GeoExt.data.AttributeStore}
     */
    attributes: null,

    /**
     * Only allow styling of Point, Line and Polygon Symbolizers for compatibility
     * with Vector layers.
     *
     * @type {Boolean}
     */
    simple: false,

    /**
     *  A list of objects to be used as the root of the data for a
     *  JsonStore.  These will become records used in the selection of
     *  a point graphic.  If an object in the list has no 'value' property,
     *  the user will be presented with an input to provide their own URL
     *  for an external graphic.  By default, names of well-known marks are
     *  provided.  In addition, the default list will produce a record with
     *  display of 'external' that create an input for an external graphic
     *  URL.
     *
     *  Fields:
     *
     *  * display - ``String`` The name to be displayed to the user.
     *  * preview - ``String`` URL to a graphic for preview.
     *  * value - ``String`` Value to be sent to the server.
     *  * mark - ``Boolean`` The value is a well-known name for a mark.  If
     *    false, the value will be assumed to be a url for an external graphic.
     *
     * @type {[]}
     * @private
     */

    /**
     * Allow addition of nested logical filters.  This sets the
     * allowGroups property of the filter builder.  Default is true.
     *
     * @type {Boolean}
     * @private
     */
    nestedFilters: true,

    /**
     * Lower limit for scale denominators.  Default is what you get
     * when  you assume 20 zoom levels starting with the world in Spherical
     * Mercator on a single 256 x 256 tile at zoom 0 where the zoom factor is 2.
     *
     * @type {Number}
     * @private
     */
    minScaleDenominatorLimit: Math.pow(0.5, 19) * 40075016.68 * 39.3701 * OpenLayers.DOTS_PER_INCH / 256,

    /**
     * Upper limit for scale denominators.  Default is what you get
     * when you project the world in Spherical Mercator onto a single
     * 256 x 256 pixel tile and assume OpenLayers.DOTS_PER_INCH (this
     * corresponds to zoom level 0 in Google Maps).
     *
     * @type {Number}
     * @private
     */
    maxScaleDenominatorLimit: 40075016.68 * 39.3701 * OpenLayers.DOTS_PER_INCH / 256,

    /**
     *  ``Number`` Number of scale levels to assume.  This is only for scaling
     *  values exponentially along the slider.  Scale values are not
     *  required to one of the discrete levels.  Default is 20.
     */
    scaleLevels: 20,

    /** private: property[scaleSliderTemplate]
     *  ``String`` Template for the tip displayed by the scale threshold slider.
     *
     *  Can be customized using the following keywords in curly braces:
     *
     *  * zoom - the zoom level
     *  * scale - the scale denominator
     *  * type - 'Max' or 'Min' denominator
     *  * scaleType - 'Min' or 'Max' scale (sense is opposite of type)
     *
     *  Default is '{scaleType} Scale 1:{scale}'.
     */
    scaleSliderTemplate: '{scaleType} Scale 1:{scale}',

    /** private: method[modifyScaleTipContext]
     *  Called from the multi-slider tip's getText function.  The function
     *  will receive two arguments - a reference to the panel and a data
     *  object.  The data object will have scale, zoom, and type properties
     *  already calculated.  Other properties added to the data object
     *  are available to the <scaleSliderTemplate>.
     */
    modifyScaleTipContext: Ext.emptyFn,

    /** i18n */
    labelFeaturesText: 'Label Features',
    labelsText: 'Labels',
    basicText: 'Basic',
    advancedText: 'Advanced',
    limitByScaleText: 'Limit by scale',
    limitByConditionText: 'Limit by condition',
    symbolText: 'Symbol',
    nameText: 'Name',
    abstractText: 'Abstract',

    defaults: {
        border: false
    },

    /** private */
    initComponent: function() {
        var items = [];

        if(!this.rule) {
            this.rule = new OpenLayers.Rule({
                name: this.uniqueRuleName()
            });
        } else {
            if (!this.initialConfig.symbolType) {
                this.symbolType = this.getSymbolTypeFromRule(this.rule) ||
                                  this.symbolType;
            }
        }

        this.activeTab = 0;

        // basic symbolizer form
        items.push({
            title: this.basicText,
            autoScroll: true,
            items: [
                this.createHeaderPanel(),
                this.createSymbolizerPanel()
            ]
        });

        if (!this.simple) {
            // label symbolizer
            items.push({
                title: this.labelsText,
                autoScroll: true,
                bodyStyle: {'padding': '10px'},
                items: [{
                    itemId: 'textSymbolizerFieldSet',
                    xtype: 'fieldset',
                    title: this.labelFeaturesText,
                    autoHeight: true,
                    checkboxToggle: true,
                    collapsed: !this.hasTextSymbolizer(),
                    defaults: {
                        border: false
                    },
                    items: [{
                        itemId: 'textSymbolizer',
                        xtype: 'gxc_form_textsymbolizer',
                        symbolizer: this.getTextSymbolizer(),
                        attributes: this.attributes,
                        fonts: this.fonts
                    }]
                }]
            });

            // filter panel
            items.push({
                title: this.advancedText,
                autoScroll: true,
                bodyStyle: {'padding': '10px'},
                items: [{
                    itemId: 'filterBuilderFieldSet',
                    xtype: 'fieldset',
                    title: this.limitByConditionText,
                    checkboxToggle: true,
                    collapsed: !(this.rule && this.rule.filter),
                    autoHeight: true,
                    items: [{
                        itemId: 'filterBuilder',
                        xtype: 'gxc_panel_filterbuilder',
                        allowGroups: this.nestedFilters,
                        filter: this.rule &&
                                this.rule.filter &&
                                this.rule.filter.clone(),
                        attributes: this.attributes
                    }]
                }]
            });
        } // end if !simple

        this.items = items;

        /**
         * The interpretation here is that scale values of zero are equivalent to
         * no scale value.  If someone thinks that a scale value of zero should have
         * a different interpretation, this needs to be changed.
         */
        // this.scaleLimitPanel = new gxp.ScaleLimitPanel({
        //     maxScaleDenominator: this.rule.maxScaleDenominator || undefined,
        //     limitMaxScaleDenominator: !!this.rule.maxScaleDenominator,
        //     maxScaleDenominatorLimit: this.maxScaleDenominatorLimit,
        //     minScaleDenominator: this.rule.minScaleDenominator || undefined,
        //     limitMinScaleDenominator: !!this.rule.minScaleDenominator,
        //     minScaleDenominatorLimit: this.minScaleDenominatorLimit,
        //     scaleLevels: this.scaleLevels,
        //     scaleSliderTemplate: this.scaleSliderTemplate,
        //     modifyScaleTipContext: this.modifyScaleTipContext,
        //     listeners: {
        //         change: function(comp, min, max) {
        //             this.rule.minScaleDenominator = min;
        //             this.rule.maxScaleDenominator = max;
        //             this.fireEvent('change', this, this.rule);
        //         },
        //         scope: this
        //     }
        // });

            //     title: this.advancedText,
            //     defaults: {
            //         style: {
            //             margin: '7px'
            //         }
            //     },
            //     autoScroll: true,
            //     items: [{
            //         xtype: 'fieldset',
            //         title: this.limitByScaleText,
            //         checkboxToggle: true,
            //         collapsed: !(this.rule && (this.rule.minScaleDenominator || this.rule.maxScaleDenominator)),
            //         autoHeight: true,
            //         items: [this.scaleLimitPanel],
            //         listeners: {
            //             collapse: function() {
            //                 delete this.rule.minScaleDenominator;
            //                 delete this.rule.maxScaleDenominator;
            //                 this.fireEvent('change', this, this.rule);
            //             },
            //             expand: function() {
            //                 /**
            //                  * Start workaround for
            //                  * http://projects.opengeo.org/suite/ticket/676
            //                  */
            //                 var tab = this.getActiveTab();
            //                 this.activeTab = null;
            //                 this.setActiveTab(tab);
            //                 /**
            //                  * End workaround for
            //                  * http://projects.opengeo.org/suite/ticket/676
            //                  */
            //                 var changed = false;
            //                 if (this.scaleLimitPanel.limitMinScaleDenominator) {
            //                     this.rule.minScaleDenominator = this.scaleLimitPanel.minScaleDenominator;
            //                     changed = true;
            //                 }
            //                 if (this.scaleLimitPanel.limitMaxScaleDenominator) {
            //                     this.rule.maxScaleDenominator = this.scaleLimitPanel.maxScaleDenominator;
            //                     changed = true;
            //                 }
            //                 if (changed) {
            //                     this.fireEvent('change', this, this.rule);
            //                 }
            //             },
            //             scope: this
            //         }
            //     }, {

        this.addEvents(
            /** api: events[change]
             *  Fires when any rule property changes.
             *
             *  Listener arguments:
             *  * panel - :class:`gxp.RulePanel` This panel.
             *  * rule - ``OpenLayers.Rule`` The updated rule.
             */
            'change'
        );

        this.callParent(arguments);
    },

    /** private: method[hasTextSymbolizer]
     */
    hasTextSymbolizer: function() {
        var candidate, symbolizer;

        if (this.rule.symbolizers) {
            for (var i=0, ii=this.rule.symbolizers.length; i<ii; ++i) {
                candidate = this.rule.symbolizers[i];
                if (candidate instanceof OpenLayers.Symbolizer.Text) {
                    symbolizer = candidate;
                    break;
                }
            }
        } else {
            // add compatibility with simple vector rules
            if (this.rule.symbolizer instanceof OpenLayers.Symbolizer.Text) {
                symbolizer = this.rule.symbolizer;
            }
        }

        return symbolizer;
    },

    /** private: method[getTextSymbolizer]
     *  Get the first text symbolizer in the rule.  If one does not exist,
     *  create one.
     */
    getTextSymbolizer: function() {
        var symbolizer = this.hasTextSymbolizer();
        if (!symbolizer) {
            symbolizer = new OpenLayers.Symbolizer.Text({graphic: false});
        }
        return symbolizer;
    },

    /** private: method[setTextSymbolizer]
     *  Update the first text symbolizer in the rule.  If one does not exist,
     *  add it.
     */
    setTextSymbolizer: function(symbolizer) {
        var found;
        for (var i=0, ii=this.rule.symbolizers.length; i<ii; ++i) {
            if (this.rule.symbolizers[i] instanceof OpenLayers.Symbolizer.Text) {
                this.rule.symbolizers[i] = symbolizer;
                found = true;
                break;
            }
        }
        if (!found) {
            this.rule.symbolizers.push(symbolizer);
        }
    },

    /** private: method[uniqueRuleName]
     *  Generate a unique rule name.  This name will only be unique for this
     *  session assuming other names are created by the same method.  If
     *  name needs to be unique given some other context, override it.
     */
    uniqueRuleName: function() {
        return OpenLayers.Util.createUniqueID('rule_');
    },

    /** private: method[createHeaderPanel]
     *  Creates a panel config containing rule name, symbolizer, and scale
     *  constraints.
     */
    createHeaderPanel: function() {
        return {
            xtype: 'fieldset',
            layout: 'column',
            bodyStyle: {padding: '10px'},
            border: false,
            defaults: {
                labelAlign: 'top',
                border: false
            },
            items: [{
                columnWidth: 0.75,
                xtype: 'textfield',
                flex: 3,
                fieldLabel: this.nameText,
                itemId: 'nameField',
                value: this.rule && (this.rule.title || this.rule.name || '')
            }, {
                columnWidth: 0.25,
                xtype: 'gx_renderer',
                width: 30,
                height: 30,
                padding: 10,
                itemId: 'symbolizerSwatch',
                symbolizers: [this.symbolizer]
            }, {
                columnWidth: 1,
                itemId: 'abstractField',
                xtype: 'textarea',
                fieldLabel: this.abstractText,
                name: 'description',
                value: this.rule && this.rule.description
            }]
        };
    },

    /** private: method[createSymbolizerPanel]
     */
    createSymbolizerPanel: function() {
        // use first symbolizer that matches symbolType
        var candidate, symbolizer,
            rule = this.rule,
            Type = OpenLayers.Symbolizer[this.symbolType];

        this.symbolizerExists = false;

        if (Type) {
            if (rule.symbolizers) {
                for (var i=0, ii=rule.symbolizers.length; i<ii; ++i) {
                    candidate = rule.symbolizers[i];
                    if (candidate instanceof Type) {
                        this.symbolizerExists = true;
                        symbolizer = candidate;
                        break;
                    }
                }
            } else {
                symbolizer = rule.symbolizer;
            }

            if (!symbolizer) {
                // allow addition of new symbolizer
                symbolizer = new Type({
                    fill: false,
                    stroke: false
                });
            }
            this.symbolizer = symbolizer;
        } else {
            throw new Error('Appropriate symbolizer type not included in build: ' + this.symbolType);
        }

        var cfg = {
            xtype: 'gxc_panel_' + this.symbolType.toLowerCase() + 'symbolizer',
            itemId: 'symbolizerPanel',
            bodyPadding: '10px',
            symbolizer: symbolizer,
            border: false
        };

        if (this.symbolType === 'Point' && this.pointGraphics) {
            cfg.pointGraphics = this.pointGraphics;
        }

        return cfg;

    },

    /** private: method[getSymbolTypeFromRule]
     *  :arg rule: `OpenLayers.Rule`
     *  :return: `String` 'Point', 'Line' or 'Polygon' (or undefined if none
     *      of the three.
     *
     *  Determines the symbol type of the first symbolizer of a rule that is
     *  not a text symbolizer
     */
    getSymbolTypeFromRule: function(rule) {
        var candidate, type;
        if (rule.symbolizers) {
            for (var i=0, ii=rule.symbolizers.length; i<ii; ++i) {
                candidate = rule.symbolizers[i];
                if (!(candidate instanceof OpenLayers.Symbolizer.Text)) {
                    type = candidate.CLASS_NAME.split('.').pop();
                    break;
                }
            }
        } else if (rule.symbolizer) {
            type = rule.symbolizer.CLASS_NAME.split('.').pop();
        }
        return type;
    }
});
