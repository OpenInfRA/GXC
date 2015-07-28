Ext.define('GXC.form.ProjectionComboBox', {
    extend: 'Ext.form.field.ComboBox',

    inject: [
        'appConfig',
        'mapService'
    ],

    alias: 'widget.gxc_form_projectioncombobox',

    queryMode: 'local',
    forceSelection: true,
    editable: false,

    initComponent: function() {
        var projections = this.appConfig.get('projections'),
            map = this.mapService.getMap();

        Ext.apply(this, {
            store: Ext.Object.getKeys(projections),
            value: map.getProjection()
        });

        this.callParent(arguments);
    },

    /**
     * Updates the query string of window.location to load application with
     * the selected projection.
     *
     * @param  {String} newValue
     */
    onChange: function(newValue) {
        var url = this.updateQueryString('srs', newValue);
        window.location.href = url;
    },

    /**
     * Updates the query string of the url to pass state via url params.
     *
     * @param  {String} key
     * @param  {String} value
     * @param  {String} url
     * @return {String}
     *
     * @private
     */
    updateQueryString: function(key, value, url) {
        var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
            hash;

        if (!url) {
            url = window.location.href;
        }

        if (re.test(url)) {
            if (typeof value !== 'undefined' && value !== null) {
                return url.replace(re, '$1' + key + "=" + value + '$2$3');
            }
            else {
                hash = url.split('#');
                url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
                if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
                    url += '#' + hash[1];
                }
                return url;
            }
        }
        else {
            if (typeof value !== 'undefined' && value !== null) {
                var separator = url.indexOf('?') !== -1 ? '&' : '?';
                hash = url.split('#');
                url = hash[0] + separator + key + '=' + value;
                if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
                    url += '#' + hash[1];
                }
                return url;
            }
            else {
                return url;
            }
        }
    }
});
