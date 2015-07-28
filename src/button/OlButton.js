/**
 * An abstract button component that controls a provided OpenLayers.Control.
 * Enabling/disabling and clicking/toggling the button will be forwared to the
 * Ol control.
 *
 * @class  GXC.button.OlButton
 */
Ext.define('GXC.button.OlButton', {
    extend: 'GXC.button.Button',

    alias: 'widget.olbutton',

    /**
     * The OpenLayers control this button is bound to.
     *
     * @cfg {OpenLayers.Control.Control}
     */
    control: null,

    /**
     * The OpenLayers map the bound control should be added to.
     * If map is not set on init of the button component, the
     * control will not be added to any map.
     *
     * @cfg {OpenLayers.Map}
     */
    map: null,

    /**
     * @inheritdoc
     */
    initComponent: function() {
        var control = this.control;

        if (control) {
            if (control.active !== null && !control.active) {
                this.disabled = true;
            }

            control.events.on({
                activate: this.onControlActivate,
                deactivate: this.onControlDeactivate,
                scope: this
            });
        }

        if (control && this.map) {
            this.map.addControl(control);
        }

        this.callParent(arguments);
    },

    /**
     * On click handler of the button triggering the underlying OpenLayers
     * control.
     * @return {undefined}
     */
    handler: function() {
        var ctrl = this.control;
        if (ctrl && ctrl.type == OpenLayers.Control.TYPE_BUTTON) {
            ctrl.trigger();
        }
    },

    /**
     * Called when the button is toggled.
     * @param  {GXC.button.OlButton} btn
     * @param  {Boolean} pressed
     */
    toggleHandler: function(btn, pressed) {
        if (pressed) {
            this.onEnable();
        } else {
            this.onDisable();
        }
    },

    /**
     * Triggered when the button component is activated activating the
     * underlying OpenLayers control as well.
     * @return {undefined}
     */
    onEnable: function() {
        if (this.control && !this.control.active) {
            this.control.activate();
        }
    },

    /**
     * Triggered when the button component is deactivated disabling the
     * underlying OpenLayers control as well.
     * @return {undefined}
     */
    onDisable: function() {
        if (this.control && this.control.active) {
            this.control.deactivate();
        }
    },

    /**
     * Called when the OpenLayers Control is activated, enabling the button
     * as well
     * @private
     */
    onControlActivate: function() {
        var control = this.control;
        if (control.type == OpenLayers.Control.TYPE_BUTTON) {
            this.enable();
        }
    },

    /**
     * Called when the OpenLayers Control is deactivated.
     * See GeoExt.Action.
     * @private
     */
    onControlDeactivate: function() {
        var control = this.control;
        if (control.type == OpenLayers.Control.TYPE_BUTTON) {
            this.disable();
        }
    },

    /**
     * Clean up function called on destruction of the button component.
     * @private
     */
    destroy: function() {
        if (this.control && this.map) {
            this.map.removeControl(this.control);
        }

        delete this.control;
        delete this.map;

        this.callParent(arguments);
    }
});
