/**
 * A central notification service to brodcast errors and messages via dialogs.
 */
Ext.define('GXC.service.Notification', {

    inject: [
        'appContext'
    ],

    config: {
        /**
         * The components item id that will be consulted to show success notifications.
         * @type {String}
         */
        successCmpId: null,

        /**
         * The components item id that will be consulted to show error notifications.
         * @type {String}
         */
        errorCmpId: null
    },

    constructor: function(config) {
        if (config == null) {
            config = {};
        }
        this.initConfig(config);

        this.appContext.on({
            'filelayerloaded': function(layer) {
                this.success('Layer loaded', 'File layer ' + layer.name + ' has been successfully loaded.');
            },
            scope: this
        });

        return this.callParent(arguments);
    },

    /**
     * Delegates the configured notification component to show a success message.
     * @param  {String} title
     * @param  {String} message
     */
    success: function(title, message) {
        var cmp = this.getNotifier(this.successCmpId);
        cmp.showSuccess(title, message);
    },

    /**
     * Delegates the configured notifications component to show an error.
     * @param  {String} title   Title of the notification.
     * @param  {String} message
     */
    error: function(title, message) {
        Ext.Msg.alert(title, message);
        // var cmp = this.getNotifier(this.errorCmpId);
        // cmp.showError(title, message);
    },

    getNotifier: function(itemId) {
        return Ext.ComponentQuery.query('[itemId=' + itemId + ']')[0];
    }
});
