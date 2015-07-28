/**
 * Service methods related to the map.
 */
Ext.define('GXC.service.Layer', {
    requires: [
        'Ext.grid.Panel',
        'GeoExt.data.AttributeStore',
        'GeoExt.data.reader.WmsDescribeLayer',
        'GeoExt.data.WmsDescribeLayerStore',
        'GXC.data.WfsCapabilitiesStore',
        'GXC.data.WmsCapabilitiesStore',
        'GXC.panel.Edit'
    ],

    inject: [
        'appConfig',
        'notificationService',
        'appContext',
        'owsCapabilitiesService',
        'layerSourceStore',
        'layerStore',
        'mapService'
    ],

    txtLayerOutOfExtentTitle: 'Layer out of map extent',
    txtLayerOutOfExtent: 'The layer is out of the maps (restricted) extent.\n' +
        'Do you like to add it anyway?',

    constructor: function(config) {
        if (config === null) {
            config = {};
        }

        this.initConfig(config);

        this.appContext.on({
            'initialdataloaded': this.onInitialDataLoaded,
            'addlayer': this.onAddLayer,
            'filelayerloaded': this.addLayer,
            scope: this
        });

        return this.callParent(arguments);
    },

    /**
     * Loads the initial set of data namely layers that should be available
     * at startup.
     *
     * Works in sequence first filling the LayerSourcesStore and then
     * instantiating the layers by parsing OpenLayers.Layer via GetCapabilities-request.
     *
     * @returns {Q.deferred.promise|*}
     */
    loadInitialData: function() {
        return this.loadSourceStore()
            .then(this.initSources.bind(this))
            .then(this.addLayers.bind(this));
    },

    /**
     * Loads the configured 'layerSourceStore' returning a promise.
     *
     * @returns {Deft.promise.Deferred.promise|*}
     */
    loadSourceStore: function() {
        var deferred = Q.defer();

        this.layerSourceStore.load({
            callback: function(records, operation, success) {
                if (success) {
                    deferred.resolve(records);
                } else {
                    deferred.reject('Error loading initial layer sources');
                }
            }
        });

        return deferred.promise;
    },

    initSources: function(sources) {
        return Ext.Array.map(sources, this.initSource, this);
    },

    /**
     * Adds a GeoExt.data.LayerModel to the injected LayersStore.
     * TODO: Make sure layers from same origin are derived from only one capabilities request.
     * @param source
     * @returns {*}
     */
    initSource: function(source) {
        var service = this.owsCapabilitiesService,
            name = source.get('layer'),
            url = source.get('url'),
            type = source.get('type'),
            version = source.get('version');

        return service.loadLayer(name, url, type, version)
            .then(function(olLayer) {
                olLayer.setVisibility(source.get('visibility'));
                olLayer.setOpacity(source.get('opacity'));
                return olLayer;
            });
    },

    /**
     * Waits until all capabilities requests are settled before adding layers
     * to make sure layers are added in correct order.
     * @param {[Q.Promise]} promises
     */
    addLayers: function(promises) {
        var me = this;
        return Q.allSettled(promises)
            .then(function(inspections) {
                var length = inspections.length, i, errors = '';
                for (i = 0; i < length; i++) {
                    if (inspections[i].state === 'fulfilled') {
                        me.addLayer(inspections[i].value);
                    } else {
                        errors += inspections[i].reason + '<br>';
                    }
                }
                if (errors !== '') {
                    me.notificationService.error('Error loading layers', errors);
                }
            });
    },

    /**
     * Add an OpenLayers Layer to the injected Layer Store.
     * @param {OpenLayers.Layer} layer
     * @return {Array[Ext.data.Model]} models added to the layerstore
     */
    addLayer: function(layer) {
        if (layer.CLASS_NAME === 'OpenLayers.Layer.Vector') {
            if (layer.features.length) {
                this.determineGeometryType(layer);
            } else {
                layer.events.register('beforefeatureadded', this,
                    this.onLayerBeforeFeatureAdded);
            }
        }

        this.setDefaultLayerProperties(layer);

        return this.layerStore.add(layer);
    },

    onLayerBeforeFeatureAdded: function(e) {
        var layer = e.object;
        if (this.determineGeometryType(layer)) {
            layer.events.unregister('beforefeatureadded', this,
                this.onLayerBeforeFeatureAdded);
        }
    },

    /**
     * Since WFS does not describe the geometry type in a transparent way
     * we need to fall back on this to set the appropiate style map. Returns true
     * if successful.
     * @param  {OpenLayers.Layer} layer
     * @return {Boolean}
     */
    determineGeometryType: function(layer) {
        var feature = layer.features[0],
            geometryType,
            styleMap = new OpenLayers.StyleMap(),
            defaultStyle = styleMap.styles['default'],
            types = ['Point', 'Line', 'Polygon'],
            symbolizerType;

        if (!feature) {
            return false;
        }

        // we save the geometryType as metadata for styling
        // no layer restrictions on the type though as it's not clear
        // wether it breaks wfs interactions later on
        // TODO: clean this up
        layer.metadata.geometryType = geometryType = feature.geometry.CLASS_NAME;

        // geometry types like multilinestring need to be mapped to symbolizers
        for (var i = 0; i < types.length; i++) {
            if (geometryType.indexOf(types[i]) !== -1) {
                symbolizerType = types[i];
            }
        }

        // to have predicatable default feature styles editing we remove
        // the inherited default style
        defaultStyle.defaultStyle = { extendDefault: false };

        // a simple default rule is added
        defaultStyle.rules.push(new OpenLayers.Rule({
            name: ' ',
            symbolizer: new OpenLayers.Symbolizer[symbolizerType]({
                fillColor: this.randomHexColor(),
                fillOpacity: 0.75,
                labelAlign: "cm",
                pointRadius: 2,
                strokeColor: this.randomHexColor(),
                strokeOpacity: 1,
                strokeWidth: 2
            })
        }));

        // we set the layers style map to the newly created style map
        layer.styleMap = styleMap;

        return true;
    },

    randomHexColor: function() {
        return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
    },

    /**
     * Sets default OpenLayers properties that are used througout GXC.
     * @param {OpenLayers.Layer} layer
     */
    setDefaultLayerProperties: function(layer) {
        var map = this.mapService.getMap();

        // calculate maxExtent of layer in map projection from metadata
        if (layer.metadata && Ext.isArray(layer.metadata.llbbox)) {
            layer.maxExtent = OpenLayers.Bounds.fromArray(layer.metadata.llbbox)
                    .transform('EPSG:4326', map.getProjectionObject());
        }

        // always request single tiles with WMS to support sup-scales
        if (layer.CLASS_NAME === 'OpenLayers.Layer.WMS') {
            layer.singleTile = true;
        }

        if (layer.CLASS_NAME === 'OpenLayers.Layer.Vector' && layer.protocol) {
            layer.projection = new OpenLayers.Projection(map.getProjection());
            layer.protocol.srsName = map.getProjection();
        }

        // never wrapDateLine
        layer.wrapDateLine = false;

        return layer;
    },

    /**
     * Raises the layer one step.
     */
    raiseLayer: function(layer) {
        this.moveLayer(layer, 1);
    },

    /**
     * Lowers the layer one step.
     */
    lowerLayer: function(layer) {
        this.moveLayer(layer, -1);
    },

    /**
     * Allows vertical movement of the layer.
     */
    moveLayer: function(layer, diff) {
        var map = this.mapService.getMap(),
            idx = map.getLayerIndex(layer),
            userLayers, userLayersIdx, i;

        // guard clause to check if layer is pseudo base layer
        if (idx <= 0) {
            return;
        }

        // only layers that can be seen by the user should be moved
        userLayers = map.getLayersBy('displayInLayerSwitcher', true);
        userLayersIdx = Ext.Array.map(userLayers, function(l) {
            return map.getLayerIndex(l);
        });
        i = Ext.Array.indexOf(userLayersIdx, idx);

        // raise layer above next higher user layer index
        if ((i > -1) && (userLayersIdx[i + diff])) {
            map.setLayerIndex(layer, userLayersIdx[i + diff]);
        }
    },

    removeLayer: function(layer) {
        var map = this.mapService.getMap(),
            idx;
        if (layer) {
            map = layer.map;
            idx = map.getLayerIndex(layer);
            if (idx > 0) {
                map.removeLayer(layer);
            }
        }
    },

    /**
     * Zooms to the extent of the OpenLayers layer.
     * Extent is extracted via Capabilities of the OWS Layer.
     *
     * @returns {undefined}
     */
    zoomToLayerExtent: function(layer) {
        var extent = this.getLayerExtent(layer);
        if (extent) {
            this.appContext.zoomToExtent(extent);
        }
    },

    /**
     * Returns the extent of the provided layer.
     */
    getLayerExtent: function(layer) {
        var extent;

        if (layer instanceof OpenLayers.Layer.Vector) {
            extent = layer.getDataExtent();
            // any other layer should provide bounds from the
            // capabilities request
        } else if (layer instanceof OpenLayers.Layer) {
            extent = this.getRasterLayerExtent(layer);
        }

        return extent;
    },

    getRasterLayerExtent: function(layer) {
        var metadata = layer.metadata, bounds;

        if (layer.maxExtent) {
            return layer.getMaxExtent();
        }
        // most common case is bbox provided as LatLon Bounds
        if (metadata.hasOwnProperty('llbbox')) {
            return OpenLayers.Bounds.fromArray(metadata.llbbox);
            // other instances bbox is provided as projected bbox
        } else if (metadata.hasOwnProperty('bbox')) {
            // bounds are given as EPSG-keyed arrays
            bounds = metadata.bbox;
            // test if bounds are given in map projection
            if (bounds.hasOwnProperty('EPSG:4326')) {
                return OpenLayers.Bounds.fromArray(bounds['EPSG:4326'].bbox);
            }
        }
    },

    editLayer: function(layer) {
        var me = this,
            protocol;

        // WMS layer may be edited with linked WFS services
        if (layer.CLASS_NAME === 'OpenLayers.Layer.WMS') {
            this.describeWmsLayer(layer)
            .then(this.findFeatureType.bind(this))
            .then(this.getFeatureTypeAttributes.bind(this))
            .then(function(attributes) {
                var panel = Ext.create('GXC.panel.Edit', {
                    height: 300,
                    width: 400,
                    sourceLayer: layer,
                    featureType: attributes.featureType,
                    attributeStore: attributes.attributeStore
                });
            })
            .fail(function(error) {
              console.log(error);
                me.notificationService.error('Error', error);
            }).done();

        // WFS layer may be edited directly
        // TODO: Fix this to work with other WFS versions.
        } else if (layer.CLASS_NAME === 'OpenLayers.Layer.Vector' &&
            layer.protocol &&
            layer.protocol.CLASS_NAME.startsWith('OpenLayers.Protocol.WFS')) {
            protocol = layer.protocol;
            this.getFeatureTypeAttributes({
                owsURL: protocol.url,
                typeName: protocol.featureType
            })
            .then(function(attributes) {
                Ext.create('GXC.panel.Edit', {
                    height: 300,
                    width: 400,
                    sourceLayer: layer,
                    featureType: attributes.featureType,
                    attributeStore: attributes.attributeStore
                });
            })
            .fail(function(error) {
                console.log(error);
                me.notificationService.error(error);
            }).done();
        } else {
            Ext.MessageBox.alert('Error', 'Editing this type of layer is not yet supported');
        }
    },

    describeWmsLayer: function(layer) {
        var deferred = Q.defer(),
            version = layer.params['VERSION'],
            store;

        if (parseFloat(version) > 1.1) {
            //TODO don't force 1.1.1, fall back instead
            version = '1.1.1';
        }

        store = Ext.create('GeoExt.data.WmsDescribeLayerStore', {
            url: layer.url,
            proxy: {
                type: 'ajax',
                extraParams: {
                    'SERVICE': 'WMS',
                    'VERSION': version,
                    'REQUEST': 'DescribeLayer',
                    'LAYERS': [layer.params['LAYERS']].join(',')
                },
                reader: {
                    type: 'gx_wmsdescribelayer'
                }
            }
        });

        store.load({
            callback: function(records, operation, success) {
                if (success) {
                    deferred.resolve(store);
                } else {
                    deferred.reject('Error loading initial layer sources');
                }
            }
        });

        return deferred.promise;
    },

    findFeatureType: function(describeWmsLayerStore) {
        var index = describeWmsLayerStore.find('owsType', 'WFS');

        if (index === -1) {
            throw Error('layer does not support editing.');
        }

        return describeWmsLayerStore.getAt(index).getData();
    },

    getFeatureTypeAttributes: function(featureType) {
        var deferred = Q.defer(),
            url = featureType.owsURL,
            store;

        url += url.slice(-1) === '?' ? '' : '?';
        url += 'service=wfs&version=1.0.0&request=DescribeFeatureType' +
                '&typeName=' + featureType.typeName;

        store = Ext.create('GeoExt.data.AttributeStore', {
            url: url
        });

        store.load({
            callback: function(records, operation, success) {
                if (success) {
                    deferred.resolve({
                        featureType: featureType,
                        attributeStore: store
                    });
                } else {
                    deferred.reject('Error loading featureType attributes');
                }
            }
        });

        return deferred.promise;
    },

    onAddLayer: function(layer) {
        var map = this.mapService.getMap(),
            mapExtent = map.getMaxExtent({ restricted: true }),
            layerExtent;

        this.setDefaultLayerProperties(layer);

        layerExtent = this.getLayerExtent(layer);
        if (layerExtent && !layerExtent.intersectsBounds(mapExtent)) {
            Ext.Msg.show({
                 title: this.txtLayerOutOfExtentTitle,
                 msg: this.txtLayerOutOfExtent,
                 buttons: Ext.Msg.YESNO,
                 icon: Ext.Msg.QUESTION,
                 fn: function(btn) {
                    if (btn === 'yes') {
                        this.addLayer(layer);
                    }
                },
                scope: this
            });
        } else {
            this.addLayer(layer);
        }
    },

    onInitialDataLoaded: function() {
        var index = this.layerSourceStore.findBy(function(rec) {
                return (rec.get('select') ? true : false);
            }),
            record = (index !== -1 ? this.layerSourceStore.getAt(index) : false),
            select,
            map = this.mapService.getMap();

        if (record) {
            select = record.get('select');

            Ext.Ajax.request({
                url: this.appConfig.get('geoserver').host + '/ows?',
                params: {
                    "OUTPUTFORMAT": "application/json",
                    "SERVICE": "WFS",
                    "VERSION": "1.3.0",
                    "REQUEST": "GETFEATURE",
                    "TYPENAMES": record.get('layer'),
                    "SRSNAME": map.getProjection(),
                    "FEATUREID": select.featureId
                },
                method: "GET",
                disableCaching: false,
                success: function(response) {
                    var result = new OpenLayers.Format.GeoJSON().read(
                        response.responseXML && response.responseXML.documentElement ?
                            response.responseXML : response.responseText),
                        layer, featureItems = [];

                    if (result && result.length) {
                        layer = new OpenLayers.Layer.Vector('initialSelect', {
                            displayInLayerSwitcher: false,
                            projection: map.getProjection()
                        });
                        map.addLayer(layer);
                        layer.addFeatures(result);

                        // center map on selected feature
                        map.zoomToExtent(layer.getDataExtent());

                        Ext.each(result, function(feature) {
                            var sourceConfig = {};

                            Ext.Object.each(feature.attributes, function(key) {
                                sourceConfig[key] = {
                                    editor: Ext.create('Ext.form.DisplayField')
                                };
                            });

                            featureItems.push({
                                xtype: 'propertygrid',
                                title: feature.fid,
                                source: feature.attributes,
                                sourceConfig: sourceConfig
                            });
                        });

                        if (featureItems.length > 0) {
                            Ext.create('GeoExt.window.Popup', {
                                title: 'Properties',
                                width: 300,
                                height: 250,
                                layout: 'accordion',
                                items: featureItems,
                                location: result[0],
                                listeners: {
                                    close: function() {
                                        map.removeLayer(layer);
                                        layer.destroy();
                                    }
                                }
                            }).show();
                        }
                    }
                },
                scope: this
            });
        }
    }
});
