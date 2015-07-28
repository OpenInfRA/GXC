/**
 * A simple button to move to the next point of the maps navigation history if
 * any.
 */
Ext.define('GXC.button.NavNext', {
    extend: 'GXC.button.OlButton',

    alias: 'widget.gxc_button_navnext',

    inject: [
        'mapService'
    ],

    iconCls: 'gxc-icon-next',

    tooltip: 'One step forward',

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

        this.control = nav.next;

        this.callParent(arguments);
    }
});
