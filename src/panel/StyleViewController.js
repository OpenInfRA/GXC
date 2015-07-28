Ext.define('GXC.panel.StyleViewController', {
    extend: 'Deft.mvc.ViewController',

    control: {
        'cancelButton': {
            'click': 'onCancelButtonClick'
        },
        'saveButton': {
            'click': 'onSaveButtonClick'
        },
        'nameField': {
            'change': 'onFieldChange'
        },
        'titleField': {
            'change': 'onFieldChange'
        },
        'descriptionField': {
            'change': 'onFieldChange'
        }
    },

    onCancelButtonClick: function() {
        var view = this.getView();
        view.fireEvent('cancelstyle', view, view.userStyle);
    },

    onSaveButtonClick: function() {
        var view = this.getView();
        view.fireEvent('savestyle', view, view.userStyle);
    },

    onFieldChange: function(field, value) {
        var view = this.getView();
        view.userStyle[field.name] = value;
        view.fireEvent('change', view, view.userStyle);
    }
});
