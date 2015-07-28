/**
 * A simple control to move to the last point in the navigation history.
 */
Ext.define('GXC.button.NavPrevious', {
    extend: 'GXC.button.OlButton',

    alias: 'widget.gxc_button_navprevious',

    inject: [
        'mapService'
    ],

    iconCls: 'gxc-icon-previous',

    tooltip: 'One step back',

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

        this.control = nav.previous;

        this.callParent(arguments);
    }
});
