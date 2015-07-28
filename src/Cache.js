/**
 * A simple cache of data that may be used as a local cache of remote data
 * responses.
 */
Ext.define('GXC.Cache', {

    /**
     * Timeput period that the entry is considered as existent.
     * @type {Number}
     */
    timeout: 30000,

    /**
     * The actual cached data.
     *
     * @type {Boolean}
     * @private
     */
    data: null,

    /**
     * @inheritDoc
     */
    constructor: function() {
        this.data = {};

        this.callParent(arguments);
    },

    /**
     * Remove an entry by key.
     * @param  {String} key [description]
     */
    remove: function (key) {
        delete this.data[key];
    },

    /**
     * Checks if an entry exists for the given key.
     * @param  {String} key
     * @return {Boolean}
     */
    exist: function (key) {
        return !!this.data[key] &&
                ((new Date().getTime() - this.data[key]._) < this.timeout);
    },

    /**
     * Returns an entry by key.
     * @param  {String} key
     * @return {Any}
     */
    get: function (key) {
        return this.data[key].data;
    },

    /**
     * Sets value by key.
     * @param {String} key
     * @param {Any} data
     */
    set: function (key, data) {
        this.remove(key);
        this.data[key] = {
            _: new Date().getTime(),
            data: data
        };
    }
});
