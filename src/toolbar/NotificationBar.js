/**
 * @class
 */
Ext.define('GXC.toolbar.NotificationBar', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.gxc_toolbar_notificationbar',
    requires: [
        'Ext.toolbar.*'
    ],

    cls: 'gxc-notification-bar',

    tpl: null,

    initComponent : function() {
        this.tpl = Ext.Template('<b>{0}</b><br>{1}');

        this.items = [
            {
                itemId: 'msg',
                xtype: 'tbtext',
                text: ''
            },
            '->',
            {
                text: 'X',
                scope: this,
                handler: this.hideBar
            }
        ]

        this.callParent(arguments);
        this.msgItem = this.child('#msg');
    },

    showSuccess : function(title, msg) {
        this.getEl().setOpacity(0.25, false);
        this.addClass(this.cls + '-success');
        this.showBar(this.tpl.applyTemplate([title, msg]));
    },

    showError : function(title, msg) {
        this.getEl().setOpacity(0.25, false);
        this.addClass(this.cls + '-error');
        this.showBar(this.tpl.applyTemplate([title, msg]));
    },

    showBar : function(msg) {
        this.msgItem.update(msg);
        this.show();
        this.getEl().fadeIn({opacity: 1, duration: 1000});
        this.ownerCt.forceComponentLayout();
    },

    hideBar : function () {
        if (!this.isHidden()) {
            this.hide();
            this.ownerCt.forceComponentLayout();
            this.removeCls(this.cls + '-success');
            this.removeCls(this.cls + '-error');
            this.msgItem.update('');
        }
    },

    // Add custom processing to the onRender phase.
    afterRender: function() {
        this.callParent(arguments);
        this.hide();
    }
});
