var GXC_ENV = {
  proxy: {
    host: 'http://localhost:8081/proxy/whitelist.jsp?'
  },
  geoserver: {
    host: 'http://localhost:8081/geoserver'
  },
  targetId: 'gxc-container',
  viewportItems: [{
    region: 'center',
    xtype: 'gxc_panel_map',
    tbar: [{
        xtype: 'gxc_button_zoomin'
      }, {
        xtype: 'gxc_button_zoomout'
      }, {
        xtype: 'gxc_button_zoomtomaxextent'
      }, '-', {
        xtype: 'gxc_button_featureinfo'
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
  }],
  projections: {
    'EPSG:4326': true,
    'EPSG:900913': true
  },
  mapOptions: {
    projection: 'EPSG:4326',
    center: [13.75, 51.05],
    minScale: 10,
    maxScale: 150000000,
    zoom: 6
  },
  layers: [{
    url: 'http://ows.terrestris.de/osm/service?',
    type: 'WMS',
    version: '1.1.1',
    layer: 'OSM-WMS'
  }],
  services: [{
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
