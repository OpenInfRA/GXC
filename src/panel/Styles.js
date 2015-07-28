Ext.define('GXC.panel.Styles', {
    extend: 'Ext.form.Panel',
    requires: [
        'GXC.panel.StylesViewController'
    ],

    controller: 'GXC.panel.StylesViewController',

    alias: 'widget.gxc_panel_styles',

    /**
     * The layer record that the styles are derieved from.
     * @cfg {GXC.model.Layer}
     */
    layerRecord: null,

    /**
     * Store that holds information about the available styles of a layer.
     * @cfg {GXC.data.StyleStore}
     */
    stylesStore: null,

    /** api: config[addStyleText] (i18n) */
    addStyleText: 'Add',
    /** api: config[addStyleTip] (i18n) */
    addStyleTip: 'Add a new style',
    /** api: config[chooseStyleText] (i18n) */
    chooseStyleText: 'Choose style',
    /** api: config[addStyleText] (i18n) */
    deleteStyleText: 'Remove',
    /** api: config[addStyleTip] (i18n) */
    deleteStyleTip: 'Delete the selected style',
    /** api: config[addStyleText] (i18n) */
    editStyleText: 'Edit',
    /** api: config[addStyleTip] (i18n) */
    editStyleTip: 'Edit the selected style',
    /** api: config[addStyleText] (i18n) */
    duplicateStyleText: 'Duplicate',
    /** api: config[addStyleTip] (i18n) */
    duplicateStyleTip: 'Duplicate the selected style',
    exportStyleText: 'Export',
    exportStyleTip: 'Export the selected style as an SLD file',
    /** api: config[cancelText] (i18n) */
    cancelText: 'Cancel',
    /** api: config[saveText] (i18n) */
    saveText: 'Save',
    /** api: config[stylePropertiesWindowTitle] (i18n) */
    styleWindowTitle: 'User Style: {0}',
    /** api: config[stylesFieldsetTitle] (i18n) */
    stylesFieldsetTitle: 'Styles',
    errorTitle: 'Error saving style',
    /** api: config[errorMsg] (i18n) */
    errorMsg: 'There was an error saving the style back to the server.',

    dialogCls: 'Ext.window.Window',

    bodyPadding: '10px',

    fieldDefaults: {
        anchor: '100%'
    },

    initComponent: function() {
        var layerRecord = this.layerRecord,
            layer = layerRecord.getLayer(),
            styles = layer.metadata.styles || [],
            value;

        if (layer.params) {
            value = layer.params.STYLES;
        }

        value = value ? value : '';

        this.addEvents(
            /** api: event[ready]
             *  Fires when this component is ready for user interaction.
             */
            'ready',

            /** api: event[modified]
             *  Fires on every style modification.
             *
             *  Listener arguments:
             *
             *  * :class:`gxp.WMSStylesDialog` this component
             *  * ``String`` the name of the modified style
             */
            'modified',

            /** api: event[styleselected]
             *  Fires whenever an existing style is selected from this dialog's
             *  Style combo box.
             *
             *  Listener arguments:
             *
             *  * :class:`gxp.WMSStylesDialog` this component
             *  * ``String`` the name of the selected style
             */
            'styleselected',

            /** api: event[beforesaved]
             *  Fires before the styles are saved (using a
             *  :class:`gxp.plugins.StyleWriter` plugin)
             *
             *  Listener arguments:
             *
             *  * :class:`gxp.WMSStylesDialog` this component
             *  * ``Object`` options for the ``write`` method of the
             *    :class:`gxp.plugins.StyleWriter`
             */
            'beforesaved',

            /** api: event[saved]
             *  Fires when a style was successfully saved. Applications should
             *  listen for this event and redraw layers with the currently
             *  selected style.
             *
             *  Listener arguments:
             *
             *  * :class:`gxp.WMSStylesDialog` this component
             *  * ``String`` the name of the currently selected style
             */
            'saved'
        );

        this.stylesStore = Ext.create('GXC.data.StyleStore', {
            data: styles
        });

        Ext.apply(this, {
            items: [{
                itemId: 'stylesFieldSet',
                xtype: 'fieldset',
                title: this.stylesFieldsetTitle,
                items: [{
                    itemId: 'stylesCombo',
                    xtype: 'combo',
                    fieldLabel: this.chooseStyleText,
                    editable: false,
                    displayField: 'title',
                    valueField: 'name',
                    queryMode: 'local',
                    triggerAction: 'all',
                    forceSelection: true,
                    store: this.stylesStore,
                    value: value
                }]
            }, {
                xtype: 'toolbar',
                itemId: 'stylesToolbar',
                items: [{
                    xtype: 'button',
                    itemId: 'addButton',
                    iconCls: 'gxc-icon-add',
                    text: this.addStyleText,
                    tooltip: this.addStyleTip
                }, {
                    xtype: 'button',
                    itemId: 'deleteButton',
                    iconCls: 'gxc-icon-remove',
                    text: this.deleteStyleText,
                    tooltip: this.deleteStyleTip
                }, {
                    xtype: 'button',
                    itemId: 'editButton',
                    iconCls: 'gxc-icon-edit',
                    text: this.editStyleText,
                    tooltip: this.editStyleTip
                }, {
                    xtype: 'button',
                    itemId: 'duplicateButton',
                    iconCls: 'gxc-icon-duplicate',
                    text: this.duplicateStyleText,
                    tooltip: this.duplicateStyleTip
                }, {
                    xtype: 'button',
                    itemId: 'exportButton',
                    text: this.exportStyleText,
                    tooltip: this.exportStyleTip
                }]
            }]
        });

        this.callParent(arguments);
    }
});
