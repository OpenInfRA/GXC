/**
 * A form field to select color values in hex format.
 */
Ext.define('GXC.form.ColorField', {
    extend: 'Ext.form.field.Trigger',
    alias: 'widget.gxc_form_colorfield',
    requires: [
        'Ext.form.field.VTypes',
        'Ext.layout.component.field.Text',
        'Ext.menu.ColorPicker'
    ],

    blankText: "Must have a hexidecimal value in the format [#]ABCDEF.",

    /**
     * Regex color values are evaluated against.
     */
    regex: /^#?[0-9a-f]{6}$/i,

    validateValue : function(value){
        if(!this.getEl()) {
            return true;
        }

        if (value.length && !this.regex.test(value)) {
            this.markInvalid(Ext.String.format(this.blankText, value));
            return false;
        }

        this.markInvalid();
        this.setColor(value);
        return true;
    },

    setValue : function(hex){
        GXC.form.ColorField.superclass.setValue.call(this, hex);
        this.setColor(hex);
    },

    setColor : function(hex) {
        if (hex) {
            hex = !hex.startsWith('#') ? '#' + hex : hex;
        }
        GXC.form.ColorField.superclass.setFieldStyle.call(this, {
            'background-color': hex,
            'background-image': 'none',
            'color': this.isDark(hex) ? "#ffffff" : "#000000"
        });
    },

    menuListeners : {
        select: function(m, d){
            this.setValue(d);
        },
        show : function(){
            this.onFocus();
        },
        hide : function(){
            this.focus();
            var ml = this.menuListeners;
            this.menu.un("select", ml.select,  this);
            this.menu.un("show", ml.show,  this);
            this.menu.un("hide", ml.hide,  this);
        }
    },

    /**
     * Called on click events to show color picker component.
     * @param  {Ext.Event} event
     */
    onTriggerClick : function(e){
        if(this.disabled){
            return;
        }

        this.menu = Ext.create('Ext.menu.ColorPicker', {
            shadow: true,
            autoShow : true
        });
        this.menu.alignTo(this.inputEl, 'tl-bl?');
        this.menu.doLayout();

        this.menu.on(Ext.apply({}, this.menuListeners, {
            scope:this
        }));

        this.menu.show(this.inputEl);
    },

    /**
     *  Determine if a color is dark by avaluating brightness according to the
     *  W3C suggested algorithm for calculating brightness of screen colors.
     *  http://www.w3.org/WAI/ER/WD-AERT/#color-contrast
     *
     * @param {String} hex
     * @returns {Boolean}
     */
    isDark: function(hex) {
        var dark = false;
        if(hex) {
            // convert hex color values to decimal
            var r = parseInt(hex.substring(1, 3), 16) / 255;
            var g = parseInt(hex.substring(3, 5), 16) / 255;
            var b = parseInt(hex.substring(5, 7), 16) / 255;
            // use w3C brightness measure
            var brightness = (r * 0.299) + (g * 0.587) + (b * 0.144);
            dark = brightness < 0.5;
        }
        return dark;
    }
});
