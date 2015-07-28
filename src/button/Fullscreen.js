/**
 * Button component that allows to launch app into fullscreen mode
 * by calling the browsers HTML5 Fullscreen API.
 */
Ext.define('GXC.button.Fullscreen', {
    extend: 'GXC.button.Button',

    alias: 'widget.gxc_button_fullscreen',

    /**
     * Component is injected with appConfig and runtime.
     * @type {Array}
     */
    inject: [
        'appConfig'
    ],

    /**
     * Defaults to true to enable toggling the fullscreen mode.
     *
     * @inheritdoc
     */
    enableToggle: true,

    /**
     * The GXC icon class.
     * @cfg {String}
     */
    iconCls: 'gis-icon-fullscreen',

    /**
     * The buttons tooltip on mouseover.
     * @cfg {String}
     */
    tooltip: 'Fullscreen mode',

    /**
     * @inheritdoc
     */
    initComponent: function() {
        // listening to this document for fullscreen events.
        Ext.getDoc().on({
            'webkitfullscreenchange': this.onFullScreenChange,
            'mozfullscreenchange': this.onFullScreenChange,
            'fullscreenchange': this.onFullScreenChange,
            'MSFullscreenChange': this.onFullScreenChange,
            scope: this
        });

        this.callParent(arguments);
    },

    /**
     * Launch app viewport into fullscreen using html 5 fullscreen api.
     * @inheritdoc
     */
    toggleHandler: function(btn, pressed) {
        var node;
        if (pressed) {
            node = this.appConfig.getContainer();
            this.launchIntoFullscreen(Ext.get(node).dom);
        } else {
            this.exitFullscreen();
        }
    },

    /**
     * Deactivate toggle button when fullscreen mode is quit via key.
     */
    onFullScreenChange: function() {
        if (
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        ) {
            this.toggle(true, true);
        } else {
            this.toggle(false, true);
        }
    },

    /**
     * Helper function to cope with browser differences implementing
     * the Fullscreen API.
     * @param  {HTMLElement} element The dom element of the viewport.
     */
    launchIntoFullscreen: function(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    },

    /**
     * Helper function to cope with browser differences implementing
     * the Fullscreen API.
     */
    exitFullscreen: function() {
        if (document.exitFullscreen) {
           document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    },

    /**
     * @inheritdoc
     */
    destroy: function() {
        // Used to un all bound events.
        Ext.getDoc().un({
            'webkitfullscreenchange': this.onFullScreenChange,
            'mozfullscreenchange': this.onFullScreenChange,
            'fullscreenchange': this.onFullScreenChange,
            'MSFullscreenChange': this.onFullScreenChange,
            scope: this
        });

        this.callParent(arguments);
    }
});
