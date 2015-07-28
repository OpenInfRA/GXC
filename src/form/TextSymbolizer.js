/**
 * Form for configuring a text symbolizer.
 */
Ext.define('GXC.form.TextSymbolizer', {
    extend: 'Ext.form.Panel',
    requires: [
        'Ext.form.FieldSet',
        'GXC.form.FontComboBox',
        'GXC.form.TextSymbolizerViewController'
    ],

    controller: 'GXC.form.TextSymbolizerViewController',

    alias: 'widget.gxc_form_textsymbolizer',

    /**
     *  List of fonts for the font combo.  If not set, defaults to the list
     *  provided by the :class:`gxp.FontComboBox`.
     *
     * @type {[String]}
     */
    fonts: undefined,

    /**
     *  A symbolizer object that will be used to fill in form values.
     *  This object will be modified when values change.  Clone first if
     *  you do not want your symbolizer modified.
     *
     * @type {Object}
     */
    symbolizer: null,

    /**
     *  Default symbolizer properties to be used where none provided.
     *
     * @type {Object}
     */
    defaultSymbolizer: null,

    /**
     *  A configured attributes store for use in the filter property combo.
     *
     * @type {GeoExt.data.AttributeStore}
     */
    attributes: null,

    /** i18n */
    labelValuesText: "Label values",
    haloText: "Halo",
    sizeText: "Size",
    priorityText: "Priority",
    labelOptionsText: "Label options",
    autoWrapText: "Auto wrap",
    followLineText: "Follow line",
    maxDisplacementText: "Maximum displacement",
    repeatText: "Repeat",
    forceLeftToRightText: "Force left to right",
    groupText: "Grouping",
    spaceAroundText: "Space around",
    labelAllGroupText: "Label all segments in line group",
    maxAngleDeltaText: "Maximum angle delta",
    conflictResolutionText: "Conflict resolution",
    goodnessOfFitText: "Goodness of fit",
    polygonAlignText: "Polygon alignment",
    graphicResizeText: "Graphic resize",
    graphicMarginText: "Graphic margin",
    graphicTitle: "Graphic",
    fontLabel: "Font",
    fontColorTitle: "Font color and opacity",
    positioningText: "Label positioning",
    anchorPointText: "Anchor point",
    displacementXText: "Displacement (X-direction)",
    displacementYText: "Displacement (Y-direction)",
    perpendicularOffsetText: "Perpendicular offset",
    priorityHelp: "The higher the value of the specified field, the sooner the label will be drawn (which makes it win in the conflict resolution game)",
    autoWrapHelp: "Wrap labels that exceed a certain length in pixels",
    followLineHelp: "Should the label follow the geometry of the line?",
    maxDisplacementHelp: "Maximum displacement in pixels if label position is busy",
    repeatHelp: "Repeat labels after a certain number of pixels",
    forceLeftToRightHelp: "Labels are usually flipped to make them readable. If the character happens to be a directional arrow then this is not desirable",
    groupHelp: "Grouping works by collecting all features with the same label text, then choosing a representative geometry for the group. Road data is a classic example to show why grouping is useful. It is usually desirable to display only a single label for all of 'Main Street', not a label for every block of 'Main Street.'",
    spaceAroundHelp: "Overlapping and Separating Labels. By default GeoServer will not render labels 'on top of each other'. By using the spaceAround option you can either allow labels to overlap, or add extra space around labels. The value supplied for the option is a positive or negative size in pixels. Using the default value of 0, the bounding box of a label cannot overlap the bounding box of another label.",
    labelAllGroupHelp: "The labelAllGroup option makes sure that all of the segments in a line group are labeled instead of just the longest one.",
    conflictResolutionHelp: "By default labels are subjected to conflict resolution, meaning the renderer will not allow any label to overlap with a label that has been drawn already. Setting this parameter to false pull the label out of the conflict resolution game, meaning the label will be drawn even if it overlaps with other labels, and other labels drawn after it won’t mind overlapping with it.",
    goodnessOfFitHelp: "Geoserver will remove labels if they are a particularly bad fit for the geometry they are labeling. For Polygons: the label is sampled approximately at every letter. The distance from these points to the polygon is determined and each sample votes based on how close it is to the polygon. The default value is 0.5.",
    graphicResizeHelp: "Specifies a mode for resizing label graphics (such as highway shields) to fit the text of the label. The default mode, ‘none’, never modifies the label graphic. In stretch mode, GeoServer will resize the graphic to exactly surround the label text, possibly modifying the image’s aspect ratio. In proportional mode, GeoServer will expand the image to be large enough to surround the text while preserving its original aspect ratio.",
    maxAngleDeltaHelp: "Designed to use used in conjuection with followLine, the maxAngleDelta option sets the maximum angle, in degrees, between two subsequent characters in a curved label. Large angles create either visually disconnected words or overlapping characters. It is advised not to use angles larger than 30.",
    polygonAlignHelp: "GeoServer normally tries to place horizontal labels within a polygon, and give up in case the label position is busy or if the label does not fit enough in the polygon. This options allows GeoServer to try alternate rotations for the labels. Possible options: the default value, only the rotation manually specified in the <Rotation> tag will be used (manual), If the label does not fit horizontally and the polygon is taller than wider the vertical alignement will also be tried (ortho), If the label does not fit horizontally the minimum bounding rectangle will be computed and a label aligned to it will be tried out as well (mbr).",
    graphicMarginHelp: "Similar to the margin shorthand property in CSS for HTML, its interpretation varies depending on how many margin values are provided: 1 = use that margin length on all sides of the label 2 = use the first for top & bottom margins and the second for left & right margins. 3 = use the first for the top margin, second for left & right margins, third for the bottom margin. 4 = use the first for the top margin, second for the right margin, third for the bottom margin, and fourth for the left margin.",

    fieldDefaults: {
        anchor: '100%'
    },
    border: false,

    initComponent: function() {

        if (!this.symbolizer) {
            this.symbolizer = {};
        }
        Ext.applyIf(this.symbolizer, this.defaultSymbolizer);

        if (!this.symbolizer.vendorOptions) {
            this.symbolizer.vendorOptions = {};
        }

        this.attributes.on('load', this.showHideGeometryOptions, this);
        this.attributes.load();

        this.attributesComboConfig = {
            itemId: 'attributesCombo',
            xtype: "combo",
            fieldLabel: this.labelValuesText,
            store: this.attributes,
            mode: 'local',
            lastQuery: '',
            editable: false,
            triggerAction: "all",
            allowBlank: false,
            displayField: "name",
            valueField: "name",
            value: this.symbolizer.label &&
                   this.symbolizer.label.replace(/^\${(.*)}$/, "$1")
        };

        this.items = [
            this.attributesComboConfig, {
                itemId: 'fontCombo',
                xtype: "gxc_form_fontcombobox",
                fieldLabel: this.fontLabel,
                fonts: this.fonts || undefined,
                value: this.symbolizer.fontFamily
            }, {
                itemId: 'fontSizeField',
                xtype: "numberfield",
                fieldLabel: this.sizeText,
                allowNegative: false,
                emptyText: OpenLayers.Renderer.defaultSymbolizer.fontSize,
                value: this.symbolizer.fontSize
            }, {
                itemId: 'fontWeightButton',
                xtype: 'button',
                enableToggle: true,
                iconCls: "gxc-icon-bold",
                pressed: this.symbolizer.fontWeight === "bold"
            }, {
                itemId: 'fontStyleButton',
                xtype: 'button',
                enableToggle: true,
                iconCls: "gxc-icon-italic",
                pressed: this.symbolizer.fontStyle === "italic"
            }, {
                itemId: 'fontColorSymbolizer',
                xtype: "gxc_form_fillsymbolizer",
                fillText: this.fontColorTitle,
                symbolizer: this.symbolizer,
                colorProperty: "fontColor",
                opacityProperty: "fontOpacity",
                checkboxToggle: false,
                autoHeight: true
            }, {
                itemId: 'graphicFieldSet',
                xtype: "fieldset",
                title: this.graphicTitle,
                checkboxToggle: true,
                hideMode: 'offsets',
                collapsed: !(this.symbolizer.fillColor ||
                    this.symbolizer.fillOpacity ||
                    this.symbolizer.vendorOptions["graphic-resize"] ||
                    this.symbolizer.vendorOptions["graphic-margin"]
                ),
                items: [{
                    itemId: 'fontGraphicSymbolizer',
                    xtype: "gxc_panel_pointsymbolizer",
                    border: false,
                    symbolizer: this.symbolizer
                },
                this.createVendorSpecificField({
                    itemId: 'graphicResizeCombo',
                    name: "graphic-resize",
                    xtype: "combo",
                    store: [
                        "none",
                        "stretch",
                        "proportional"
                    ],
                    mode: 'local',
                    triggerAction: 'all',
                    fieldLabel: this.graphicResizeText
                }),
                this.createVendorSpecificField({
                    itemId: 'graphicMarginField',
                    xtype: "textfield",
                    name: "graphic-margin",
                    hidden: (
                        this.symbolizer.vendorOptions["graphic-resize"] !== "stretch" &&
                        this.symbolizer.vendorOptions["graphic-resize"] !== "proportional"
                    ),
                    fieldLabel: this.graphicMarginText
                })]
            }, {
                itemId: 'haloFieldSet',
                xtype: "fieldset",
                title: this.haloText,
                checkboxToggle: true,
                collapsed: !(this.symbolizer.haloRadius ||
                    this.symbolizer.haloColor ||
                    this.symbolizer.haloOpacity
                ),
                autoHeight: true,
                items: [{
                    itemId: 'haloRadiusField',
                    xtype: "numberfield",
                    fieldLabel: this.sizeText,
                    allowNegative: false,
                    emptyText: OpenLayers.Renderer.defaultSymbolizer.haloRadius,
                    value: this.symbolizer.haloRadius
                }, {
                    itemId: 'haloColorSymbolizer',
                    xtype: "gxc_form_fillsymbolizer",
                    symbolizer: {
                        fillColor: ("haloColor" in this.symbolizer) ?
                            this.symbolizer.haloColor :
                            OpenLayers.Renderer.defaultSymbolizer.haloColor,
                        fillOpacity: ("haloOpacity" in this.symbolizer) ?
                            this.symbolizer.haloOpacity :
                            OpenLayers.Renderer.defaultSymbolizer.haloOpacity * 100
                    },
                    defaultColor: OpenLayers.Renderer.defaultSymbolizer.haloColor,
                    checkboxToggle: false
                }]
            }, {
                xtype: "fieldset",
                collapsed: !(this.symbolizer.labelAlign ||
                    this.symbolizer.vendorOptions['polygonAlign'] ||
                    this.symbolizer.labelXOffset ||
                    this.symbolizer.labelYOffset ||
                    this.symbolizer.labelPerpendicularOffset
                ),
                title: this.positioningText,
                checkboxToggle: true,
                autoHeight: true,
                items: [
                    this.createField(Ext.applyIf({
                        itemId: 'pointLabelAlignCombo',
                        fieldLabel: this.anchorPointText,
                        geometryTypes: ["POINT"],
                        value: this.symbolizer.labelAlign || "lb",
                        store: [
                            ['lt', 'Left-top'],
                            ['ct', 'Center-top'],
                            ['rt', 'Right-top'],
                            ['lm', 'Left-center'],
                            ['cm', 'Center'],
                            ['rm', 'Right-center'],
                            ['lb', 'Left-bottom'],
                            ['cb', 'Center-bottom'],
                            ['rb', 'Right-bottom']
                        ]
                    }, this.attributesComboConfig)),
                    this.createField({
                        itemId: 'displamcementXField',
                        xtype: "numberfield",
                        geometryTypes: ["POINT"],
                        fieldLabel: this.displacementXText,
                        value: this.symbolizer.labelXOffset
                    }),
                    this.createField({
                        itemId: 'displamcementYField',
                        xtype: "numberfield",
                        geometryTypes: ["POINT"],
                        fieldLabel: this.displacementYText,
                        value: this.symbolizer.labelYOffset
                    }),
                    this.createField({
                        itemId: 'perpendicularOffsetField',
                        xtype: "numberfield",
                        geometryTypes: ["LINE"],
                        fieldLabel: this.perpendicularOffsetText,
                        value: this.symbolizer.labelPerpendicularOffset
                    }),
                    this.createVendorSpecificField({
                        itemId: 'polygonAlignCombo',
                        name: 'polygonAlign',
                        geometryTypes: ['POLYGON'],
                        xtype: "combo",
                        mode: 'local',
                        value: this.symbolizer.vendorOptions['polygonAlign'] ||
                               'manual',
                        triggerAction: 'all',
                        store: [
                            "manual",
                            "ortho",
                            "mbr"
                        ],
                        fieldLabel: this.polygonAlignText
                    })
                ]
            }, {
                xtype: "fieldset",
                title: this.priorityText,
                checkboxToggle: true,
                collapsed: !(this.symbolizer.priority),
                autoHeight: true,
                items: [
                    Ext.applyIf({
                        itemId: 'priorityCombo',
                        fieldLabel: this.priorityText,
                        value: this.symbolizer.priority &&
                            this.symbolizer.priority.replace(/^\${(.*)}$/, "$1"),
                        allowBlank: true,
                        name: 'priority'
                    }, this.attributesComboConfig)
                ]
            }, {
                xtype: "fieldset",
                title: this.labelOptionsText,
                checkboxToggle: true,
                collapsed: !(this.symbolizer.vendorOptions['autoWrap'] ||
                    this.symbolizer.vendorOptions['followLine'] ||
                    this.symbolizer.vendorOptions['maxAngleDelta'] ||
                    this.symbolizer.vendorOptions['maxDisplacement'] ||
                    this.symbolizer.vendorOptions['repeat'] ||
                    this.symbolizer.vendorOptions['forceLeftToRight'] ||
                    this.symbolizer.vendorOptions['group'] ||
                    this.symbolizer.vendorOptions['spaceAround'] ||
                    this.symbolizer.vendorOptions['labelAllGroup'] ||
                    this.symbolizer.vendorOptions['conflictResolution'] ||
                    this.symbolizer.vendorOptions['goodnessOfFit'] ||
                    this.symbolizer.vendorOptions['polygonAlign']
                ),
                autoHeight: true,
                items: [
                    this.createVendorSpecificField({
                        itemId: 'autoWrapField',
                        name: 'autoWrap',
                        allowBlank: false,
                        fieldLabel: this.autoWrapText
                    }),
                    this.createVendorSpecificField({
                        itemId: 'followLineField',
                        name: 'followLine',
                        geometryTypes: ["LINE"],
                        xtype: 'checkbox',
                        fieldLabel: this.followLineText
                    }),
                    this.createVendorSpecificField({
                        itemId: 'maxAngleDeltaField',
                        name: 'maxAngleDelta',
                        hidden: (
                            this.symbolizer.vendorOptions["followLine"] == null
                        ),
                        geometryTypes: ["LINE"],
                        fieldLabel: this.maxAngleDeltaText
                    }),
                    this.createVendorSpecificField({
                        itemId: 'maxDisplacementField',
                        name: 'maxDisplacement',
                        fieldLabel: this.maxDisplacementText
                    }),
                    this.createVendorSpecificField({
                        itemId: 'repeatField',
                        name: 'repeat',
                        geometryTypes: ["LINE"],
                        fieldLabel: this.repeatText
                    }),
                    this.createVendorSpecificField({
                        itemId: 'forceLeftToRightField',
                        name: 'forceLeftToRight',
                        xtype: "checkbox",
                        geometryTypes: ["LINE"],
                        fieldLabel: this.forceLeftToRightText
                    }),
                    this.createVendorSpecificField({
                        itemId: 'groupField',
                        name: 'group',
                        xtype: 'checkbox',
                        yesno: true,
                        fieldLabel: this.groupText
                    }),
                    this.createVendorSpecificField({
                        itemId: 'labelAllGroupField',
                        name: 'labelAllGroup',
                        geometryTypes: ["LINE"],
                        hidden: (this.symbolizer.vendorOptions['group'] !== 'yes'),
                        xtype: "checkbox",
                        fieldLabel: this.labelAllGroupText
                    }),
                    this.createVendorSpecificField({
                        itemId: 'conflictResolutionField',
                        name: 'conflictResolution',
                        xtype: "checkbox",
                        fieldLabel: this.conflictResolutionText
                    }),
                    this.createVendorSpecificField({
                        itemId: 'spaceAroundField',
                        name: 'spaceAround',
                        hidden: (
                            this.symbolizer.vendorOptions['conflictResolution'] !== true
                        ),
                        allowNegative: true,
                        fieldLabel: this.spaceAroundText
                    }),
                    this.createVendorSpecificField({
                        itemId: 'goodnessOfFitField',
                        name: 'goodnessOfFit',
                        geometryTypes: ['POLYGON'],
                        fieldLabel: this.goodnessOfFitText
                    })
                ]
            }
        ];

        this.addEvents(
            /**
             * Event: change
             * Fires before any field blurs if the field value has changed.
             *
             * Listener arguments:
             * symbolizer - {Object} A symbolizer with text related properties
             *     updated.
             */
            "change"
        );

        this.callParent(arguments);

    },

    createField: function(config) {
        var field = Ext.ComponentMgr.create(config);

        if (config.geometryTypes) {
            this.on('geometrytype', function(type) {
                if (config.geometryTypes.indexOf(type) === -1) {
                    field.hide();
                }
            });
        }

        return field;
    },

    /**
     *  Create a form field that will generate a VendorSpecific tag.
     *
     * @private
     */
    createVendorSpecificField: function(config) {
        var field;

        Ext.applyIf(config, {
            xtype: "numberfield",
            allowNegative: false,
            value: config.value || this.symbolizer.vendorOptions[config.name],
            checked: (config.yesno === true) ?
                (this.symbolizer.vendorOptions[config.name] === 'yes') :
                this.symbolizer.vendorOptions[config.name]
        });

        field = Ext.ComponentManager.create(config);

        if (config.geometryTypes) {
            this.on('geometrytype', function(type) {
                if (config.geometryTypes.indexOf(type) === -1) {
                    field.hide();
                }
            });
        }

        return field;
    },

    showHideGeometryOptions: function() {
        var geomRegex = /gml:((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry)).*/;
        var polygonRegex = /gml:((Multi)?(Polygon|Surface)).*/;
        var pointRegex = /gml:((Multi)?(Point)).*/;
        var lineRegex = /gml:((Multi)?(Line|Curve|Surface)).*/;
        var geomType = null;
        this.attributes.each(function(r) {
            var type = r.get("type");
            var match = geomRegex.exec(type);
            if (match) {
                if (polygonRegex.exec(type)) {
                    geomType = "POLYGON";
                } else if (pointRegex.exec(type)) {
                    geomType = "POINT";
                } else if (lineRegex.exec(type)) {
                    geomType = "LINE";
                }
            }
        }, this);

        if (geomType !== null) {
            this.geometryType = geomType;
            this.fireEvent('geometrytype', geomType);
        }
    }

});
