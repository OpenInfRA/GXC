/**
 * A form to style WMS layers.
 *
 * @class
 */
Ext.define('GXC.form.Style', {
    extend: 'Ext.form.Panel',
    requires: [
        'Ext.layout.container.Column',
        'Ext.layout.container.VBox',
        'Ext.form.FieldSet',
        'Ext.form.field.File',
        'Ext.grid.Panel',
        'Ext.form.field.ComboBox',
        'GXC.data.StyleStore',
        'GXC.form.CodeMirror',
        'GXC.form.StyleViewController'
    ],

    controller: 'GXC.form.StyleViewController',

    alias: 'widget.gxc_form_style',

    config: {
        /**
         * The layer this form is supposed to style.
         * @type {OpenLayers.Layer}
         */
        layer: null,

        /**
         * The actual style that this layer is associated with.
         * @type {String}
         */
        layerStyles: null,

        /**
         * The SLD_BODY param that is set.
         * @type {String}
         */
        layerSldBody: null
    },

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    defaults: {
        border: 0
    },

    txtAdvertisedStyles: 'Advertised styles',
    txtSldBody: 'Custom SLD',
    txtLoadSld: 'Select SLD file',
    txtLoadSldLabel: 'Load SLD',
    txtLoadSldValidationError: 'Only XML/SLD files allowed',
    txtSaveAsFileSldBody: 'Save as File',
    txtApplySldBody: 'Apply SLD',
    txtResetSldBody: 'Reset to default',
    txtStyle: 'Style',
    txtStyleAbstract: 'Abstract',
    txtLayerStyle: 'Apply',
    txtSLDStyle: 'Apply custom SLD',

    initComponent: function(config) {
        var items = [],
            editor,
            styleStore;

        this.initConfig(config);

        // may actually be null, which is ok
        this.layerStyles = this.layer.params.STYLES;

        // some layers may not define styles in capabilities
        if (this.layer.metadata.styles) {
            styleStore = Ext.create('GXC.data.StyleStore', {
                data: this.layer.metadata.styles
            });

            items.push({
                flex: 1,
                title: this.txtAdvertisedStyles,
                xtype: 'gridpanel',
                itemId: 'styleGrid',
                store: styleStore,
                columns: [{
                    text: 'Title',
                    flex: 1,
                    dataIndex: 'title'
                }, {
                    text: 'Abstract',
                    flex: 2,
                    dataIndex: 'abstract'
                }]
            });
        }

        items.push({
            flex: 3,
            title: this.txtSldBody,
            xtype: 'panel',
            layout: 'fit',
            items: [{
                xtype: 'gxc_form_codemirror',
                itemId: 'sldBodyTextArea'
            }],
            bbar: [{
                xtype: 'button',
                text: this.txtApplySldBody,
                itemId: 'applySldBodyButton'
            }, {
                xtype: 'button',
                text: this.txtResetSldBody,
                itemId: 'resetSldBodyButton'
            }, {
                xtype: 'button',
                text: this.txtSaveAsFileSldBody,
                itemId: 'saveAsFileSldBodyButton'
            }]
        });

        Ext.apply(this, {
            items: items
        });

        this.callParent(arguments);
    }
});
