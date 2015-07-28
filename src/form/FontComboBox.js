/**
 * A combo box for selecting a font.
 */
Ext.define('GXC.form.FontComboBox', {
    extend: 'Ext.form.ComboBox',

    alias: 'widget.gxc_form_fontcombobox',

    /**
     *  List of font families to choose from.  Default is ["Arial",
     *  "Courier New", "Tahoma", "Times New Roman", "Verdana"].
     *
     * @type {Array}
     */
    fonts: [
        "Serif",
        "SansSerif",
        "Arial",
        "Courier New",
        "Tahoma",
        "Times New Roman",
        "Verdana"
    ],

    /**
     * The ``fonts`` item to select by default.
     *
     * @type {String}
     */
    defaultFont: "Serif",

    allowBlank: false,

    mode: "local",

    triggerAction: "all",

    editable: false,

    initComponent: function() {
        var fonts = this.fonts || GXC.form.FontComboBox.prototype.fonts;
        var defaultFont = this.defaultFont;
        if (fonts.indexOf(this.defaultFont) === -1) {
            defaultFont = fonts[0];
        }
        var defConfig = {
            displayField: "field1",
            valueField: "field1",
            store: fonts,
            value: defaultFont,
            tpl: Ext.create('Ext.XTemplate',
                '<tpl for=".">',
                    '<div class="x-boundlist-item" style="font-family: {field1}">{field1}</div>',
                '</tpl>'
            )
        };
        Ext.applyIf(this, defConfig);

        this.callParent(arguments);
    }
});
