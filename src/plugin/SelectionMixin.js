/**
 * @class
 */
Ext.define('GXC.plugin.SelectionMixin', {

    selModel: {
        allowDeselect: true,
        enableKeyNav: true,
        mode: 'MULTI'
    },

    listeners: {
        /**
         * Selection change handler of the services panel.
         * Item specific action buttons should only be enabled when
         * user selection has the length of 1.
         */
        selectionchange: function(sm, selection) {
            var length = selection.length
                buttons = this.query('toolbar button');

            if (length === 0) {
                Ext.Array.forEach(buttons, function(button) {
                    button.setDisabled(!button.hasCls('independentAction'));
                });
            } else if (length === 1) {
                Ext.Array.forEach(buttons, function(button) {
                    button.setDisabled(false);
                });
            } else {
                Ext.Array.forEach(buttons, function(button) {
                    button.setDisabled(button.hasCls('itemAction'));
                });
            }
        }
    }
})
