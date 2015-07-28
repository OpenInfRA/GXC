/**
 * @class
 */
Ext.define('GXC.service.Source', {

    inject: [
        'layerSourceStore'
    ],

    constructor: function(config) {
        if (config === null) {
            config = {};
        }
        this.initConfig(config);

        this.callParent(arguments);
    },

    loadSources: function() {
        var deferred = Ext.create('Deft.Deferred');

        this.layerSourceStore.load({
            callback: function(records, operation, success) {
                if (success) {
                    deffered.resolve(records);
                } else {
                    deffered.reject("Error loading initial layer sources");
                }
            }
        });

        return deffered.promise;
    }
});
