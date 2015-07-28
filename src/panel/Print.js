/**
 * A print form that can be used to send print requests to GeoServer Print
 * endpoints.
 *
 * @class
 */
Ext.define('GXC.panel.Print', {
    extend: 'Ext.form.Panel',
    requires: [
        'Ext.layout.container.Form',
        'Ext.layout.container.Column',
        'GeoExt.data.MapfishPrintProvider',
        'GeoExt.panel.PrintMap',
        'GeoExt.plugins.PrintExtent',
        'GeoExt.plugins.PrintProviderField',
        'GeoExt.plugins.PrintPageField'
    ],

    inject: [
        'mapService'
    ],

    alias: 'widget.gxc_panel_print',

    /**
     * The GeoExt Map this print dialog is interacting with.
     * @type {GeoExt.panel.Map}
     */
    map: null,

    /**
     * The capabilities Object as returned by GeoServer/MapFish Print services.
     * May be used to construct the print provider without actually contacting
     * the service.
     * @type {Object}
     */
    capabilities: null,

    /**
     * The provider that is used to read printing capabilities and send printing
     * requests.
     * @type {GeoExt.data.MapfishPrintProvider}
     */
    printProvider: null,

    /**
     * The provider that is used to set page specific options.
     * @type {GeoExt.data.PrintPage}
     */
    printPage: null,

    /**
     * A vector layer that is used to represent the prints extent live on the map.
     * @type {OpenLayers.Layer.Vector}
     */
    pageLayer: null,

    /**
     * The OpenLayers Transform control that is used to interact with the print
     * extent on the map.
     * @type {OpenLayers.Control.TransformFeature}
     */
    control: null,

    /**
     * Text label of the print button.
     * @type {String}
     */
    txtPrint: 'PDF...',

    /**
     * Default text that will be used as the prints map title.
     * @type {String}
     */
    txtDefaultMapTitle: 'Map',

    /**
     * Default text that will be used as the prints comment.
     * @type {String}
     */
    txtDefaultComment: 'Add note..',

    /**
     * Default copyright notice.
     * @type {String}
     */
    txtDefaultCopyright: 'OpenInfRA ©2015',

    /**
     * Text label of title field.
     * @type {String}
     */
    txtMapTitle: 'Title',

    /**
     * Text label of comment field.
     * @type {String}
     */
    txtComment: 'Note',

    /**
     * Text label of Layout field.
     * @type {String}
     */
    txtLayout: 'Layout',

    /**
     * Text label of output format field.
     * @type {String}
     */
    txtOutputFormat: 'Format',

    /**
     * Text label of Scale field.
     * @type {String}
     */
    txtScale: 'Scale',

    /**
     * Text label of Rotation field.
     * @type {String}
     */
    txtRotation: 'Rotation',

    /**
     * Text label to north arrow checkbox field.
     * @type {String}
     */
    txtNorthArrow: 'North arrow',

    /**
     * Text label to scale bar checkbox field.
     * @type {String}
     */
    txtScaleBar: 'Scale bar',

    /**
     * Message to the load mask of the panel.
     * @type {String}
     */
    txtPrintMask: 'Retrieving PDF document',

    /**
     * Default layout.
     *
     * @inheritDoc
     */
    layout: 'form',

    bodyPadding: '10px',

    /**
     * @inheritDoc
     */
    initComponent: function() {
        var me = this,
            items;

        this.map = this.mapService.getMap();
        this.createPageLayer();
        this.createPrintProvider();
        this.createPrintPage();
        this.createControl();

        this.printPage.fit(this.map, {mode: "screen"});
        this.pageLayer.addFeatures(this.printPage.feature);
        this.map.addLayer(this.pageLayer);
        this.map.addControl(this.control);
        this.control.activate();

        if (this.printPage && this.map.getCenter()) {
            this.updateBox();
        }

        items = [{
            xtype: 'textfield',
            name: 'mapTitle',
            fieldLabel: this.txtMapTitle,
            plugins: Ext.create('GeoExt.plugins.PrintPageField',{
                printPage: this.printPage
            })
        }, {
            xtype : "textarea",
            fieldLabel : this.txtComment,
            name: 'comment',
            emptyText : this.txtEmptyComment,
            plugins : Ext.create('GeoExt.plugins.PrintPageField', {
                printPage: this.printPage
            })
        }, {
            xtype : 'combo',
            store : this.printProvider.layouts,
            name: 'template',
            displayField : 'name',
            fieldLabel : this.txtLayout,
            typeAhead : true,
            queryMode : 'local',
            forceSelection: true,
            triggerAction : 'all',
            selectOnFocus: true,
            plugins : Ext.create('GeoExt.plugins.PrintProviderField', {
                printProvider : this.printProvider
            })
        }, {
            xtype : 'combo',
            store : this.printProvider.outputFormats,
            name: 'outputFormat',
            displayField : 'name',
            fieldLabel : this.txtOutputFormat,
            typeAhead : true,
            queryMode : 'local',
            forceSelection : true,
            triggerAction : 'all',
            selectOnFocus : true,
            plugins : Ext.create('GeoExt.plugins.PrintProviderField', {
                printProvider : this.printProvider
            })
        }, {
            xtype : "combo",
            store : this.printProvider.dpis,
            displayField : "name",
            fieldLabel : "resolution",
            displayTpl : Ext.create('Ext.XTemplate', '<tpl for=".">{name} dpi</tpl>'),
            typeAhead : true,
            queryMode : 'local',
            forceSelection: true,
            triggerAction : 'all',
            selectOnFocus: true,
            plugins : Ext.create('GeoExt.plugins.PrintProviderField', {
                printProvider : this.printProvider
            })
        }, {
            xtype: 'combo',
            store: this.printProvider.scales,
            name: 'scale',
            displayField: 'name',
            fieldLabel: this.txtScale,
            typeAhead: true,
            queryMode: 'local',
            forceSelection: true,
            triggerAction: 'all',
            selectOnFocus: true,
            plugins: Ext.create('GeoExt.plugins.PrintPageField',{
                printPage: this.printPage
            })
        }, {
            xtype: 'numberfield',
            name: 'rotation',
            fieldLabel: this.txtRotation,
            plugins: Ext.create('GeoExt.plugins.PrintPageField',{
                printPage: this.printPage
            })
        }, {
            xtype : 'checkbox',
            fieldLabel : this.txtNorthArrow,
            name: 'northArrow',
            value: true,
            plugins : Ext.create('GeoExt.plugins.PrintPageField', {
                printPage: this.printPage
            })
        }, {
            xtype : 'checkbox',
            fieldLabel : this.txtScaleBar,
            name : 'scalebar',
            value: true,
            plugins : Ext.create('GeoExt.plugins.PrintPageField', {
                printPage: this.printPage
            })
        }];

        Ext.apply(this, {
            items: items,
            bbar: [{
                xtype: 'button',
                text: this.txtPrint,
                handler: function() {
                    var overviews = me.map.getControlsByClass('OpenLayers.Control.OverviewMap'),
                        legends = Ext.ComponentQuery.query('gx_legendpanel'),
                        options = {};

                    if (overviews.length) {
                        options.overview = overviews[0];
                    }

                    if (legends.length) {
                        options.legend = legends[0];
                    }

                    me.onBeforePrint();
                    me.printProvider.print(me.map, me.printPage, options);
                }
            }]
        });

        this.callParent(arguments);
    },

    /**
     * Method is derived from GeoExt.plugins.PrintExtent.
     *
     * @inheritdoc GeoExt.plugins.PrintExtent#createControl
     */
    createControl: function() {
        this.control = new OpenLayers.Control.TransformFeature(this.pageLayer, {
            preserveAspectRatio: true,
            renderIntent: 'transform',
            rotationHandleSymbolizer: 'rotate',
            eventListeners: {
                "beforetransform": this.beforeTransform,
                "transformcomplete": this.updateBox,
                scope: this
            }
        });
    },

    /**
     * Called before transforming the feature to syncronize the transform
     * feature with the pages print properties.
     * @param  {OpenLayers.Event} e
     * @return false to cancel the transformation
     *
     * @private
     */
    beforeTransform: function(e) {
        this._updating = true;
        var page = this.printPage;
        if(e.rotation) {
            if(this.printProvider.layout.get("rotation")) {
                page.setRotation(-e.object.rotation);
            } else {
                e.object.setFeature(page.feature);
            }
        } else if(e.center) {
            page.setCenter(OpenLayers.LonLat.fromString(
                e.center.toShortString()
            ));
        } else {
            page.fit(e.object.box, {mode: "closest"});
            var minScale = this.printProvider.scales.getAt(0);
            var maxScale = this.printProvider.scales.getAt(
                this.printProvider.scales.getCount() - 1);
            var boxBounds = e.object.box.geometry.getBounds();
            var pageBounds = page.feature.geometry.getBounds();
            var tooLarge = page.scale === minScale &&
                boxBounds.containsBounds(pageBounds);
            var tooSmall = page.scale === maxScale &&
                pageBounds.containsBounds(boxBounds);
            if(tooLarge === true || tooSmall === true) {
                this.updateBox();
            }
        }
        delete this._updating;
        return false;
    },

    /**
     * Updates the transformation box after setting a new scale or layout, or to
     * fit the box to the extent feature after a transform.
     *
     * @private
     */
    updateBox: function() {
        var page = this.printPage;
        if (this.control.active) {
            this.control.setFeature(page.feature, {rotation: -page.rotation});
        }
    },

    /**
     * Creates a vector layer that will be added to the map, allowing interactive
     * configuration of the print viewport.
     *
     * @private
     */
    createPageLayer: function() {
        this.pageLayer = new OpenLayers.Layer.Vector('_printExtent', {
            displayInLayerSwitcher: false,
            styleMap: new OpenLayers.StyleMap({
                // a nice style for the transformation box
                'transform': new OpenLayers.Style({
                    display: '${getDisplay}',
                    cursor: '${role}',
                    pointRadius: 5,
                    fillColor: 'white',
                    fillOpacity: 1,
                    strokeColor: 'black'
                }, {
                    context: {
                        getDisplay: function(feature) {
                            // hide the resize handle at the south-east corner
                            return feature.attributes.role === 'se-resize' ? 'none' : '';
                        }
                    }
                }),
                'rotate': new OpenLayers.Style({
                    display: '${getDisplay}',
                    pointRadius: 10,
                    fillColor: '#ddd',
                    fillOpacity: 1,
                    strokeColor: 'black'
                }, {
                    context: {
                        getDisplay: function(feature) {
                            // only display the rotate handle at the south-east corner
                            return feature.attributes.role === 'se-rotate' ? '' : 'none';
                        }
                    }
                })
            })
        });
    },

    /**
     * Helper method to init the printProvider.
     *
     * @private
     */
    createPrintProvider: function() {
        if (!this.printProvider && this.capabilities) {
            this.printProvider = Ext.create('GeoExt.data.MapfishPrintProvider', {
                capabilities: this.capabilities
            });
        }

        if (!this.printProvider) {
            Ext.Error.raise('No print provider available.');
        }

        this.printProvider.on('layoutchange', function() {
            this.updateBox();
        }, this);

        this.printProvider.on({
            print: this.onPrintProviderPrint,
            printexception: this.onPrintProviderPrintexception,
            scope: this
        });
    },

    /**
     * Helper method to create the print page.
     *
     * @private
     */
    createPrintPage: function() {
        this.printPage = Ext.create('GeoExt.data.PrintPage', {
            printProvider: this.printProvider
        });
    },

    /**
     * Called to mask the panel effectivly keeping the user from calling the
     * print method more than once.
     * @return {[type]} [description]
     */
    onBeforePrint: function() {
        var el = this.getEl();

        if (el) {
            el.mask(this.txtPrintMask);
        }
    },

    /**
     * Unmasks the panel after a successfull print.
     * @return {[type]} [description]
     */
    onAfterPrint: function() {
        var el = this.getEl();

        if (el) {
            el.unmask();
        }
    },

    /**
     * Called if the print has been successful.
     *
     * @private
     */
    onPrintProviderPrint: function() {
        this.onAfterPrint();
    },

    onPrintProviderPrintexception: function(printProvider, response) {
        Ext.Msg.alert('Print error', response.responseText || response.statusText);
        this.onAfterPrint();
    },

    /**
     * @inheritDoc
     */
    destroy: function() {
        this.map.removeControl(this.control);
        this.map.removeLayer(this.pageLayer);
        this.map = null;

        this.control.destroy();
        this.pageLayer.destroy();

        this.control = null;
        this.pageLayer = null;


        this.controller = null;

        this.callParent(arguments);
    }
});
