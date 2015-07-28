/**
 * A controller that manages OpenLayers measure controls and notifies the
 * user of measure events.
 */
Ext.define('GXC.button.MeasureViewController', {
    extend: 'Deft.mvc.ViewController',

    /**
     * Class is injected with
     * * notificationService
     *
     * @cfg {Array}
     */
    inject: [
        'notificationService'
    ],

    control: {
        view: {
            toggle: 'onToggle'
        }
    },

    /**
     * The window popup the measurement is shown in.
     * @type {Ext.window.Window}
     */
    popup: null,

    init: function() {
        var control = this.getView().control;

        control.events.on({
            'measure': this.onMeasure,
            'measurepartial': this.onMeasure,
            scope: this
        });

        this.popup = Ext.create('Ext.window.Window', {
            bodyPadding: 10,
            closable: false,
            title: this.getView().txtMeasureTitle
        });

        this.callParent(arguments);
    },

    onToggle: function(button, pressed) {
        if (!pressed) {
            this.popup.hide();
        }
    },

    /**
     * Called when a measurement completes to show results.
     */
    onMeasure: function(event) {
        if (event.measure > 0) {
            this.popup.update(this.makeString(event));
            this.popup.show();
        }
    },

    /**
     * Makes a string out of measurement results.
     * @param  {OpenLayers.Event} event
     * @return {String} The result string
     */
    makeString: function(event) {
        var view = this.getView(),
            metric = event.measure,
            metricUnit = event.units,
            output;

        if (event.order === 2) {
            output = Ext.util.Format.format(view.txtMeasurePolygon,
                event.object.getBestLength(event.geometry)[0].toFixed(2),
                metricUnit,
                metric.toFixed(2)
            );
        } else {
            output = Ext.util.Format.format(view.txtMeasurePath,
                metric.toFixed(2),
                metricUnit
            );
        }

        return output;
    },

    destroy: function() {
        var ctrls = this.getView().measureControls;

        for (var key in ctrls) {
            ctrls[key].events.un({
                'measure': this.onMeasure,
                'measurepartial': this.onMeasure,
                scope: this
            });
        }

        this.callParent(arguments);
    }
});
