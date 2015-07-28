/**
 * An abstract base class for buttons that handle OpenLayers measurement controls.
 */
Ext.define('GXC.button.Measure', {
    extend: 'GXC.button.OlButton',
    requires: [
        'GXC.button.MeasureViewController'
    ],

    alias: 'widget.gxc_button_measure',

    controller: 'GXC.button.MeasureViewController',

    inject: [
        'mapService'
    ],

    enableToggle: true,

    /**
     * Default toggle group for gxc interactions.
     * @cfg {String}
     */
    toggleGroup: 'gxc_interaction',

    /**
     * The OpenLayers.Handler type this control will use.
     * @type {String}
     */
    handlerType: null,

    /**
     * Title of measurement notifications.
     * @cfg {String}
     */
    txtMeasureTitle: 'Measurement',

    /**
     * Notification body of path measurements.
     * {0} - length
     * {1} - Metric unit
     *
     * @cfg {String}
     */
    txtMeasurePath: '{0} {1}',

    /**
     * Notification body of polygon measurements.
     * {0} - Perimeter
     * {1} - Metric unit
     * {2} - Area
     *
     * @cfg {String}
     */
    txtMeasurePolygon: 'Perimeter: {0} {1}<br>Area: {2} {1}<sup>2</sup>',

    initComponent: function(config) {
        config = config || {};

        if (!this.control && this.handlerType) {
            this.initControl();
        }

        this.map = this.mapService.getMap();

        this.callParent(arguments);
    },

    initControl: function() {
        var styleMap = new OpenLayers.StyleMap({
            'default': new OpenLayers.Style(null, {
                rules: [new OpenLayers.Rule({
                    symbolizer: {
                        'Point': {
                            pointRadius: 4,
                            graphicName: 'square',
                            fillColor: 'white',
                            fillOpacity: 1,
                            strokeWidth: 1,
                            strokeOpacity: 1,
                            strokeColor: '#333333'
                        },
                        'Line': {
                            strokeWidth: 3,
                            strokeOpacity: 1,
                            strokeColor: '#666666',
                            strokeDashstyle: 'dash'
                        },
                        'Polygon': {
                            strokeWidth: 2,
                            strokeOpacity: 1,
                            strokeColor: '#666666',
                            fillColor: 'white',
                            fillOpacity: 0.3
                        }
                    }
                })]
            })
        });

        this.control = new OpenLayers.Control.Measure(
            OpenLayers.Handler[this.handlerType], {
            geodesic: true,
            persist: true,
            handlerOptions: {
                layerOptions: {
                    styleMap: styleMap
                }
            }
        });
    }
});
