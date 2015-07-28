/**
 * A simple model to represent style instances. The actual SLD style is mapped
 * to the userStyle attribute.
 */
Ext.define('GXC.model.Style', {
    extend: 'Ext.data.Model',

    idProperty: 'name',

    fields: [{
        name: 'name',
        type: 'string'
    }, {
        name: 'title',
        type: 'string',
        convert: function(value, record) {
            if (!value) {
                return record.get('name');
            }
            return value;
        }
    }, {
        name: 'abstract',
        type: 'string'
    }, {
        name: 'legend'
    }, {
        name: 'userStyle'
    }, {
        name: 'edited',
        type: 'boolean',
        defaultValue: false
    }],

    set: function(fieldName, newValue) {
        if (fieldName === 'userStyle') {
            this.set('edited', true);
            this.set('name', newValue.name);
            this.set('title', newValue.title || newValue.name);
            this.set('abstract', newValue.description);
        }

        this.callParent(arguments);
    }
});
