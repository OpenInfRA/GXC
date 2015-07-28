/**
 * Create a panel for assembling a filter.
 *
 * TODO: Seperate concerns via ViewController.
 */
Ext.define('GXC.panel.FilterBuilder', {
    extend: 'Ext.form.Panel',
    requires: [
        'Ext.form.FieldContainer'
    ],

    alias: 'widget.gxc_panel_filterbuilder',

    statics: {
        ANY_OF: 0,
        ALL_OF: 1,
        NONE_OF: 2,
        NOT_ALL_OF: 3
    },

    /**
     *  A list of labels that correspond to builder type constants.
     *  These will be the option names available in the builder type combo.
     *  Default is ``["any", "all", "none", "not all"]``.
     */
    builderTypeNames: ["any", "all", "none", "not all"],

    /**
     *  List of builder type constants.  Default is
     */
    allowedBuilderTypes: null,

    allowBlank: false,
    caseInsensitiveMatch: false,

    /**
     * String to display before filter type combo.  Default is ``"Match"``.
     */
    preComboText: "Match",

    /**
     * String to display after filter type combo.  Default is
     * ``"of the following:"``.
     */
    postComboText: "of the following:",

    /**
     * The CSS class to be added to this panel's element (defaults to
     * ``"gxc-filterbuilder"``).
     */
    cls: "gxc-filterbuilder",

    /** @private
     */
    builderType: null,

    /**
     * @private
     */
    childFilterContainer: null,

    /**
     * @private
     */
    customizeFilterOnInit: true,

    addConditionText: "add condition",
    addGroupText: "add group",
    removeConditionText: "remove condition",

    /**
     *  Allow groups of conditions to be added.  Default is ``true``.
     *  If ``false``, only individual conditions (non-logical filters) can
     *  be added.
     *  @type Boolean
     */
    allowGroups: true,

    initComponent: function() {
        var defConfig = {
            defaultBuilderType: GXC.panel.FilterBuilder.ANY_OF
        };
        Ext.applyIf(this, defConfig);

        if(this.customizeFilterOnInit) {
            this.filter = this.customizeFilter(this.filter);
        }

        this.builderType = this.getBuilderType();

        this.items = [{
            xtype: "container",
            layout: "form",
            ref: "form",
            fieldDefaults: {
                anchor: "100%"
            },
            hideLabels: true,
            items: [{
                xtype: "fieldcontainer",
                style: "padding-left: 2px",
                items: [{
                    xtype: "label",
                    style: "padding-top: 0.3em",
                    text: this.preComboText
                }, this.createBuilderTypeCombo(), {
                    xtype: "label",
                    style: "padding-top: 0.3em",
                    text: this.postComboText
                }]
            }, this.createChildFiltersPanel(), {
                xtype: "toolbar",
                items: this.createToolBar()
            }]

        }];

        this.addEvents(
            /**
             * Event: change
             * Fires when the filter changes.
             *
             * Listener arguments:
             * builder - {GXC.panel.FilterBuilder} This filter builder.  Call
             * ``getFilter`` to get the updated filter.
             */
            "change"
        );

        this.callParent(arguments);
    },

    /**
     * @private
     */
    createToolBar: function() {
        var bar = [{
            text: this.addConditionText,
            iconCls: "add",
            handler: function() {
                this.addCondition();
            },
            scope: this
        }];
        if(this.allowGroups) {
            bar.push({
                text: this.addGroupText,
                iconCls: "add",
                handler: function() {
                    this.addCondition(true);
                },
                scope: this
            });
        }
        return bar;
    },

    /**
     *  Returns a filter that fits the model in the Filter Encoding
     *  specification.  Use this method instead of directly accessing
     *  the ``filter`` property.  Return will be ``false`` if any child
     *  filter does not have a type, property, or value.
     *
     *  @returns {OpenLayers.Filter}
     */
    getFilter: function() {
        var filter;
        if(this.filter) {
            filter = this.filter.clone();
            if(filter instanceof OpenLayers.Filter.Logical) {
                filter = this.cleanFilter(filter);
            }
        }
        return filter;
    },

    /**
     * Ensures that binary logical filters have more than one child.
     * TODO: Clean this up.
     *
     * @param {OpenLayers.Filter.Logical}
     * @returns {OpenLayers.Filter} An equivalent filter to the input, where
     *      all binary logical filters have more than one child filter.  Returns
     *      false if a filter doesn't have non-null type, property, or value.
     */
    cleanFilter: function(filter) {
        if(filter instanceof OpenLayers.Filter.Logical) {
            if(filter.type !== OpenLayers.Filter.Logical.NOT &&
               filter.filters.length === 1) {
                filter = this.cleanFilter(filter.filters[0]);
            } else {
                var child;
                for(var i=0, len=filter.filters.length; i<len; ++i) {
                    child = filter.filters[i];
                    if(child instanceof OpenLayers.Filter.Logical) {
                        child = this.cleanFilter(child);
                        if(child) {
                            filter.filters[i] = child;
                        } else {
                            filter = child;
                            break;
                        }
                    } else if(
                        !child ||
                        child.type === null ||
                        child.property === null ||
                        child[filter.type === OpenLayers.Filter.Comparison.BETWEEN
                            ? "lowerBoundary" : "value"] === null
                    ) {
                        filter = false;
                        break;
                    }
                }
            }
        } else {
            if (!filter ||
                filter.type === null ||
                filter.property === null ||
                filter[filter.type === OpenLayers.Filter.Comparison.BETWEEN
                    ? "lowerBoundary" : "value"] === null
            ) {
                filter = false;
            }
        }
        return filter;
    },

    /**
     * Create a filter that fits the model for this filter builder.  This filter
     * will not necessarily meet the Filter Encoding specification.  In
     * particular, filters representing binary logical operators may not
     * have two child filters.  Use the <getFilter> method to return a
     * filter that meets the encoding spec.
     *
     * @param {OpenLayers.Filter} filter This filter will not
     *      be modified.  Register for events to receive an updated filter, or
     *      call ``getFilter``.
     * @returns {OpenLayers.Filter} A filter that fits the model used by
     *      this builder.
     */
    customizeFilter: function(filter) {
        if(!filter) {
            filter = this.wrapFilter(this.createDefaultFilter());
        } else {
            filter = this.cleanFilter(filter);
            var child, i, len;
            switch(filter.type) {
                case OpenLayers.Filter.Logical.AND:
                case OpenLayers.Filter.Logical.OR:
                    if(!filter.filters || filter.filters.length === 0) {
                        // give the filter children if it has none
                        filter.filters = [this.createDefaultFilter()];
                    } else {
                        for(i=0, len=filter.filters.length; i<len; ++i) {
                            child = filter.filters[i];
                            if(child instanceof OpenLayers.Filter.Logical) {
                                filter.filters[i] = this.customizeFilter(child);
                            }
                        }
                    }
                    // wrap in a logical OR
                    filter = new OpenLayers.Filter.Logical({
                        type: OpenLayers.Filter.Logical.OR,
                        filters: [filter]
                    });
                    break;
                case OpenLayers.Filter.Logical.NOT:
                    if(!filter.filters || filter.filters.length === 0) {
                        filter.filters = [
                            new OpenLayers.Filter.Logical({
                                type: OpenLayers.Filter.Logical.OR,
                                filters: [this.createDefaultFilter()]
                            })
                        ];
                    } else {
                        // NOT filters should have one child only
                        child = filter.filters[0];
                        if(child instanceof OpenLayers.Filter.Logical) {
                            if(child.type !== OpenLayers.Filter.Logical.NOT) {
                                // check children of AND and OR
                                var grandchild;
                                for(i=0, len=child.filters.length; i<len; ++i) {
                                    grandchild = child.filters[i];
                                    if(grandchild instanceof OpenLayers.Filter.Logical) {
                                        child.filters[i] = this.customizeFilter(grandchild);
                                    }
                                }
                            } else {
                                // silly double negative
                                if(child.filters && child.filters.length > 0) {
                                    filter = this.customizeFilter(child.filters[0]);
                                } else {
                                    filter = this.wrapFilter(this.createDefaultFilter());
                                }
                            }
                        } else {
                            // non-logical child of NOT should be wrapped
                            var type;
                            if(this.defaultBuilderType === this.statics().NOT_ALL_OF) {
                                type = OpenLayers.Filter.Logical.AND;
                            } else {
                                type = OpenLayers.Filter.Logical.OR;
                            }
                            filter.filters = [
                                new OpenLayers.Filter.Logical({
                                    type: type,
                                    filters: [child]
                                })
                            ];
                        }
                    }
                    break;
                default:
                    // non-logical filters get wrapped
                    filter = this.wrapFilter(filter);
                    break;
            }
        }
        return filter;
    },

    createDefaultFilter: function() {
        return new OpenLayers.Filter.Comparison({
                            matchCase: !this.caseInsensitiveMatch});
    },

    /**
     *  Given a non-logical filter, this creates parent filters depending on
     *  the ``defaultBuilderType``.
     *
     * @param {OpenLayers.Filter} filter non-logical filter
     * @returns {OpenLayers.Filter} A wrapped version of the input filter.
     */
    wrapFilter: function(filter) {
        var type;
        if(this.defaultBuilderType === this.statics().ALL_OF) {
            type = OpenLayers.Filter.Logical.AND;
        } else {
            type = OpenLayers.Filter.Logical.OR;
        }
        return new OpenLayers.Filter.Logical({
            type: OpenLayers.Filter.Logical.OR,
            filters: [
                new OpenLayers.Filter.Logical({
                    type: type, filters: [filter]
                })
            ]
        });
    },

    /**
     *  Add a new condition or group of conditions to the builder.  This
     *  modifies the filter and adds a panel representing the new condition
     *  or group of conditions.
     */
    addCondition: function(group) {
        var filter, type;
        if(group) {
            type = "gxc_panel_filterbuilder";
            filter = this.wrapFilter(this.createDefaultFilter());
        } else {
            type = "gxc_form_filterfield";
            filter = this.createDefaultFilter();
        }
        var newChild = this.newRow({
            xtype: type,
            filter: filter,
            columnWidth: 1,
            attributes: this.attributes,
            allowBlank: group ? undefined : this.allowBlank,
            customizeFilterOnInit: group && false,
            caseInsensitiveMatch: this.caseInsensitiveMatch,
            listeners: {
                change: function() {
                    this.fireEvent("change", this);
                },
                scope: this
            }
        });
        this.childFilterContainer.add(newChild);
        this.filter.filters[0].filters.push(filter);
        this.childFilterContainer.doLayout();
    },

    /**
     *  Remove a condition or group of conditions from the builder.  This
     *  modifies the filter and removes the panel representing the condition
     *  or group of conditions.
     *
     * @private
     */
    removeCondition: function(item, filter) {
        var parent = this.filter.filters[0].filters;
        if(parent.length > 0) {
            Ext.Array.remove(parent, filter);
            this.childFilterContainer.remove(item, true);
        }
        if(parent.length === 0) {
            this.addCondition();
        }
        this.fireEvent("change", this);
    },

    createBuilderTypeCombo: function() {
        var statics = this.statics(),
            types = this.allowedBuilderTypes || [
            statics.ANY_OF,
            statics.ALL_OF,
            statics.NONE_OF
        ];
        var numTypes = types.length;
        var data = new Array(numTypes);
        var type;
        for(var i=0; i<numTypes; ++i) {
            type = types[i];
            data[i] = [type, this.builderTypeNames[type]];
        }
        return {
            xtype: "combo",
            store: new Ext.data.SimpleStore({
                data: data,
                fields: ["value", "name"]
            }),
            value: this.builderType,
            ref: "../../builderTypeCombo",
            displayField: "name",
            valueField: "value",
            triggerAction: "all",
            mode: "local",
            listeners: {
                select: function(combo, records) {
                    this.changeBuilderType(records[0].get("value"));
                    this.fireEvent("change", this);
                },
                scope: this
            },
            width: 60 // TODO: move to css
        };
    },

    /**
     *  Alter the filter types when the filter type combo changes.
     *
     * @param {Integer} Filter type constant.
     *
     * @private
     */
    changeBuilderType: function(type) {
        if(type !== this.builderType) {
            this.builderType = type;
            var child = this.filter.filters[0],
                statics = this.statics();
            switch(type) {
                case statics.ANY_OF:
                    this.filter.type = OpenLayers.Filter.Logical.OR;
                    child.type = OpenLayers.Filter.Logical.OR;
                    break;
                case statics.ALL_OF:
                    this.filter.type = OpenLayers.Filter.Logical.OR;
                    child.type = OpenLayers.Filter.Logical.AND;
                    break;
                case statics.NONE_OF:
                    this.filter.type = OpenLayers.Filter.Logical.NOT;
                    child.type = OpenLayers.Filter.Logical.OR;
                    break;
                case statics.NOT_ALL_OF:
                    this.filter.type = OpenLayers.Filter.Logical.NOT;
                    child.type = OpenLayers.Filter.Logical.AND;
                    break;
            }
        }
    },

    /**
     *  Create the panel that holds all conditions and condition groups.  Since
     *  this is called after this filter has been customized, we always
     *  have a logical filter with one child filter - that child is also
     *  a logical filter.
     *
     * @Ext.Container
     */
    createChildFiltersPanel: function() {
        this.childFilterContainer = new Ext.Container();
        var grandchildren = this.filter.filters[0].filters;
        var grandchild;
        for(var i=0, len=grandchildren.length; i<len; ++i) {
            grandchild = grandchildren[i];
            var fieldCfg = {
                xtype: "gxc_form_filterfield",
                allowBlank: this.allowBlank,
                columnWidth: 1,
                filter: grandchild,
                attributes: this.attributes,
                listeners: {
                    change: function() {
                        this.fireEvent("change", this);
                    },
                    scope: this
                }
            };
            var containerCfg = Ext.applyIf(
                grandchild instanceof OpenLayers.Filter.Logical ?
                    {
                        xtype: "gxp_filterbuilder"
                    } : {
                        xtype: "container",
                        layout: "form",
                        hideLabels: true,
                        items: fieldCfg
                    }, fieldCfg);

            this.childFilterContainer.add(this.newRow(containerCfg));
        }
        return this.childFilterContainer;
    },

    /**
     *  Generate a "row" for the child filters panel.  This couples another
     *  filter panel or filter builder with a component that allows for
     *  condition removal.
     *
     * @returns {Ext.Container} A container that serves as a row in a child
     *  filters panel.
     */
    newRow: function(filterContainer) {
        var ct = new Ext.Container({
            layout: "column",
            items: [{
                xtype: "container",
                width: 28,
                height: 26,
                style: "padding-left: 2px",
                items: {
                    xtype: "button",
                    text: "-",
                    tooltip: this.removeConditionText,
                    handler: function(btn){
                        this.removeCondition(ct, filterContainer.filter);
                    },
                    scope: this
                }
            }, filterContainer]
        });
        return ct;
    },

    /**
     * Determine the builder type based on this filter.
     *
     * @returns {Integer} builder type constant.
     */
    getBuilderType: function() {
        var type = this.defaultBuilderType;
        if(this.filter) {
            var child = this.filter.filters[0]
                statics = this.statics();
            if(this.filter.type === OpenLayers.Filter.Logical.NOT) {
                switch(child.type) {
                    case OpenLayers.Filter.Logical.OR:
                        type = statics.NONE_OF;
                        break;
                    case OpenLayers.Filter.Logical.AND:
                        type = statics.NOT_ALL_OF;
                        break;
                }
            } else {
                switch(child.type) {
                    case OpenLayers.Filter.Logical.OR:
                        type = statics.ANY_OF;
                        break;
                    case OpenLayers.Filter.Logical.AND:
                        type = statics.ALL_OF;
                        break;
                }
            }
        }
        return type;
    },

    /**
     *  Change the filter associated with this instance.
     *
     * @param {OpenLayers.Filter} filter
     */
    setFilter: function(filter) {
        this.filter = this.customizeFilter(filter);
        this.changeBuilderType(this.getBuilderType());
        this.builderTypeCombo.setValue(this.builderType);
        this.form.remove(this.childFilterContainer);
        this.form.insert(1, this.createChildFiltersPanel());
        this.form.doLayout();
        this.fireEvent("change", this);
    }

});
