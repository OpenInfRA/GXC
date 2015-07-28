/**
 * A simple combo box that lists styles.
 */
Ext.define('GXC.form.StyleComboBox', {
    extend: 'Ext.form.field.ComboBox',

    alias: 'widget.gxc_form_stylecombobox',

    fieldLabel: 'Style',

    queryMode: 'local',
    displayField: 'title',
    valueField: 'name'
});
