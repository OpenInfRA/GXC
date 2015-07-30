# Welcome to GXC

GXC aims to allow easy and declarativ definition of mapping applications.
It builds on the following Open Source components

*   ExtJS 4.2.1

    ExtJS is a JavaScrip framework for building web applications. It provides
    extensible widgets and components and a packaging and build mechanism that
    is used by GXC.

*   GeoExt 2.0.3

    GeoExt is a rich toolkit for web mapping applications adding ExtJS
    components for OpenLayers data structures. It is the junction between ExtJS
    and OpenLayers.

*   DeftJS

    DeftJS adds an IoC Container to ExtJS that is the basis for the GXC.App
    class. It is a central point to register service providers and stores that
    other components can be injected with at runtime. This allows for less
    configuration by the end user. The library also adds ViewControllers to
    ExtJS pre-5 which are created and destroyed with their associated views.
    This allows for multiple independent instances of a given view, each with
    their own ViewController instance.

*   OpenLayers 2.13.1

    OpenLayers is a proven JavaScript mapping framework. It provides the means
    to interact with OWS layers and services as well as parsing capabilities
    for most formats associated with OWS services.

*   Q

    Q is a small library adding support for JavaScript promises. It is used to
    compose multiple asynchronous operations into easy to read function chains.

The prepared test suite is based on

* Mocha.js
* Chai.js
* chai-as-promised
* sinon-chai
* sinon

# Configuration

A GXC application is nothing but an ExtJS application derieved from the GXC
package. The easiest starting point is to base a new application on the provided
example and edit the config.js file which defines components, layers and
services that are available at startup.

The configuration should be available at runtime via the global variable
"GXC_ENV" in simple JSON format. It is devided in the following categories:

*   `proxy.host`
    An optional proxy host to use with Ajax requests to OWS services.

*   `targetId`
    The DOM node id that the application will be inserted to.

*   `viewportItems`
    An array of components that the application should load up with.

*   `projections`
    An optional projections definition object for custom map projections.

*   `mapOptions`
    Custom mapOptions that will be forwared to the OpenLayers map.

*   `layers`
    An array of WMS/WFS layers that will be loaded on startup.

*   `services`
    An array of WMS/WFS services that will be available for adding layers.

## `targetId`
This is the target DOM node that the application will be inserted to. By
sticking to a given DOM node instead of launching the ExtJS application as a
Ext.viewport.Viewport it is possible to place GXC inside an existing website.
It should be given as plain text without a query prefix.

## `viewportItems`
This is the definition of panels and tools that will be rendered at runtime.
It follows the same rules as defining the viewport of a simple ExtJS application
with the distinction that the definition should typically stick to JSON notation
to be serializable for simple Ajax calls.

Items are defined by their [`xtype`][xtype] - an alias for its classname - and
will be initialized at runtime. Every item has its own settings, most of which
can be customized as needed are documented in the ExtJS API.
To find out the components `xtype` look at the API documantation of said item.
GXC provides the following components (available settings see GXC API):

### Buttons
* GXC.button.FeatureInfo
* GXC.button.Fullscreen
* GXC.button.Geolocate
* GXC.button.Graticule
* GXC.button.MeasurePath
* GXC.button.MeasurePolygon
* GXC.button.NavEntry
* GXC.button.NavNext
* GXC.button.NavPrevious
* GXC.button.OverviewMap
* GXC.button.ZoomIn
* GXC.button.ZoomOut
* GXC.button.ZoomToMaxExtent

A special case it the {@link GXC.button.ViewDelegator} button that can be used
to delegate other components, e.g. the {@link GXC.panel.Add} panel to open a
floating window to add new layers to the map.

### Panels and Components
* GXC.component.ScaleLine
* GXC.panel.Add
* GXC.panel.Edit
* GXC.panel.Layer
* GXC.panel.LayerFileDrop
* GXC.panel.Legend
* GXC.panel.Map
* GXC.panel.Print
* GXC.panel.Service
* GXC.panel.WfsCapabilities
* GXC.panel.WmsCapabilities
* GXC.form.CodeMirror
* GXC.form.Style
* GXC.form.ZoomChooser

Typically these will be wrapped in standard ExtJS components to form the layout
of the application. At the uppermost level, these are always
Ext.layout.container.Border regions as described in the docs. (The GXC
viewport is actually a Ext.panel.Panel with layout `border` predfined.)

A very simple app that only holds the map in the center region, a toolbar with
some zoom buttons and a layer tree in the west region (left side) of the map may
look like this:

    "viewportItems": [{
        "region": "center",
        "xtype": "gxc_panel_map",
        // the buttons are wrapped in a toolbar above the map
        "dockedItems": [{
            "xtype": "toolbar",
            "dock": "top",
            "items": [{
                // xtypes of the gxc zooming buttons
                "xtype": "gxc_button_zoomin"
            }, {
                "xtype": "gxc_button_zoomout"
            }, {
                "xtype": "gxc_button_zoomtomaxextent"
            }]
        }]
    }, {
        "region": "west",
        "title": "Layer",
        // the layer tree has an initial width of 250px
        "width": 250,
        "split": 3,
        "layout": {
            "type": "vbox",
            "pack": "start",
            "align": "stretch"
        },
        "items": [{
            "xtype": "gxc_panel_layer"
        }]
    }],
    ...

## `projections`

Allows to define custom projections that should be available for map
initialization. OpenLayers come preconfigured with projections for EPSG:4326 and
EPSG:3857. All other projections need to be added here.

It's easiest to investigate at [EPSG.IO](http://epsg.io) to find out the
required information. A typical configuration looks like:

    ...
    "projections": {
        "EPSG:31469": {
            // definition
            "def": "+proj=tmerc +lat_0=0 +lon_0=15 +k=1 +x_0=5500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs",
            // ficitional bounds so it is possible to pan outside of the projections
            // maxExtent
            "maxExtent": [-40075016.6784,-40075016.6784,40075016.6784,40075016.6784],
            // turn axis order for WMS 1.3 protocol
            "yx": true
        }
    },
    ...

## `mapOptions`
This object will be merged with the default OpenLayers map options that are
used by GXC.

    ...
    "mapOptions": {
        // projection of the map
        "projection": "EPSG:31469",
        // projection of the displayed coordinates
        "displayProjection": "EPSG:31469",
        // to restrict the map area the user is allowed to pan in
        // "restrictedExtent": [5270000, 5560000, 5550000, 5740000],
        // initial center coordinates
        "center": [5395240, 5646000],
        // minimal scale (1:1)
        "minScale": 1,
        // maximal scale (1:1500000)
        "maxScale": 1500000,
        // number of zoom levels that the scale interval will be divided in
        "numZoomLevels": 20,
        // initial zoom level
        "zoom": 2
    },
    ...

## `layers`
An array of layers that will be loaded on startup. Further metainformation will
be extracted from GetCapabilities requests to the service itself.

    ...
    "layers": [{
        "url": "https://geodienste.sachsen.de/wms_geosn_dop-rgb/guest",
        "type": "WMS",
        "version": "1.3.0",
        "layer": "sn_dop_020",
        visibility: true,
        opacity: 1.0
    }],
    ...

## `services`
An array of services that will be available to the user to choose new layers
from.

    ...
    "services": [{
        "type": "WMS",
        "title": "Landesvermessung Sachsen",
        "version": "1.1.1",
        "url": "http://www.landesvermessung.sachsen.de/ias/basiskarte4/service/SRV4TOPSN/WMSFREE_TK/wmsservice"
    }],
    ...

# TODO
* Extend test suite
* Run test suite via Travis CI
* Improve documentation
* Add more examples

[xtype]: http://docs.sencha.com/extjs/4.2.1/#!/api/Ext.AbstractComponent-cfg-xtype
