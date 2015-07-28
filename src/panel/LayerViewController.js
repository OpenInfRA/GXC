/**
 * A View controller to the GXC.panel.Layer tree panel.
 */
Ext.define('GXC.panel.LayerViewController', {
    extend: 'Deft.mvc.ViewController',
    requires: [
        'GXC.menu.Layer'
    ],

    inject: [
        'layerService'
    ],

    control: {
        view: {
            itemcontextmenu: 'onShowLayerContextMenu'
        }
    },

    /**
     * Opens a context menu allowing further interaction with the selected layer.
     */
    onShowLayerContextMenu: function(view, record, item, index, event) {
        var layer = record.get('layer'),
            pos = event.getXY(),
            menu;

        if (layer !== '') {
            menu = Ext.create('GXC.menu.Layer', {
                layer: record.get('layer')
            });

            menu.show();
            menu.setPagePosition(pos);
        }

        event.stopEvent();
    }
});
