Ext.define('GXC.panel.WmsCapabilitiesViewController', {
    extend: 'GXC.panel.OwsCapabilitiesViewController',

    /**
     * Double clicking an entry effectivly adds the layer to the map.
     */
    onItemDblClick: function(panel, record, item, index) {
        this.addLayer(record);
    },

    onAddButtonClick: function(button, event) {
        var grid = this.getView(),
            selection = grid.getSelectionModel().getSelection(),
            length = selection.length;

        for (var i = 0; i < length; i++) {
            this.addLayer(selection[i]);
        }
    },

    addLayer: function(record) {
        var layer = record.getLayer(),
            i;
        if (layer) {
            this.appContext.addLayer(layer.clone());
        } else {
            // add unnamed layer containers as single layers
            i = record.childNodes.length;
            for (i = i - 1; i >= 0; i--) {
                this.addLayer(record.childNodes[i]);
            }
        }
    },

    onStoreLoad: function(records, operation, success) {
      var view = this.getView(),
          store = view.store;

      if (success)
        if (records.length) {
          var root = store.setRootNode(records[0]);
          root.expand(true);
      }

      this.callParent(arguments);
    }
});
