var GXC_ENV = {
  proxy: {
    host: 'http://localhost:8081/proxy/whitelist.jsp?'
  },
  geoserver: {
    host: 'http://localhost:8081/geoserver'
  },
  printBaseUrl: 'http://localhost:8081/geoserver/pdf',
  targetId: 'gxc-container',
  viewportItems: [{
    region: 'center',
    xtype: 'gxc_panel_map',
    tbar: [{
        xtype: 'gxc_button_layer'
      }, '-', {
        xtype: 'gxc_button_zoomin'
      }, {
        xtype: 'gxc_button_zoomout'
      }, {
        xtype: 'gxc_button_zoombox'
      }, {
        xtype: 'gxc_button_zoomtomaxextent'
      }, '-', {
        xtype: 'gxc_button_naventry'
      }, {
        xtype: 'gxc_button_navprevious'
      }, {
        xtype: 'gxc_button_navnext'
      }, '-', {
        xtype: 'gxc_button_graticule'
      }, {
        xtype: 'gxc_button_geolocate'
      }, {
        xtype: 'gxc_button_fullscreen'
      }, {
        xtype: 'gxc_button_overviewmap'
      }, '-', {
        xtype: 'gxc_button_featureinfo'
      }, {
        xtype: 'gxc_button_selectfeature'
      }, '-', {
        xtype: 'gxc_button_measurepath'
      }, {
        xtype: 'gxc_button_measurepolygon'
      }, '-', {
        xtype: 'gxc_button_print'
      }, '-', {
        xtype: 'gxc_button_wmcexport'
      }, {
        xtype: 'gxc_button_wmcimport'
      }, '->', {
        xtype: 'gxc_form_geocodercombobox',
        width: 200
      },
    ''],
    bbar: ['', {
      xtype: 'gxc_form_zoomchooser',
      width: 150
    }, '->', {
      xtype: 'gxc_component_scaleline',
      width: 150
    }, '->', {
      xtype: 'gxc_form_projectioncombobox',
      width: 150
    }]
  }, {
    region: 'west',
    width: 150,
    xtype: 'gxc_panel_legend',
    title: 'Legend',
    bodyPadding: '5px',
    collapsible: true,
    collapsed: true,
    split: 3
  }, {
    region: 'east',
    title: 'Layer',
    xtype: 'gxc_panel_layer',
    autoScroll: true,
    collapsible: true,
    width: 250,
    split: 3
  }, {
    region: 'south',
    xtype: 'gxc_toolbar_notificationbar',
    itemId: 'notificationBar'
  }],
  projections: {
    'EPSG:42499': {
      def: '+proj=sterea +lat_0=34.2 +lon_0=39.15 +k=0.999534 +x_0=281768.0448 +y_0=28076.0311 +a=6378249.2 +b=6356515 +units=m +towgs84=591.8,897.7,841.3,-10.9,-14.9,-22.6,-201.1 +units=m  +no_defs',
      maxExtent: [-40075016.6784,-40075016.6784,40075016.6784,40075016.6784],
      units: 'm'
    },
    'EPSG:4326': true,
    'EPSG:3857': {
      def: '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
      maxExtent: [-40075016.6784,-40075016.6784,40075016.6784,40075016.6784],
      units: 'm'
    },
    'EPSG:22780': {
      def: '+proj=sterea +lat_0=34.2 +lon_0=39.15 +k=0.9995341 +x_0=0 +y_0=0 +a=6378249.2 +b=6356515 +towgs84=-190.421,8.532,238.69,0,0,0,0 +units=m +no_defs',
      maxExtent: [-40075016.6784,-40075016.6784,40075016.6784,40075016.6784],
      units: 'm'
    }
  },
  mapOptions: {
    // Projection der angefragten Karte
    projection: 'EPSG:4326',
    // Projection der angezeigten Koordinaten
    // Eingeschränkter Kartenbereich für Navigation
    // initiale Position
    center: [36.206, 34.003],
    // Skalen für Berechnung der Zoomlevel (Slider, Dropdown)
    // Freie Eingabe ist über Benutzeroberfläche ebenfalls möglich
    minScale: 10,
    maxScale: 150000000,
    // Anzahl der Zoomlevel im durch minScale/maxScale bzw. minResolution/maxResolution
    // vorgegebenen Bereich
    numZoomLevels: 20,
    // Initiales Zoomlevel
    zoom: 11
  },
  layers: [{
    url: 'http://localhost:8081/geoserver/wms?',
    type: 'WMS',
    version: '1.1.1',
    layer: 'baalbek:geom_9709f641-5954-4f1e-8bc2-8f14cda8fced'
  }, {
    url: 'http://localhost:8081/geoserver/wms?',
    type: 'WMS',
    version: '1.1.1',
    layer: 'baalbek:geom_931818c1-e60d-4500-ab44-b0f29afcc9fc'
  }, {
    url: 'http://localhost:8081/geoserver/wms?',
    type: 'WMS',
    version: '1.1.1',
    layer: 'baalbek:geom_50d4cb6f-46f1-4422-954c-4c3ec371f063'
  }, {
    url: 'http://localhost:8081/geoserver/wms?',
    type: 'WMS',
    version: '1.1.1',
    layer: 'baalbek:geom_5f4ff0f0-c325-4925-b565-0516e0cd1eda'
  }, {
    url: 'http://www.tu-cottbus.de/cisar/mapserver/topmaps?map=/home/html/cisar/umn/mapfiles27/ortho_all2.map?',
    type: 'WMS',
    version: '1.1.1',
    layer: '2003'
  }, {
    url: 'http://www.tu-cottbus.de/cisar/mapserver/topmaps?map=/home/html/cisar/umn/mapfiles27/ortho_all2.map?',
    type: 'WMS',
    version: '1.1.1',
    layer: '1996',
    visibility: false
  }],
  services: [{
    type: 'WMS',
    title: 'Projekt Baalbek',
    url: 'http://localhost:8081/geoserver/wms'
  }, {
      type: 'WMS',
      title: 'Projekt Baalbek 3D',
      url: 'http://141.56.141.17/geoserver/ddd/wms'
  }, {
    type: 'WMS',
    title: 'CISAR UMN MapServer',
    url: 'http://www.tu-cottbus.de/cisar/mapserver/topmaps?map=/home/html/cisar/umn/mapfiles27/ortho_all2.map'
  }, {
    type: 'WMS',
    title: 'localhost (dev)',
    url: 'http://localhost:8081/geoserver/wms'
  }, {
    type: 'WFS',
    title: 'localhost (dev) WFS',
    version: '1.3.0',
    url: 'http://localhost:8081/geoserver/ows'
  }, {
    type: 'WMS',
    title: 'OpenStreetMap',
    version: '1.1.1',
    url: 'http://ows.terrestris.de/osm/service'
  }, {
    type: 'WMS',
    title: 'OpenStreetMap (Grau)',
    version: '1.1.1',
    url: 'http://ows.terrestris.de/osm-gray/service'
  }]
};
