/**
 * Simple {@link Ext.data.Model} that represents a OWS Service like WMS/WFS.
 * It is used to present a list of Services to the user to choose from to
 * ultimatly select a layer to add to a map.
 */
Ext.define('GXC.model.Service', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.SequentialIdGenerator'
    ],

    idgen: 'sequential',

    fields: [{
        name: 'type',
        type: 'string'
    }, {
        name: 'title',
        type: 'string'
    }, {
        name: 'version',
        type: 'string',
        // WMS version 1.1.1 and WFS version 1.0.0 are prefered due to
        // best support with the underlaying frameworks.
        convert: function(v, record) {
            var version = v;
            if (!version) {
                if (record.get('type') === 'WMS') {
                    version = '1.1.1';
                } else {
                    version = '1.0.0';
                }
            }
            return version;
        }
    }, {
        name: 'url',
        type: 'string',
        convert: function(v, record) {
            var urlObj, args, version;

            urlObj = OpenLayers.Util.createUrlObject(v);
            args = urlObj.args;
            v = urlObj.protocol + '//' + urlObj.host;

            if (urlObj.port !== '80') {
                v += ':' + urlObj.port;
            }

            v += urlObj.pathname;

            Ext.Object.each(args, function(key, value) {
                if (key.toLowerCase() === 'version') {
                    version = value;
                    delete args[key];
                    return false;
                }
            });

            v += '?' + OpenLayers.Util.getParameterString(args);

            // set version from url if defined
            if (version) {
                record.data.version = version;
            }

            return v;
        }
    }]
});
