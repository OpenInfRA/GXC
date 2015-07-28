/**
 * A component that allows to add WMS/WFS-Layers to the application.
 * It lists predefined services in a drop down list. Layers can be selected
 * and will be added to the map.
 */
Ext.define('GXC.panel.Add', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Ext.form.FieldSet',
        'Ext.form.field.Text',
        'Ext.form.field.ComboBox',
        'Ext.layout.container.Column',
        'Ext.layout.container.VBox',
        'GXC.data.OwsTypeStore',
        'GXC.panel.AddViewController'
    ],

    inject: [
        'serviceStore'
    ],

    controller: 'GXC.panel.AddViewController',

    alias: 'widget.gxc_panel_add',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    bodyPadding: '5px',

    txtPreviewMask: 'Select a layer..',
    txtCapabilitiesLoadErrorTitle: 'Error loading capabilities',
    txtCapabilitiesLoadErrorMessage: 'There has been an error loading service:<br>{0}',

    previewMaskCls: 'gxc-preview-mask',

    initComponent: function() {
        // owsTypeStore is an optional Provider
        if (Deft.Injector.canResolve('owsTypeStore')) {
            Deft.Injector.inject('owsTypeStore', this);
        } else {
            this.owsTypeStore = Ext.create('GXC.data.OwsTypeStore');
        }

        this.items = [{
            border: 0,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            defaults: {
                border: 0
            },
            items: [{
                xtype: 'fieldset',
                flex: 3,
                title: 'Choose Service',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                defaults: {
                    padding: '3px'
                },
                items: [{
                    // a simple combo box to filter WMS/WFS layers
                    xtype: 'combobox',
                    itemId: 'serviceTypeComboBox',
                    fieldLabel: 'OWS Type',
                    store: this.owsTypeStore,
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'abbr'
                }, {
                    // a combobox to select from the configured services
                    xtype: 'combobox',
                    itemId: 'serviceComboBox',
                    fieldLabel: 'OWS Service',
                    store: this.serviceStore,
                    queryMode: 'local',
                    displayField: 'title',
                    valueField: 'id'
                }]
            }, {
                // a preview window to present the layer before adding it to
                // the map if available
                xtype: 'fieldset',
                flex: 2,
                title: 'Preview',
                layout: 'fit',
                items: [{
                    xtype: 'gx_mappanel',
                    itemId: 'previewMap',
                    border: 0,
                    map: new OpenLayers.Map({
                        fallThrough: true,
                        projection: 'EPSG:4326',
                        extent: [180, 90, -180, -90],
                        controls: [],
                        layers: [
                            new OpenLayers.Layer('gxc_base', {
                                isBaseLayer: true
                            })
                        ]
                    })
                }]
            }]
        }, {
            // a form to add new services to the dropdown list
            xtype: 'fieldset',
            border: 0,
            title: 'Add Service',
            itemId: 'addServiceFieldset',
            collapsible: true,
            collapsed: true,
            items: [{
                xtype: 'form',
                itemId: 'serviceForm',
                border: 0,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                defaults: {
                    xtype: 'textfield'
                },
                items: [{
                    fieldLabel: 'Title',
                    name: 'title',
                    allowBlank: false
                }, {
                    xtype: 'combo',
                    store: this.owsTypeStore,
                    displayField: 'name',
                    valueField: 'abbr',
                    fieldLabel: 'Typ',
                    name: 'type',
                    allowBlank: false
                }, {
                    xtype: 'textfield',
                    fieldLabel: 'URL',
                    flex: 1,
                    name: 'url',
                    vtype: 'url',
                    allowBlank: false,
                    validateBlank: true,
                    stripCharsRe: /(^\s+|\s+$)/g
                }],
                bbar: [{
                    xtype: 'button',
                    formBind: true,
                    text: 'save',
                    itemId: 'saveService'
                }]
            }]
        }];

        this.callParent(arguments);
    }
});
