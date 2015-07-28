/**
 * A View Controller to the GXC.panel.Map.
 */
Ext.define('GXC.panel.MapViewController', {
    extend: 'Deft.mvc.ViewController',

    inject: [
        'appConfig',
        'appContext',
        'layerService',
        'notificationService'
    ],

    observe: {
        appContext: {
            'zoomtoextent': 'onZoomToExtent'
        }
    },

    control: {
        'view': {
            boxready: 'onViewBoxready'
        }
    },

    /**
     * Called when the panels box model is ready loading initial data.
     */
    onViewBoxready: function(view, width, height) {
        this.appContext.mapIsReady(view, width, height);
        this.loadInitialData();
    },

    /**
     * Loads the initial data sources forwarding to the injected mapService.
     * While loading, the map is masked with a generic loading mask.
     */
    loadInitialData: function() {
        var me = this,
            view = this.getView(),
            service = this.layerService;

        view.setLoading(true);

        service.loadInitialData()
            .then(function() {
                me.appContext.initialDataLoaded();
            }).fail(function(error) {
                me.notificationService.error('Error', error);
            }).fin(function() {
                view.setLoading(false);
            }).done();
    },

    /**
     * Called to zoom to the provided extent.
     */
    onZoomToExtent: function(extent) {
        var map = this.getView().map;
        map.zoomToExtent(extent);
    }
});
