/**
 * @class
 */
Ext.define('GXC.form.ZoomChooser', {
    extend: 'Ext.form.field.ComboBox',
    requires: [
        'GeoExt.data.ScaleStore'
    ],

    alias: 'widget.gxc_form_zoomchooser',

    inject: [
        'mapService'
    ],

    emptyText: 'Scale..',

    listConfig: {
        getInnerTpl: function() {
            return '1 : {scale:round(0)}';
        }
    },

    displayField: 'scale',
    typeAhead: true,
    queryMode: 'local',
    triggerAction: 'all',
    selectOnFocus: true,

    listeners: {
        'change': 'onChange',
        'select': 'onSelect',
        'specialkey': 'onSpecialKey'
    },

    initComponent: function() {
        var map = this.mapService.getMap(),
            store = Ext.create('GeoExt.data.ScaleStore', {
                map: map
            });

        Ext.apply(this, {
            map: map,
            store: store
        });

        map.events.on({
            'zoomend': this.onZoomend,
            scope: this
        });

        this.callParent(arguments);
    },

    onSelect: function(combo, record, index) {
        this.map.zoomTo(record[0].get('level'));
    },

    onSpecialKey: function(combo, e) {
        var v = this.getValue();

        v = parseInt(v.substring(v.length, v.indexOf(':') + 1));

        if (!isNaN(v) && e.getKey() == e.ENTER) {
            this.map.zoomToScale(v);
        } else if (e.getKey() == e.ESC) {
            this.onZoomend();
        }
    },

    onZoomend: function() {
        var value;
        if (this.rendered) {
            value = Math.round(parseInt(this.map.getScale())/10)*10;
            this.setValue('1 : ' + value, false);
        }
    },

    destroy: function() {
        this.map.un({
            'zoomend': this.onZoomend,
            scope: this
        });

        delete this.map;

        this.callParent(arguments);
    }
});
