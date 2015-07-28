/**
 * A geocoder combobox derieved from GeoExt.form.field.GeocoderComboBox.
 */
Ext.define('GXC.form.GeocoderComboBox', {
    extend: 'GeoExt.form.field.GeocoderComboBox',

    inject: [
        'mapService'
    ],

    alias: 'widget.gxc_form_geocodercombobox',

    initComponent: function() {
        this.map = this.mapService.getMap();

        this.callParent(arguments);
    }
});
