/**
 * A simple button control that delegates a lazily initialized component.
 *
 *      {
 *          "xtype": "gxc_button_viewdelegator",
 *          "iconCls": "gxc-icon-add",
 *          "tooltip": "Add Layer",
 *          "toggleGroup": "exclusiveAction",
 *          "dconfig": {
 *              "title": "Add Layer..",
 *              "width": 600,
 *              "height": 500,
 *              "layout": 'fit',
 *              "items": [{
 *                  "xtype": "gxc_panel_add",
 *                  "title": "Service"
 *              }]
 *          }
 *     }
 */
Ext.define('GXC.button.ViewDelegator', {
    extend: 'GXC.button.Button',
    requires: [
        'GXC.button.ViewDelegatorViewController'
    ],

    controller: 'GXC.button.ViewDelegatorViewController',

    alias: 'widget.gxc_button_viewdelegator',

    /**
     * Delegate configuration.
     *
     * Will be handed over as the configuration of the dtype to instantiate
     * the class.
     *
     * @cfg {Object}
     */
    dConfig: null,

    /**
     * An array that will be applied to the Ext.Component.ShowAt method positioning
     * the delegate in the viewport.
     * @cfg {Array}
     */
    dShowAt: null,

    /**
     * An array that will be applied to the Ext.Component#showBy method aligning
     * the delegate to another component.
     * @cfg {Array}
     */
    dShowBy: null,

    /**
     * Delegate type configuration.
     *
     * This is the same as a "normal" xtype definition object except it is
     * used by the ViewDelegator to initialize the component as needed.
     *
     * @cfg {Object}
     */
    dType: 'Ext.window.Window',

    /**
     * GXC icon class that will be added to the button.
     * @type {String}
     *
     * @inheritDoc
     */
    iconCls: '',

    /**
     * By default, a ViewDelegate button can be toggled.
     *
     * @inheritDoc
     */
    enableToggle: true,

    /**
     * Default toggle group for gxc interactions.
     * @cfg {String}
     */
    toggleGroup: 'gxc_interaction',

    /**
     * @inheritDoc
     */
    destroy: function() {
        delete this.dShowAt;
        delete this.dShowBy;

        this.callParent(arguments);
    }
});
