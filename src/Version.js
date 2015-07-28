/**
 * @class
 */
Ext.define('GXC.Version', {
    major: 1,
    minor: 0,
    patch: 0,
    label: 'dev'
}, function() {
    /**
     * Default OpenLayers Vector style
     */
    OpenLayers.Renderer.defaultSymbolizer.pointRadius = 1;

    OpenLayers.Protocol.WFS.v1.prototype.read = function(options) {
        OpenLayers.Protocol.prototype.read.apply(this, arguments);
        options = OpenLayers.Util.extend({}, options);
        OpenLayers.Util.applyDefaults(options, this.options || {});
        var response = new OpenLayers.Protocol.Response({requestType: "read"});

        options.params = options.params ? options.params : {};
        Ext.apply(options.params, {
            request: 'GetFeature',
            service: 'WFS',
            version: this.version,
            srsName: this.srsName,
            typeName: this.featureType
        });

        response.priv = OpenLayers.Request.GET({
            url: options.url,
            callback: this.createCallback(this.handleRead, response, options),
            params: options.params,
            headers: options.headers
        });

        return response;
    };

    /**
     * Custom OpenLayers MousePosition control
     */
     OpenLayers.Control.GXCMousePosition = OpenLayers.Class(OpenLayers.Control.MousePosition, {

        reset: function() {
            var lonLat = this.map.getCenter();

            if (!lonLat) {
                // map has not yet been properly initialized
                return;
            }
            if (this.displayProjection) {
                lonLat.transform(this.map.getProjectionObject(),
                                 this.displayProjection );
            }

            var newHtml = this.formatOutput(lonLat);

            if (newHtml !== this.element.innerHTML) {
                this.element.innerHTML = newHtml;
            }
        }
    });

    OpenLayers.Control.GXCOverviewMap = OpenLayers.Class(OpenLayers.Control.OverviewMap, {
        draw: function() {
            OpenLayers.Control.OverviewMap.prototype.draw.apply(this, arguments);

            this.handlers.box = new OpenLayers.Handler.Box(this, {
                done: this.onZoomBoxDone
            }, {
                map: this.ovmap
            });

            this.handlers.click.deactivate();
            this.handlers.box.activate();
        },

        destroy: function() {
            if (this.handlers.box) {
                this.handlers.box.destroy();
            }

            OpenLayers.Control.OverviewMap.prototype.destroy.apply(this, arguments);
        },

        onZoomBoxDone: function(position) {
            if (position instanceof OpenLayers.Bounds) {
                this.updateMapToZoomBox(position);
            } else if (position instanceof OpenLayers.Pixel) {
                this.mapZoomBoxClick(position);
            }
        },

        /**
         * Method: mapDivClick
         * Handle browser events
         *
         * Parameters:
         * px - {<OpenLayers.Pixel>} px
         */
        mapZoomBoxClick: function(px) {
            var pxCenter = this.rectPxBounds.getCenterPixel();
            var deltaX = px.x - pxCenter.x;
            var deltaY = px.y - pxCenter.y;
            var top = this.rectPxBounds.top;
            var left = this.rectPxBounds.left;
            var height = Math.abs(this.rectPxBounds.getHeight());
            var width = this.rectPxBounds.getWidth();
            var newTop = Math.max(0, (top + deltaY));
            newTop = Math.min(newTop, this.ovmap.size.h - height);
            var newLeft = Math.max(0, (left + deltaX));
            newLeft = Math.min(newLeft, this.ovmap.size.w - width);
            this.setRectPxBounds(new OpenLayers.Bounds(newLeft,
                                                       newTop + height,
                                                       newLeft + width,
                                                       newTop));
            this.updateMapToRect();
        },

        updateMapToZoomBox: function(rectPxBounds) {
            var lonLatBounds = this.getMapBoundsFromRectBounds(rectPxBounds);
            if (this.ovmap.getProjection() !== this.map.getProjection()) {
                lonLatBounds = lonLatBounds.transform(
                    this.ovmap.getProjectionObject(),
                    this.map.getProjectionObject() );
            }
            this.map.zoomToExtent(lonLatBounds);
        }

    });


    /**
     *  Monkey Patching
     *        __
     *   w  c(..)o   (
     *    \__(-)    __)
     *        /\   (
     *       /(_)___)
     *       w /|
     *        | \
     *       m  m
     */

    /**
     * See: https://github.com/openlayers/openlayers/pull/1178
     *
     * APIMethod: setOpacity
     * Sets the opacity for the entire layer (all vectors), even if is within Vector.RootContainer
     *
     * Parameters:
     * opacity - {Float}
     */
    OpenLayers.Layer.Vector.prototype.setOpacity = function(opacity) {
        if (opacity !== this.opacity) {
            this.opacity = opacity;
            var element = this.renderer.root;
            OpenLayers.Util.modifyDOMElement(element, null, null, null, null, null, null, opacity);
            if (this.map !== null) {
                this.map.events.triggerEvent('changelayer', {
                    layer: this,
                    property: 'opacity'
                });
            }
        }
     };

    /**
     * See: https://github.com/openlayers/openlayers/issues/1332
     *
     * Method: drawTilesFromQueue
     * Draws tiles from the tileQueue, and unqueues the tiles
     */
    OpenLayers.TileManager.prototype.drawTilesFromQueue = function(map) {
        var tileQueue = this.tileQueue[map.id];
        var limit = this.tilesPerFrame;
        var animating = map.zoomTween && map.zoomTween.playing;
        var tile;
        while (!animating && tileQueue.length && limit) {
            tile = tileQueue.shift();
            if (tile.layer) {
                tile.draw(true);
            }
            --limit;
        }
    };
});
