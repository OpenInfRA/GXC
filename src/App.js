/**
 * # GXC.App
 *
 * This is the main class that most GXC driven application will inherit from in the
 * form of:
 *
 *      Ext.application({
 *          name: 'HTW',
 *          extend: 'GXC.App',
 *          autoCreateViewport: false
 *      });
 *
 * By providing preconfigured service providers at runtime, it is possible to build
 * applications declaratively via configuration. GXC components will consult
 * service providers to access the map object, stores and further functionality.
 *
 * @class
 */
Ext.define('GXC.App', {
    extend: 'Deft.mvc.Application',
    requires: [
        'Deft.mixin.Controllable',
        'Deft.mixin.Injectable',
        'Ext.app.Application',
        'Ext.tip.QuickTipManager',
        'Ext.state.LocalStorageProvider',
        'Ext.state.CookieProvider',
        'GXC.config.AppConfig',
        'GXC.context.AppContext',
        'GXC.service.*',
        'GXC.data.LayerStore',
        'GXC.data.LayerSourceStore',
        'GXC.data.LayerTreeStore',
        'GXC.data.ServiceStore',
        'GXC.Version',
        'GXC.Viewport'
    ],

    /**
     * Initialized the Application Object.
     * @return {undefined}
     */
    init: function() {
        this.beforeInit();
        Deft.Injector.configure(this.buildInjectorConfiguration());
        return this.afterInit();
    },

    /**
     * Wires the defined services providers that will be injected into
     * requesting objects at runtime.
     * @return {Object} A keyed object of services providers.
     */
    buildInjectorConfiguration: function() {
        return {
            appConfig: {
                className: 'GXC.config.AppConfig',
                parameters: [{
                    environment: window.GXC_ENV
                }]
            },
            appContext: 'GXC.context.AppContext',
            layerService: 'GXC.service.Layer',
            layerStore: 'GXC.data.LayerStore',
            layerSourceStore: 'GXC.data.LayerSourceStore',
            layerTreeStore: 'GXC.data.LayerTreeStore',
            serviceStore: 'GXC.data.ServiceStore',
            mapService: 'GXC.service.Map',
            notificationService: {
                className: 'GXC.service.Notification',
                parameters: {
                    successCmpId: 'notificationBar',
                    errorCmpId: 'notificationBar'
                }
            },
            owsCapabilitiesService: 'GXC.service.OwsCapabilities',
            sourceService: 'GXC.service.Source'
        };
    },

    /**
     * @protected
     * Runs at the start of the init() method. Override in subclasses if needed.
     */
    beforeInit: function() {
        // Init state provider
        if (Ext.supports.LocalStorage) {
            Ext.state.Manager.setProvider(
                Ext.create('Ext.state.LocalStorageProvider')
            );
        } else {
            Ext.state.Manager.setProvider(
                Ext.create('Ext.state.CookieProvider')
            );
        }
        // Do not send HTTP OPTIONS request if not necessary
        Ext.Ajax.useDefaultXhrHeader = false;
    },

    /**
     * @protected
     * Runs at the end of the init() method.
     */
    afterInit: function() {
        this.constrainFloaringComponents();

        Ext.tip.QuickTipManager.init();
        Ext.create('GXC.Viewport');
    },

    /**
     * Helper function that overrides ExtJS internals to constraint floating components
     * inside of the GXC container. This way, floating components like menus, tooltips
     * and floating panels are visible during fullscreen mode.
     */
    constrainFloaringComponents: function() {
        var config = Deft.Injector.resolve('appConfig'),
            container = config.getContainer();

        /**
         * Handles autoRender.
         * Floating Components may have an ownerCt. If they are asking to be constrained, constrain them within that
         * ownerCt, and have their z-index managed locally. Floating Components are always rendered to document.body
         */
        Ext.AbstractComponent.prototype.doAutoRender = function() {
            var me = this;
            if (!me.rendered) {
                if (me.floating) {
                    me.render(container.dom);
                } else {
                    me.render(Ext.isBoolean(me.autoRender) ? Ext.getBody() : me.autoRender);
                }
            }
        };

        Ext.tip.QuickTipManager.init = function (autoRender, config) {
            var me = this;

            if (!me.tip) {
                if (!Ext.isReady) {
                    Ext.onReady(function(){
                        Ext.tip.QuickTipManager.init(autoRender, config);
                    });
                    return;
                }

                var tipConfig = Ext.apply({ disabled: me.disabled, id: 'ext-quicktips-tip' }, config),
                    className = tipConfig.className,
                    xtype = tipConfig.xtype;

                if (className) {
                    delete tipConfig.className;
                } else if (xtype) {
                    className = 'widget.' + xtype;
                    delete tipConfig.xtype;
                }

                if (autoRender !== false) {
                    tipConfig.renderTo = container.dom;
                }

                me.tip = Ext.create(className || 'Ext.tip.QuickTip', tipConfig);

                // private.
                // Need a globally accessble way of testing whether QuickTipsManager is both loaded AND initialized.
                Ext.quickTipsActive = true;
            }
        };
    }
});
