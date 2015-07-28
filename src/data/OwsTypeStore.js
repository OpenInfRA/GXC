/**
 * Basic store representing possible OWS services in a static data definition.
 * It's primary purpose is to be used in dropdowns and so on.
 */
Ext.define('GXC.data.OwsTypeStore', {
    extend: 'Ext.data.Store',
    fields: ['abbr', 'name'],
    data: [
        { 'abbr': 'WMS', 'name': 'Web Mapping Service' },
        { 'abbr': 'WFS', 'name': 'Web Feature Service' }
    ],
    autoload: true
});
