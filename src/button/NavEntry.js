/**
 * A simple button that allows to move to the first point in the navigation
 * history of the map.
 */
Ext.define('GXC.button.NavEntry', {
    extend: 'GXC.button.Button',

    alias: 'widget.gxc_button_naventry',

    inject: [
        'mapService'
    ],

    iconCls: 'gxc-icon-entry',

    tooltip: 'Back to first map extent',

    map: null,
    control: null,

    initComponent: function(config) {
        var nav, navCtrl;
        config = config || {};

        this.map = config.map || this.mapService.getMap();

        nav = this.map.getControlsByClass('OpenLayers.Control.NavigationHistory');
        if (!nav.length) {
            navCtrl = new OpenLayers.Control.NavigationHistory();
            this.map.addControl(navCtrl);
            nav = navCtrl;
        } else {
            nav = nav[0];
        }

        this.control = nav;

        this.callParent(arguments);
    },

    handler: function() {
        var stack = this.control.previousStack,
            length = stack.length,
            entryPoint = stack[length - 1];

        this.control.restore(entryPoint);
    }
});
