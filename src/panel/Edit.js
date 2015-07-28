/**
 * An Editing/Attributes panel that can be used with WMS/WFS layers.
 */
Ext.define('GXC.panel.Edit', {
    extend: 'Ext.window.Window',
    requires: [
        'GeoExt.Action',
        'Ext.grid.column.Number',
        'GeoExt.data.WmsDescribeLayerStore',
        'GeoExt.data.FeatureStore',
        'GeoExt.selection.FeatureModel',
        'GeoExt.data.proxy.Protocol',
        'Ext.grid.plugin.RowEditing'
    ],

    alias: 'widget.gxc_window_edit',

    inject: [
        'notificationService',
        'mapService'
    ],

    /**
     * The layer that the editing layer is derieved from.
     * If the source layer is a WFS layer, it may be used directly.
     * @type {OpenLayers.Layer}
     */
    sourceLayer: null,

    /**
     * The editing layer which must suppoert WFST.
     * @type {OpenLayers.Layer.Vector}
     */
    editingLayer: null,

    /**
     * A control that will be used to select the feature to edit.
     * @type {OpenLayers.Control.SelectFeature}
     */
    selectControl: null,

    /**
     * A modify control that is used to modify the feature.
     * @type {OpenLayers.Control.ModifyFeature}
     */
    modifyControl: null,

    layout: 'fit',

    autoShow: true,

    txtError: 'Tansaction error',

    initComponent: function() {
        var that = this,
            map = this.mapService.getMap(),
            featureType = this.featureType,
            attributeStore = this.attributeStore,
            featureTypeAttrs = attributeStore.model.featureTypeAttrs,
            fields = [],
            columns = [],
            geometryName, geometryType,
            geomRegex = /gml:(Multi)?(Point|Line|Polygon|Surface|Geometry).*/,
            types = {
                // mapping of xml schema data types to Ext JS data types
                'xsd:int': 'int',
                'xsd:short': 'int',
                'xsd:long': 'int',
                'xsd:string': 'string',
                'xsd:dateTime': 'string',
                'xsd:double': 'float',
                'xsd:decimal': 'float',
                // mapping of geometry types
                'Line': 'Path',
                'Surface': 'Polygon'
            };

        // generate the grids columns and the underlying stores fields.
        attributeStore.each(function(rec) {
            var type = rec.get('type'),
                name = rec.get('name'),
                match = geomRegex.exec(type);

            if (match) {
                // we found the geometry column
                geometryName = name;
                // Geometry type for the sketch handler:
                // match[2] is "Point", "Line", "Polygon", "Surface" or "Geometry"
                geometryType = types[match[2]] || match[2];
            } else {
                // we have an attribute column
                fields.push({
                    name: name,
                    type: types[type]
                });
                columns.push({
                    xtype: types[type] === 'string' ?
                        'gridcolumn' :
                        'numbercolumn',
                    flex: 1,
                    dataIndex: name,
                    header: name,
                    // textfield editor for strings, numberfield for others
                    editor: {
                        xtype: types[type] === "string" ?
                            "textfield" :
                            "numberfield"
                    },
                    renderer: function(value, metaData) {
                        metaData.tdAttr = 'data-qtip="' + value + '"';
                        return value;
                    }
                });
            }
        });

        if (this.sourceLayer.CLASS_NAME === 'OpenLayers.Layer.Vector' &&
                this.sourceLayer.protocol) {
            // if the layer is a WFS layer we just have to make sure it
            // has the appropiate strategies to work with
            this.editingLayer = this.sourceLayer;

            this.saveStrategy = Ext.Array.findBy(this.editingLayer.strategies,
                function(strategy) {
                if (strategy instanceof OpenLayers.Strategy.Save) {
                    return true;
                }
            }, this);

            if (!this.saveStrategy) {
                this.saveStrategy = new OpenLayers.Strategy.Save();
                this.saveStrategy.setLayer(this.editingLayer);
                this.editingLayer.strategies.push(this.saveStrategy);
            }
        } else {
            this.saveStrategy = new OpenLayers.Strategy.Save();

            this.editingLayer = new OpenLayers.Layer.Vector("gx_edit", {
                strategies: [
                    new OpenLayers.Strategy.Fixed(),
                    this.saveStrategy
                ],
                protocol: new OpenLayers.Protocol.WFS({
                    url: featureType.owsURL,
                    version: "1.0.0",
                    srsName: map.getProjection(),
                    geometryName: geometryName,
                    featureType: featureTypeAttrs.typeName,
                    featurePrefix: featureTypeAttrs.targetPrefix,
                    featureNS: featureTypeAttrs.targetNamespace
                }),
                displayInLayerSwitcher: false
            });

            map.addLayer(this.editingLayer);
        }

        this.saveStrategy.events.on({
            success: this.onSaveStrategySuccess,
            fail: this.onSaveStrategyFail,
            scope: this
        });

        this.modifyControl = new OpenLayers.Control.ModifyFeature(this.editingLayer, {
            standalone: true
        });

        this.drawControl = new OpenLayers.Control.DrawFeature(this.editingLayer,
            OpenLayers.Handler[geometryType], {
                handlerOptions: {multi: true}
            }
        );

        map.addControls([this.modifyControl, this.drawControl]);

        this.featureStore = Ext.create('GeoExt.data.FeatureStore', {
            layer: this.editingLayer,
            fields: fields,
            autoLoad: this.editingLayer !== this.sourceLayer
        });

        this.editingLayer.events.on({
            featuremodified: function(e) {
                var record = this.featureStore.getByFeature(e.feature),
                    grid = this.query('grid')[0];

                if (record) {
                  record.setDirty();
                }

                if (grid) {
                  grid.getView().refresh();
                }
            },
            scope: this
        });

        this.items = [
            Ext.create('Ext.grid.Panel', {
                xtype: 'grid',
                plugins: [{
                    ptype: 'rowediting',
                    clicksToEdit: 2
                }],
                itemId: 'featuregrid',
                title: 'Feature Table',
                height: 300,
                selType: 'featuremodel',
                selModel: {
                    mode: 'SINGLE'
                },
                store: this.featureStore,
                columns: columns,
                bbar: [{
                    text: "Delete",
                    handler: function() {
                        var grid = this.up('grid'),
                            sm = grid.getSelectionModel();

                        grid.getStore().featureFilter = new OpenLayers.Filter({
                            evaluate: function(feature) {
                                return feature.state !== OpenLayers.State.DELETE;
                            }
                        });

                        Ext.Array.each(sm.getSelection(), function(rec) {
                            var feature = rec.raw;
                            that.modifyControl.unselectFeature(feature);
                            that.editingLayer.removeFeatures([feature]);
                            if (feature.state !== OpenLayers.State.INSERT) {
                                feature.state = OpenLayers.State.DELETE;
                                that.editingLayer.addFeatures([feature]);
                            }
                        });
                    }
                },
                Ext.create('Ext.button.Button', Ext.create('GeoExt.Action', {
                    control: this.drawControl,
                    text: 'Create',
                    enableToggle: true
                })), {
                    text: 'Save',
                    handler: function() {
                        that.drawControl.deactivate();
                        that.modifyControl.deactivate();
                        this.saveStrategy.save();
                    },
                    scope: this
                }],
                listeners: {
                    beforedestroy: function(grid) {
                        var sm = grid.getSelectionModel();
                        sm.deselectAll();
                        sm.unbindLayer();
                        sm.destroy();
                    }
                }
            })
        ];

        this.editingLayer.events.on({
            featureselected: this.selectFeature,
            featureunselected: this.unselectFeature,
            scope: this
        });

        this.callParent(arguments);
    },

    /**
     * Called when the save strategy of the editing layer succeeds.
     * Commits the changes on the client side to reflect server state.
     * WMS-Layers are redrawn to update map view.
     */
    onSaveStrategySuccess: function() {
        Ext.Array.each(this.featureStore.getModifiedRecords(), function(model) {
            model.commit();
        });

        if (this.sourceLayer.CLASS_NAME === 'OpenLayers.Layer.WMS') {
            this.sourceLayer.redraw(true);
        }
    },

    /**
     * Called when the save strategy of the editing layers fails.
     * Shows an error message that is retrieved from the server response.
     * @param  {String} e The Error
     */
    onSaveStrategyFail: function(e) {
        var responseDoc = e.response.priv.responseXML,
            messageNode = responseDoc.getElementsByTagName('Message')[0];

        if (messageNode) {
            this.notificationService.error(this.txtError, messageNode.innerHTML);
        } else {
            this.notificationService.error(this.txtError, 'An error occured');
        }
    },

    /**
     * Called on feature selection of the editing layer.
     * Activated the modify control to allow interactive changes to the feature.
     * @param  {[type]} e The event
     */
    selectFeature: function(e) {
        this.modifyControl.selectFeature(e.feature);
        this.modifyControl.activate();
    },

    /**
     * Called on unselect on a feature.
     * Deactivates the modify control.
     *
     * @param  {[type]} e The event
     */
    unselectFeature: function(e) {
        this.modifyControl.unselectFeature(e.feature);
        this.modifyControl.deactivate();
    },

    /**
     * Unbinds event handlers on destroy of the panel.
     */
    onDestroy: function() {
        var map = this.mapService.getMap();

        this.saveStrategy.events.un({
            success: this.onSaveStrategySuccess,
            scope: this
        });

         this.editingLayer.events.un({
            featureselected: this.selectFeature,
            featureunselected: this.unselectFeature,
            scope: this
        });

        this.featureStore.unbind();

        this.modifyControl.deactivate();
        this.drawControl.deactivate();

        this.modifyControl.destroy();
        this.drawControl.destroy();
        delete this.modifyControl;
        delete this.drawControl;

        // we keep the layer on the map if it wasn't provided by us.
        if (this.editingLayer !== this.sourceLayer) {
            map.removeLayer(this.editingLayer);
            this.editingLayer.destroy();
        } else {
            this.editingLayer.strategies[0].load();
        }

        delete this.saveStrategy;
        delete this.editingLayer;
        delete this.attributeStore;
        delete this.featureType;

        this.callParent(arguments);
    }
});
