/**
 * A simple CodeMirror Editor to allow XML editing.
 * Overrides some event handlers of the parent class to forward interaction
 * to the CodeMirror plugin.
 */
Ext.define('GXC.form.CodeMirror', {
    extend: 'Ext.form.field.TextArea',

    alias: 'widget.gxc_form_codemirror',

    /**
     * CodeMirror editor.
     * @type {CodeMirror}
     */
    editor: null,

    /**
     * CodeMirror editor options that will be applied at init.
     * @type {Object}
     */
    editorOptions: null,

    emptyText: 'Enter style definition..',

    onRender: function(textArea, options) {
        this.callParent(arguments);

        var inputId = this.getInputId(),
            dom = document.getElementById(inputId);

        if (window.CodeMirror) {
            this.editor = CodeMirror.fromTextArea(dom, this.editorOptions || {});
        }
    },

    onResize: function(width, height) {
        this.callParent(arguments);

        if (this.editor) {
            this.editor.setSize(width, height);
        }
    },

    focus: function() {
        if (this.editor) {
            this.editor.focus();
        } else {
            this.callParent(arguments);
        }
    },

    onFocus: function() {
        this.fireEvent('focus', this);
    },

    getValue: function() {
        if (this.editor) {
            this.editor.save();
        }
        return this.callParent(arguments);
    },

    setValue: function() {
        if (this.editor) {
            this.editor.setValue(value);
        }
        return this.callParent(arguments);
    },

    destroy: function() {
        if (this.editor) {
            this.editor.toTextArea();
        }
        this.callParent(arguments);
    }
});
