/**
 * Simple button controller which initializes the delegated component by xtype
 * and caches a reference.
 *
 * @class
 */
Ext.define('GXC.button.ViewDelegatorViewController', {
    extend: 'Deft.mvc.ViewController',
    requires: [
        'Ext.window.Window'
    ],

    control: {
        /**
         * It's user configurable if the DelegateView button is responding to click of toggle events.
         * Therefore we listen for both here.
         */
        view: {
            boxready: 'onViewBoxready',
            click: 'onViewClick',
            toggle: 'onViewToggle'
        }
    },

    /**
     * The view this controller is adding to the viewport.
     * @type {Ext.Component}
     */
    delegate: null,

    /**
     * Checks if the delegate should be visible on render.
     * @return {[type]} [description]
     */
    onViewBoxready: function() {
        var view = this.getView();

        if (view.pressed) {
            this.showDelegate();
        }
    },

    /**
     * Called when the button is clicked.
     * @return {undefined}
     */
    onViewClick: function() {
        if (!this.getView().enableToggle) {
            this.showDelegate();
        }
    },

    /**
     * Called when the button is toggled.
     * @param  {Ext.button.Button} button  The button itself.
     * @param  {Boolean} pressed The state of the button.
     * @return {undfined}
     */
    onViewToggle: function(button, pressed) {
        if (pressed) {
            this.showDelegate();
        } else {
            this.delegate.close();
        }
    },

    /**
     * Initializes a view as defined by the xtypeDelegate config.
     * View will be added to the component found by targetQuery or inserted as a child component of a floating window.
     * @return {undefined}
     */
    showDelegate: function() {
        var view = this.getView(),
            cmp;

        if (this.delegate) {
            return this.delegate.show();
        }

        this.delegate = Ext.create(view.dType, view.dConfig);

        this.delegate.on({
            'close': this.onDelegateClose,
            'beforedestroy': this.onDelegateBeforeDestroy,
            scope: this
        });

        // positions the delegte if configured
        if (view.dShowAt) {
            this.delegate.showAt.apply(this.delegate, view.dShowAt);
        }

        if (view.dShowBy && view.dShowBy.length) {
            if (Ext.isString(view.dShowBy[0])) {
                view.dShowBy[0] = Ext.ComponentQuery.query(view.dShowBy[0])[0];
            }
            this.delegate.showBy.apply(this.delegate, view.dShowBy);
        }

        if (!this.delegate.isVisible()) {
            this.delegate.show();
        }
    },

    /**
     * Synchronizes button state and delegates show state.
     */
    onDelegateClose: function() {
        var view = this.getView();

        if (view.enableToggle) {
            view.toggle(false, false);
        }
    },

    /**
     * Unbind event handlers.
     */
    onDelegateBeforeDestroy: function() {
        this.delegate.un({
            'close': this.onDelegateClose,
            'beforedestroy': this.onDelegateBeforeDestroy,
            scope: this
        });

        this.delegate = null;
    }
});
