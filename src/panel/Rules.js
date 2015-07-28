/**
 * @class
 */
Ext.define('GXC.panel.Rules', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Ext.form.FieldSet',
        'GXC.panel.RulesViewController'
    ],

    controller: 'GXC.panel.RulesViewController',

    alias: 'widget.gxc_panel_rules',

    layerRecord: null,

    layerStyle: null,

    /** api: config[addStyleText] (i18n) */
    addRuleText: "Add",
    /** api: config[addStyleTip] (i18n) */
    addRuleTip: "Add a new rule",
    /** api: config[newRuleText] (i18n) */
    newRuleText: "New Rule",
    /** api: config[addStyleText] (i18n) */
    deleteRuleText: "Remove",
    /** api: config[addStyleTip] (i18n) */
    deleteRuleTip: "Delete the selected rule",
    /** api: config[addStyleText] (i18n) */
    editRuleText: "Edit",
    /** api: config[addStyleTip] (i18n) */
    editRuleTip: "Edit the selected rule",
    /** api: config[addStyleText] (i18n) */
    duplicateRuleText: "Duplicate",
    /** api: config[addStyleTip] (i18n) */
    duplicateRuleTip: "Duplicate the selected rule",
    /** api: config[rulesFieldsetTitle] (i18n) */
     rulesFieldsetTitle: "Rules",
    /** api: config[ruleWindowTitle] (i18n) */
    ruleWindowTitle: "Style Rule: {0}",
    /** api: config[cancelText] (i18n) */
    cancelText: "Cancel",
    /** api: config[saveText] (i18n) */
    saveText: "Save",

    dialogCls: 'Ext.window.Window',

    bodyPadding: '10px',

    initComponent: function() {
        Ext.apply(this, {
            items: [{
                xtype: 'fieldset',
                itemId: 'rulesFieldset',
                title: this.rulesFieldsetTitle,
                autoScroll: true
            }, {
                xtype: 'toolbar',
                items: [{
                    xtype: 'button',
                    itemId: 'addButton',
                    iconCls: 'gxc-icon-add',
                    text: this.addRuleText,
                    tooltip: this.addRuleTip
                }, {
                    xtype: 'button',
                    itemId: 'deleteButton',
                    iconCls: 'gxc-icon-remove',
                    text: this.deleteRuleText,
                    tooltip: this.deleteRuleTip,
                    disabled: true
                }, {
                    xtype: 'button',
                    itemId: 'editButton',
                    iconCls: 'gxc-icon-edit',
                    text: this.editRuleText,
                    toolitp: this.editRuleTip,
                    disabled: true
                }, {
                    xtype: 'button',
                    itemId: 'upButton',
                    iconCls: 'gxc-icon-up',
                    text: this.upRuleText,
                    toolitp: this.upRuleTip,
                    disabled: true
                }, {
                    xtype: 'button',
                    itemId: 'downButton',
                    iconCls: 'gxc-icon-down',
                    text: this.downRuleText,
                    toolitp: this.downRuleTip,
                    disabled: true
                }, {
                    xtype: 'button',
                    itemId: 'duplicateButton',
                    iconCls: 'gxc-icon-duplicate',
                    text: this.duplicateRuleText,
                    tip: this.duplicateRuleTip,
                    disabled: true
                }]
            }]
        });

        this.callParent(arguments);
    }
});
