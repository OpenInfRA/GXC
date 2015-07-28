/**
 * A form field representing a comparison filter.
 */
Ext.define('GXC.form.FilterField', {
    extend: 'Ext.form.FieldContainer',
    requires: [
        'GXC.form.ComparisonComboBox'
    ],

    alias: 'widget.gxc_form_filterfield',

    /**
     * tooltip for the lower boundary textfield (i18n)
     *
     * @type {String}
     */
    lowerBoundaryTip: "lower boundary",

    /**
     * tooltip for the lower boundary textfield (i18n)
     *
     * @type {String}
     */
    upperBoundaryTip: "upper boundary",

    /**
     * Should Comparison Filters for Strings do case insensitive matching?
     * Default is ``"false"``.
     *
     * @type {Boolean}
     */
    caseInsensitiveMatch: false,

    /**
     * Property: filter
     * Optional non-logical filter provided in the initial
     *     configuration.  To retreive the filter, use <getFilter> instead
     *     of accessing this property directly.
     *
     * @type {Openlayers.Filter}
     */
    filter: null,

    /**
     * A configured attributes store for use in
     *     the filter property combo.
     *
     * @type {GeoExt.data.AttributeStore}
     */
    attributes: null,

    /**
     * attributesComboConfig
     *
     * @type {Object}
     */
    attributesComboConfig: null,

    initComponent: function() {

        if(!this.filter) {
            this.filter = this.createDefaultFilter();
        }
        // Maintain compatibility with QueryPanel, which relies on "remote"
        // mode and the filterBy filter applied in it's attributeStore's load
        // listener *after* the initial combo filtering.
        //TODO Assume that the AttributeStore is already loaded and always
        // create a new one without geometry fields.
        var mode = "remote", attributes = new GeoExt.data.AttributeStore();
        if (this.attributes) {
            if (this.attributes.getCount() != 0) {
                mode = "local";
                this.attributes.each(function(r) {
                    var match = /gml:((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry)).*/.exec(r.get("type"));
                    match || attributes.add([r]);
                });
            } else {
                attributes = this.attributes;
            }
        }

        var defAttributesComboConfig = {
            xtype: "combo",
            store: attributes,
            editable: mode == "local",
            // typeAhead: true,
            forceSelection: true,
            queryMode: mode,
            triggerAction: "all",
            ref: "property",
            allowBlank: this.allowBlank,
            displayField: "name",
            valueField: "name",
            value: this.filter.property,
            listeners: {
                select: function(combo, records) {
                    record = records.length ? records[0] : records;
                    this.items.get(1).enable();
                    this.filter.property = record.get("name");
                    this.fireEvent("change", this.filter, this);
                },
                // workaround for select event not being fired when tab is hit
                // after field was autocompleted with forceSelection
                "blur": function(combo) {
                    var index = combo.store.findExact("name", combo.getValue());
                    if (index != -1) {
                        combo.fireEvent("select", combo, combo.store.getAt(index));
                    } else if (combo.startValue != null) {
                        combo.setValue(combo.startValue);
                    }
                },
                scope: this
            },
            width: 120
        };
        this.attributesComboConfig = this.attributesComboConfig || {};
        Ext.applyIf(this.attributesComboConfig, defAttributesComboConfig);

        this.items = this.createFilterItems();

        this.addEvents(
            /**
             * Event: change
             * Fires when the filter changes.
             *
             * Listener arguments:
             * filter - {OpenLayers.Filter} This filter.
             * this - {gxp.form.FilterField} (TODO change sequence of event parameters)
             */
            "change"
        );

        this.callParent(arguments);
    },

    /**
     * Method: validateValue
     * Performs validation checks on the filter field.
     *
     * Returns:
     * {Boolean} True if value is valid.
     */
    validateValue: function(value, preventMark) {
        if (this.filter.type === OpenLayers.Filter.Comparison.BETWEEN) {
            return (this.filter.property !== null && this.filter.upperBoundary !== null &&
                this.filter.lowerBoundary !== null);
        } else {
            return (this.filter.property !== null &&
                this.filter.value !== null && this.filter.type !== null);
        }
    },

    /**
     * Method: createDefaultFilter
     * May be overridden to change the default filter.
     *
     * Returns:
     * {OpenLayers.Filter} By default, returns a comparison filter.
     */
    createDefaultFilter: function() {
        return new OpenLayers.Filter.Comparison({matchCase: !this.caseInsensitiveMatch});
    },

    /**
     * Method: createFilterItems
     * Creates a panel config containing filter parts.
     */
    createFilterItems: function() {
        var isBetween = this.filter.type === OpenLayers.Filter.Comparison.BETWEEN;
        return [
            this.attributesComboConfig, Ext.applyIf({
                xtype: "gxc_form_comparisoncombobox",
                ref: "type",
                disabled: this.filter.property == null,
                allowBlank: this.allowBlank,
                value: this.filter.type,
                listeners: {
                    select: function(combo, records) {
                        this.items.get(2).enable();
                        this.items.get(3).enable();
                        this.items.get(4).enable();
                        this.setFilterType(records[0].get("value"));
                        this.fireEvent("change", this.filter, this);
                    },
                    scope: this
                }
            }, this.comparisonComboConfig), {
                xtype: "textfield",
                disabled: this.filter.type == null,
                hidden: isBetween,
                ref: "value",
                value: this.filter.value,
                width: 50,
                grow: true,
                growMin: 50,
                anchor: "100%",
                allowBlank: this.allowBlank,
                listeners: {
                    "change": function(field, value) {
                        this.filter.value = value;
                        this.fireEvent("change", this.filter, this);
                    },
                    scope: this
                }
            }, {
                xtype: "textfield",
                disabled: this.filter.type == null,
                hidden: !isBetween,
                value: this.filter.lowerBoundary,
                tooltip: this.lowerBoundaryTip,
                grow: true,
                growMin: 30,
                ref: "lowerBoundary",
                anchor: "100%",
                allowBlank: this.allowBlank,
                listeners: {
                    "change": function(field, value) {
                        this.filter.lowerBoundary = value;
                        this.fireEvent("change", this.filter, this);
                    },
                    "render": function(c) {
                        Ext.QuickTips.register({
                            target: c.getEl(),
                            text: this.lowerBoundaryTip
                        });
                    },
                    // "autosize": function(field, width) {
                    //     field.setWidth(width);
                    // },
                    scope: this
                }
            }, {
                xtype: "textfield",
                disabled: this.filter.type == null,
                hidden: !isBetween,
                grow: true,
                growMin: 30,
                ref: "upperBoundary",
                value: this.filter.upperBoundary,
                allowBlank: this.allowBlank,
                listeners: {
                    "change": function(field, value) {
                        this.filter.upperBoundary = value;
                        this.fireEvent("change", this.filter, this);
                    },
                    "render": function(c) {
                        Ext.QuickTips.register({
                            target: c.getEl(),
                            text: this.upperBoundaryTip
                        });
                    },
                    scope: this
                }
            }
        ];
    },

    setFilterType: function(type) {
        this.filter.type = type;
        if (type === OpenLayers.Filter.Comparison.BETWEEN) {
            this.items.get(2).hide();
            this.items.get(3).show();
            this.items.get(4).show();
        } else {
            this.items.get(2).show();
            this.items.get(3).hide();
            this.items.get(4).hide();
        }
        this.doLayout();
    },

    /**
     * @param {OpenLayers.Filter} Change the filter object to be
     *  used.
     */
    setFilter: function(filter) {
        var previousType = this.filter.type;
        this.filter = filter;
        if (previousType !== filter.type) {
            this.setFilterType(filter.type);
        }
        this['property'].setValue(filter.property);
        this['type'].setValue(filter.type);
        if (filter.type === OpenLayers.Filter.Comparison.BETWEEN) {
            this['lowerBoundary'].setValue(filter.lowerBoundary);
            this['upperBoundary'].setValue(filter.upperBoundary);
        } else {
            this['value'].setValue(filter.value);
        }
        this.fireEvent("change", this.filter, this);
    }

});
