/**
 * A simple graticule control that can be activated via click.
 * Adds a graticule to the active map view.
 */
Ext.define('GXC.button.Graticule', {
    extend: 'GXC.button.OlButton',

    alias: 'widget.gxc_button_graticule',

    inject: [
        'mapService'
    ],

    iconCls: 'gxc-icon-wand',

    tooltip: 'Graticule',

    enableToggle: true,

    /**
     * @inheritdoc
     */
    initComponent: function(config) {
        config = config || {};

        this.map = config.map || this.mapService.getMap();
        this.control = config.control || new OpenLayers.Control.Graticule({
            autoActivate: false,
            displayInLayerSwitcher: false
        });

        this.callParent(arguments);
    }
});
