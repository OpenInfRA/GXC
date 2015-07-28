/**
 * A simple button component wrapper that adds minor functionality.
 * Most importantly this class is used to trigger SASS compilation of GXC specific
 * icon classes that are defined in sass/src/GXC/button/Button.scss and may be
 * overriden in derieved projects.
 *
 * Generally, this component would not be instantiated in a GXC application directly.
 */
Ext.define('GXC.button.Button', {
    extend: 'Ext.button.Button',

    alias: 'widget.gxc_button',

    listeners: {
        toggle: function(btn, pressed) {
            if (pressed && btn.untoggleByEsc) {
                this.keymap = new Ext.util.KeyMap(Ext.getBody(), [{
                    key: Ext.EventObject.ESC,
                    defaultEventAction: 'preventDefault',
                    scope: this,
                    fn: this.onEscKey
                }]);
            } else {
                this.destroyKeymap();
            }
        }
    },

    /**
     * Allows to untoggle the button by pressing the ESC key.
     * @cfg {Boolean}
     */
    untoggleByEsc: true,

    /**
     * If no overflowText is set is mirroring the text or tooltip attribute if
     * not provided seperatly.
     */
    initComponent: function() {
        var overflowText = this.overflowText || this.text || this.tooltip;
        this.overflowText = overflowText;

        this.callParent(arguments);
    },

    onEscKey: function() {
        this.toggle(false);
    },

    destroyKeymap: function() {
        if (this.keymap) {
            this.keymap.destroy();
            this.keymap = null;
        }
    },

    destroy: function() {
        this.destroyKeymap();
        this.callParent(arguments);
    }
});
