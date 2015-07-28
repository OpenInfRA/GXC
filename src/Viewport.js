/**
 * @class GXC.Viewport
 *
 * The main application viewport, which displays the whole application rendered
 * to a provided target dom node. The viewport is *not* extended from the
 * Ext.Viewport but is actually a plan Ext.panel.Panel which allows to render
 * the application in a child div container of a website.
 *
 *
 */
Ext.define('GXC.Viewport', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Ext.layout.container.Border',
        'Ext.tab.Panel',
        'GXC.component.*',
        'GXC.button.*',
        'GXC.form.*',
        'GXC.toolbar.*',
        'GXC.panel.*'
    ],

    alias: 'widget.gxc_viewport',

    inject: [
        'appConfig'
    ],

    listeners: {
        beforerender: function() {
            var that = this,
                container = this.appConfig.getContainer();

            this.setHeight(container.getHeight());
            this.doLayout();

            Ext.EventManager.onWindowResize(function() {
                that.setHeight(container.getHeight());
                that.doLayout();
            });
        }
    },

    layout: 'border',

    defaults: {
        border: 0,
        hideCollapseTool: true
    },

    initComponent: function() {
        var container = this.appConfig.getContainer(),
            viewport = Ext.DomHelper.append(container, {
                tag: 'div', cls: 'gxc-viewport'
            });

        Ext.apply(this, {
            renderTo: viewport,
            items: this.appConfig.get('viewportItems')
        });

        this.callParent(arguments);
    }
});
