/**
 * ViewController to the GXC.panel.WmcImport class.
 */
Ext.define('GXC.form.WmcImportViewController', {
    extend: 'Deft.mvc.ViewController',

    inject: [
        'mapService',
        'layerService'
    ],

    control: {
        wmcField: {
            change: 'onWmcFieldChange'
        },
        loadButton: {
            click: 'onLoadButtonClick'
        },
        clearButton: {
            click: 'onClearButtonClick'
        }
    },

    onWmcFieldChange: function(field, value) {
        var saveBtn = this.getLoadButton();

        if (value !== '') {
            saveBtn.enable();
        } else {
            saveBtn.disable();
        }
    },

    onLoadButtonClick: function() {
        var view = this.getView(),
            format = view.format,
            wmcField = this.getWmcField(),
            map = this.mapService.getMap(),
            layerService = this.layerService,
            result, layers, lyr, newLayers = [],
            bounds;

        try {
            result = format.read(wmcField.getValue());
            bounds = result.bounds;
            layers = result.layersContext;

            Ext.Array.each(result.layersContext || [], function(lc) {
                var attribution = result.descriptionURL ?
                    '<a href="' + result.descriptionURL + '" target="_blank">' + lc.serviceTitle + '</a>' :
                    lc.serviceTitle;

                    if (!lc.service || lc.service.toUpperCase() === "OGC:WMS") {
                        lyr = new OpenLayers.Layer.WMS(lc.title, lc.url, {
                                layers: lc.name,
                                version: lc.version,
                                transparent: true
                            },{
                                visibility: lc.visibility,
                                attribution: attribution,
                                isBaseLayer: false
                            }
                        );
                        newLayers.push(lyr);
                    }
            }, this);

            Ext.Array.each(newLayers, function(l) {
                layerService.addLayer(l);
            }, this);

            // zoom to provided extent
            if (result.bounds && result.projection) {
                if (result.projection !== map.getProjection()) {
                    bounds = bounds.transform(result.projection, map.getProjection());
                }
                map.zoomToExtent(bounds);
            }
        } catch (e) {
            //
        }
    },

    onClearButtonClick: function() {
        var wmcField = this.getWmcField();

        wmcField.setValue('');
    }
});
