/**
 * Shows a floating OverviewMap map above the mappanel.
 */
Ext.define('GXC.button.OverviewMap', {
    extend: 'GXC.button.ViewDelegator',
    requires: [
        'GXC.OverviewMap'
    ],

    alias: 'widget.gxc_button_overviewmap',

    /**
     * Component is injected with
     * * mapService
     *
     * @cfg {Array}
     */
    inject: [
        'mapService'
    ],

    /**
     * The Openlayers map the overview is associated with.
     * @property {OpenLayers.Map} map
     */
    map: null,

    /**
     * The overview OpenLayers Overview control.
     * @property {OpenLayers.Control.OverviewMap}
     */
    ov: null,

    /**
     * The default width of the overview map.
     * @cfg {Number}
     */
    ovWidth: 250,

    /**
     * The default height of the overview map.
     * @cfg {Number}
     */
    ovHeight: 250,

    /**
     * The default icon of the button.
     * @cfg {String}
     */
    iconCls: 'gxc-icon-map',

    /**
     * The tooltip of the button.
     * @cfg {String}
     */
    tooltip: 'Show overview map',

    txtWindowTitle: 'Overview',

    toggleGroup: null,

    /**
     * Allows to untoggle the button by pressing the ESC key.
     * @cfg {Boolean}
     */
    untoggleByEsc: false,

    initComponent: function() {
        this.map = this.mapService.getMap();

        this.dShowBy = ['gxc_panel_map', 'bl', [10, -35 - this.ovHeight]];

        this.dConfig = {
            title: this.txtWindowTitle,
            layout: 'fit',
            items: [{
                xtype: 'gxc_overviewmap',
                map: this.map,
                layersFn: function(layer) {
                    return (layer.getVisibility() &&
                        layer.CLASS_NAME !== 'OpenLayers.Layer.Vector');
                },
                dynamic: true
            }],
            width: this.ovWidth,
            height: this.ovHeight,
            resizable: {
                heightIncrement: 10,
                widthIncrement: 10
            },
            listeners: {
                move: function() {
                    // quick fix for wrong mouse positions in events
                    this.down('gxc_overviewmap').reinitControl();
                }
            }
        };

        this.callParent(arguments);
    },

    /**
     * Disposes of linked objects.
     *
     * @inheritDoc
     */
    destroy: function() {
        delete this.map;
        delete this.ov;

        this.callParent(arguments);
    }
});
