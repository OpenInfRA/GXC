/**
 * A component encapsulating an OpenLayers.Control.OverviewMap control.
 *
 * When you use this component in an application, make sure to include the
 * stylesheet 'overviewmap.css' or add the following to your own stylesheet.
 *
 * <code>
 * .gx-overview-map .olControlOverviewMapElement { padding: 0; }
 * </code>
 *
 * @class GXC.OverviewMap
 */
Ext.define('GXC.OverviewMap', {
    extend: 'Ext.Component',
    alias: 'widget.gxc_overviewmap',

    /**
     * Custom CSS class added to this components #cls.
     *
     * @property {String}
     */
    ovCls: 'gx-overview-map',

    /**
     * The OpenLayers.Map that this overview is bound to. If not set by the user
     * a gx_mappanel's map will be guessed.
     *
     * @cfg {OpenLayers.Map}
     */
    map: null,

    /**
     * Function is called with the maps scope and can be used to filter the maps
     * layers for those that should be visible on the overview map.
     * Filtered layers are merged with the layers provided to the overview map
     * component per properties.
     * @type {[type]}
     */
    layersFn: null,

    /**
     * If set to true the overview will be reinitialized on "baselayerchange"
     * events of its bound map.
     * This can be used to make sure that the overview shows the same baselayer
     * as the map.
     *
     * @cfg {Boolean}
     */
    dynamic: false,

    /**
     * The overview options that the underlying OpenLayers.Control.OverviewMap
     * will be initialized with. Following settings are defaults and should
     * generally not be overridden:
     *
     * - "div" configuration will default to the containers DOM element
     * - "size" will default to the containers actual dimensions
     * - "maximized" will always be true to make the overview visible
     *
     * If you want to hide the overview map, simple use the components show/hide
     * methods.
     *
     * @cfg {Object}
     */
    overviewOptions: null,

    /**
     * Reference to the OpenLayers.Control.OverviewMap control.
     *
     * @property @readonly {OpenLayers.Control.OverviewMap}
     */
    ctrl: null,

    initComponent: function() {
        if (!this.map) {
            this.map = GeoExt.panel.Map.guess().map;
        }

        // add gx class making sure it won't be overridden on accident
        this.addCls(this.ovCls);

        // bind to the components lifecycle events to make sure the overview is
        // added and removed from the map when the component is (in-)visible.
        this.on({
            'show': this.reinitControl,
            'resize': this.reinitControl,
            'hide': this.destroyControl,
            scope: this
        });

        if (this.dynamic) {
            this.map.events.on({
                addlayer: this.reinitControl,
                removelayer: this.reinitControl,
                changelayer: this.reinitControl,
                changebaselayer: this.reinitControl,
                scope: this
            });
        }

        this.callParent();
    },

    /**
     * Destroys the encapsulated OpenLayers.Control.OverviewMap removing it from
     * the map controls and unbinds all events from this component.
     * Deletes the components ctrl, map and overviewOptions members.
     *
     * @private
     */
    destroy: function() {
        this.destroyControl();

        this.un({
            'show': this.reinitControl,
            'resize': this.reinitControl,
            'hide': this.destroyControl,
            scope: this
        });

        this.map.events.un({
            addlayer: this.onLayerChange,
            removelayer: this.onLayerChange,
            changelayer: this.reinitControl,
            changebaselayer: this.reinitControl,
            scope: this
        });

        delete this.ctrl;
        delete this.map;
        delete this.overviewOptions;

        this.callParent(arguments);
    },

    /**
     * Reinits overview map if a user controlled layer is added or removed
     * to the map.
     * @param  {OpenLayers.Event} e
     */
    onLayerChange: function(e) {
        if (e.layer.displayInLayerSwitcher) {
            this.reinitControl();
        }
    },

    /**
     * Helper method that refers to the private initControl and destroyControl
     * methods to force an update of the overview map by bluntly creating a new one.
     * This can be called to update the map after setting new #overviewOptions.
     */
    reinitControl: function() {
        this.destroyControl();

        if (this.isVisible()) {
            this.initControl();
        }
    },

    /**
     * Initializes an OpenLayers.Control.OverviewMap control adding it to the
     * configured map.
     *
     * @private
     */
    initControl: function() {
        var map = this.map,
            layers = map.layers,
            size = this.getSize(),
            options = {
                div: this.getEl().dom,
                size: new OpenLayers.Size(size.width, size.height),
                maximized: true,
                layers: [],
                mapOptions: {
                    theme: null,
                    fallThrough: true,
                    minScale: map.options.minScale,
                    maxScale: map.options.maxScale,
                    numZoomLevels: map.options.numZoomLevels,
                    projection: map.getProjection()
                }
            }, lyr;

        Ext.applyIf(options, this.overviewOptions);

        if (Ext.isFunction(this.layersFn)) {
            Ext.Array.each(layers, function(layer) {
                if (this.layersFn(layer)) {
                    lyr = layer.clone();
                    lyr.alwaysInRange = true;
                    options.layers.push(lyr);
                }
            }, this);
        }

        if (!options.layers.length) {
            options.layers.push(new OpenLayers.Layer());
        }

        if (map.allOverlays) {
            options.layers[0].setIsBaseLayer(true);
        }

        this.ctrl = new OpenLayers.Control.GXCOverviewMap(options);
        map.addControl(this.ctrl);
    },

    /**
     * Destroys the OpenLayers.Control.OverviewMap control after removing it
     * from this components bound map.
     *
     * @private
     */
    destroyControl: function() {
        if (this.ctrl) {
            this.map.removeControl(this.ctrl);
            this.ctrl.destroy();
            this.ctrl = null;
        }
    }
});
