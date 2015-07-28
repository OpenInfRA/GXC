/**
 * @class
 */
Ext.define('GXC.panel.WfsCapabilities', {
    extend: 'GXC.panel.OwsCapabilities',
    alias: 'widget.gxc_panel_wfscapabilities',

    requires: [
        'GXC.data.WfsCapabilitiesStore'
    ],

    store: 'GXC.data.WfsCapabilitiesStore'
});
