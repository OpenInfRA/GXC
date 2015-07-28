/**
 * Simple store to hold service information of available OWS services to choose
 * from by the user.
 */
Ext.define('GXC.data.ServiceStore', {
    extend: 'Ext.data.Store',

    inject: [
        'appConfig'
    ],

    stateful: true,

    stateId: 'gxcServiceStore',

    model: 'GXC.model.Service',

    proxy: {
        type: 'memory',
        reader: 'json'
    },

    constructor: function() {
        var configServices, inlineData;

        this.callParent(arguments);

        configServices = this.appConfig.get('services', []);
        inlineData = configServices;

        this.loadRawData(inlineData, false);
    },

    onStateChange: function() {
        var data = [];

        this.each(function(record) {
            data.push(record.getData());
        }, this);

        Ext.state.Manager.set(this.stateId, data);
    }
});
