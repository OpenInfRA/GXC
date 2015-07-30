/**
 * A ViewController to the GXC.panel.OwsCapabilities class.
 */
Ext.define('GXC.panel.OwsCapabilitiesViewController', {
    extend: 'Deft.mvc.ViewController',

    inject: [
        'appContext'
    ],

    control: {
        'view': {
            'boxready': 'onViewBoxready',
            'itemdblclick': 'onItemDblClick'
        },
        'addButton': {
            'click': 'onAddButtonClick'
        }
    },

    onViewBoxready: function(view) {
      var service = view.service,
          store = view.store;

      store.load({
          params: {
              version: service.get('version')
          },
          callback: this.onStoreLoad,
          scope: this
      });
    },

    /**
     * Double clicking an entry effectivly adds the layer to the map.
     */
    onItemDblClick: function(panel, record, item, index) {
        this.addLayer(record);
    },

    /**
     * Adds a selected layer to the map.
     * @param  {Ext.button.Button} button
     */
    onAddButtonClick: function(button) {
        var grid = this.getView(),
            selection = grid.getSelectionModel().getSelection(),
            length = selection.length;

        for (var i = 0; i < length; i++) {
            this.addLayer(selection[i]);
        }
    },

    /**
     * Hands the layer to the applications context to effectivly adding the layer
     * to the apps map view.
     * @param  {Ext.data.Model} record The Layer record
     */
    addLayer: function(record) {
        var layer = record.getLayer().clone();
        if (layer) {
            this.appContext.addLayer(layer);
        }
    },

    onStoreLoad: function(records, operation, success) {
      var view = this.getView(),
          err, req, title, message;

      if (!success) {
        err = operation.error;
        req = operation.request;
        title = err.statusText;
        message = "Error connecting to: " + req.proxy.url;
        view.fireEvent('capabilitiesloaderror', title, message);
      }
    }
});
