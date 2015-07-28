/**
 * @class
 */
Ext.define('GXC.panel.Style', {
    extend: 'Ext.panel.Panel',
    requires: [
        'GXC.panel.StyleViewController'
    ],

    controller: 'GXC.panel.StyleViewController',

    alias: 'widget.gxc_panel_style',

    /* i18n */
    titleText: 'General',
    nameFieldText: 'Name',
    titleFieldText: 'Title',
    abstractFieldText: 'Abstract',
    /** api: config[cancelText] (i18n) */
    cancelText: "Cancel",
    /** api: config[saveText] (i18n) */
    saveText: "Save",
    /* ~i18n */

    bodyPadding: '10px',

    /**
     * The user style that is in editing.
     * @type {OpenLayers.Style}
     */
    userStyle: null,

    initComponent: function() {
        var userStyle = this.userStyle;

        Ext.apply(this, {
            items: [{
                xtype: 'fieldset',
                title: this.titleText,
                items: [{
                    itemId: 'nameField',
                    xtype: 'displayfield',
                    fieldLabel: this.nameFieldText,
                    name: 'name',
                    value: userStyle.name,
                    maskRe: /[A-Za-z0-9_]/
                }, {
                    itemId: 'titleField',
                    xtype: 'textfield',
                    fieldLabel: this.titleFieldText,
                    name: 'title',
                    value: userStyle.title
                }, {
                    itemId: 'descriptionField',
                    xtype: 'textarea',
                    fieldLabel: this.abstractFieldText,
                    name: 'description',
                    value: userStyle.description
                }]
            }],
            bbar: ['->', {
                itemId: 'cancelButton',
                text: this.cancelText,
                iconCls: 'cancel'
            }, {
                itemId: 'saveButton',
                text: this.saveText,
                iconCls: 'save'
            }]
        });

        this.addEvents(
            /** api: events[change]
             *  Fires when any style property changes.
             *
             *  Listener arguments:
             *  * component - ``gxp.StylePropertiesDialog`` This dialog.
             *  * userStyle - ``OpenLayers.Style`` The updated style.
             */
            'change'
        );

        this.callParent(arguments);
    },

    destroy: function() {
        this.userStyle = null;
        this.callParent(arguments);
    }
});
