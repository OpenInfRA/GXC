/**
 * Simple Scale Line container that can be used to add a dynamic scale line.
 * It encapsulated the Openlayers.Control.ScaleLine control.
 */
Ext.define('GXC.component.ScaleLine', {
    extend: 'Ext.Component',
    alias: 'widget.gxc_component_scaleline',

    inject: [
        'mapService'
    ],

    cls: 'gxc-component-scaleline',

    onRender: function() {
        this.callParent(arguments);

        if (!this.map) {
            this.map = this.mapService.getMap();
        }

        this.initControl();
    },

    initControl: function() {
        var width = this.getWidth(),
            options = {
                div: this.getEl().dom,
                maxWidth: width,
                bottomOutUnits: ''
            };

        this.ctrl = new OpenLayers.Control.ScaleLine(options);
        this.map.addControl(this.ctrl);
    },

    destroy: function() {
        this.map.removeCtrl(this.ctrl);
        delete this.map;
        delete this.ctrl;
        this.callParent();
    }
});
