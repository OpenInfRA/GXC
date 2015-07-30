/**
 * ViewController of the Add component.
 */
Ext.define('GXC.panel.AddViewController', {
    extend: 'Deft.mvc.ViewController',
    requires: [
        'GXC.panel.WfsCapabilities',
        'GXC.panel.WmsCapabilities'
    ],

    inject: [
        'appContext',
        'notificationService',
        'serviceStore'
    ],

    control: {
        'view': {
            'boxready': 'onViewBoxready'
        },
        'serviceTypeComboBox': {
            'change': 'onServiceTypeComboBoxSelect'
        },
        'serviceComboBox': {
            'change': 'onServiceComboBoxSelect'
        },
        'previewMap': true,
        'capabilitiesGrid': {
            live: true,
            listeners: {
                'capabilitiesloaderror': 'onCapabilitiesLoadError',
                'itemclick': 'onCapabilitiesGridItemClick'
            }
        },
        'addServiceFieldset': true,
        'serviceForm': true,
        'saveService': {
            'click': 'onSaveServiceClick'
        }
    },

    /**
     * Called when the box model of the component is ready.
     * Masks the layer selection list.
     * @param  {GXC.panel.Add} panel
     */
    onViewBoxready: function(panel) {
        this.maskPreview();
    },

    /**
     * Called when the filter box is changed to filter WMS/WFS layers.
     * @param  {Ext.form.ComboBox} combo
     * @param  {String} newValue
     * @param  {String} oldValue
     */
    onServiceTypeComboBoxSelect: function(combo, newValue, oldValue) {
        var store = this.getServiceComboBox().getStore();

        store.clearFilter(true);
        store.filter('type', newValue);
    },

    /**
     * Called when a WMS/WFS service is selected from the dropdown box.
     * @param  {Ext.form.ComboBox} combo
     * @param  {[type]} newValue
     * @param  {[type]} oldValue
     */
    onServiceComboBoxSelect: function(combo, newValue, oldValue) {
        var store = combo.getStore(),
            service = store.getById(newValue),
            type = service.get('type');

        this.emptyPreview();
        this.maskPreview();

        var grid = this.getCapabilitiesGrid(),
            options = {
                service: service,
                itemId: 'capabilitiesGrid',
                autoScroll: true,
                flex: 1
            };

        if (grid) {
            grid.hide().destroy();
        }

        // We decide on the type of selected service which capabilities
        // view to render.
        switch (type) {
            case 'WMS':
                Ext.apply(options, {
                    xtype: 'gxc_panel_wmscapabilities'
                });
                break;
            case 'WFS':
                Ext.apply(options, {
                    xtype: 'gxc_panel_wfscapabilities'
                });
                break;
            default:
                throw ({
                    name: 'OgcTypeError',
                    desc: 'Service type not supported: ' + type
                });
        }

        this.getView().add(options);
    },

    /**
     * Called on load error.
     * @param  {Ext.data.Store} store
     */
    onCapabilitiesLoadError: function(title, message) {
      var view = this.getView();

      this.emptyPreview();
      this.maskPreview();
      this.notificationService.error(title, message);
    },

    /**
     * Called when a layer is selected with single click to preview the layer.
     * @param  {Ext.grid.Panel} grid
     * @param  {[type]} record [description]
     */
    onCapabilitiesGridItemClick: function(grid, record) {
        var map = this.getPreviewMap().map,
            layer = record.getLayer();

        this.emptyPreview();

        if (layer) {
            map.addLayer(layer.clone());
            map.zoomToExtent(record.get('llbbox'));
            this.unmaskPreview();
        }
    },

    /**
     * Called when a service is added via the form. Adds the layer to the
     * services dropdown list.
     */
    onSaveServiceClick: function() {
        var view = this.getServiceForm(),
            form = view.getForm(),
            values = form.getValues(),
            model;

        model = this.serviceStore.add(values);
        if (model) {
            form.reset();
            this.getAddServiceFieldset().collapse();
            this.getServiceComboBox().select(model);
        }
    },

    /**
     * Empties the preview panel.
     * @return {[type]} [description]
     */
    emptyPreview: function() {
        var map = this.getPreviewMap().map,
            layers = map.layers;

        if (layers.length > 1) {
            map.removeLayer(layers[1]);
        }
    },

    /**
     * Masks the preview panel.
     */
    maskPreview: function() {
        var view = this.getView(),
            el = this.getPreviewMap().getEl();

        el.mask(view.txtPreviewMask, view.previewMaskCls);
    },

    /**
     * Unmasks the preview panel.
     */
    unmaskPreview: function() {
        this.getPreviewMap().getEl().unmask();
    }
});
