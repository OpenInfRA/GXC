/**
 * @class
 */
Ext.define('GXC.form.StyleViewController', {
    extend: 'Deft.mvc.ViewController',

    control: {
        // some layers may not provide any styles
        // so the styleGrid may not be rendered
        'styleGrid': {
            live: true,
            listeners: {
                itemdblclick: 'onStyleGridItemDblClick',
                itemmouseenter: 'onStyleGridItemMouseEnter',
                itemmouseleave: 'onStyleGridItemMouseLeave'
            }
        },
        'sldBodyTextArea': {
            dragover: 'onSldBodyTextAreaDragOver',
            dragend: 'onSldBodyTextAreaDragEnd',
            drop: 'onSldBodyTextAreaDrop'
        },
        'applySldBodyButton': {
            click: 'onApplySldBodyButtonClick'
        },
        'resetSldBodyButton': {
            click: 'onResetSldBodyButtonClick'
        },
        'saveAsFileSldBodyButton': {
            live: true,
            listeners: {
                click: 'onSaveAsFileSldBodyButton'
            }
        }
    },

    onStyleGridItemDblClick: function(grid, record) {
        var view = this.getView();

        view.setLayerSldBody(null);
        view.setLayerStyles(record.get('name'));
    },

    onStyleGridItemMouseEnter: function(grid, record) {
        var layer = this.getView().getLayer();

        delete layer.params.SLD_BODY;
        layer.mergeNewParams({
            STYLES: record.get('name')
        });
    },

    onStyleGridItemMouseLeave: function() {
        var view = this.getView(),
            sldBody = view.getLayerSldBody(),
            options = {
                STYLES: view.getLayerStyles()
            };

        if (sldBody) {
            options.SLD_BODY = sldBody;
        }

        view.getLayer().mergeNewParams(options)
    },

    onSldBodyTextAreaDragover: function() {

    },

    onSldBodyTextAreaDragend: function() {

    },

    onSldBodyTextAreaDrop: function() {

    },

    onApplySldBodyButtonClick: function() {
        var view = this.getView(),
            layer = this.getView().getLayer(),
            style = this.getSldBodyTextArea().getValue();

        view.setLayerSldBody(style);

        this.mergeStyleParams();
    },

    onResetSldBodyButtonClick: function() {
        var view = this.getView(),
            layer = view.getLayer();

        view.setLayerStyles(null);
        view.setLayerSldBody(null);

        this.mergeStyleParams();
    },

    onSaveAsFileSldBodyButton: function() {
        var value = this.getSldBodyTextArea().getValue(),
            blob = new Blob([value], {type: "text/xml;charset=utf-8"});
        saveAs(blob, "Custom SLD.xml");
    },

    onSldBodyTextAreaDragOver: function(e) {
        console.log('dragOver');
        // e.stopPropagation(); // for some browsers stop redirecting
        // e.preventDefault();
        return false;
    },

    onSldBodyTextAreaDragEnd: function(e) {
        console.log('dragEnd');
        // e.stopPropagation(); // for some browsers stop redirecting
        // e.preventDefault();
        return false;
    },

    onSldBodyTextAreaDrop: function() {
        console.log('drop');
        return false;
    },

    readText: function(e) {
        e.stopPropagation(); // for some browsers stop redirecting
        e.preventDefault();

        var file,
            fileData,
            fileReader,
            files = e.dataTransfer.files;

        if (!files) {
            return;
        }

        //not append
        if(append.checked == false)
            dropZone.value = '';

        for(var i=0;i<files.length;i++)
        {
            file = files[i];

            //new instance for each file
            fileReader = new FileReader();
            fileReader.textArea = dropZone;

            fileData = function (event) {
                this.textArea.value += this.result
            };

            fileReader.addEventListener('loadend',fileData);
            fileReader.readAsText(file);
        }
    },

    mergeStyleParams: function() {
        var view = this.getView(),
            layer = view.getLayer(),
            styles = view.getLayerStyles(),
            sldBody = view.getLayerSldBody();
            params = {
                STYLES: styles
            };

        if (sldBody) {
            params.SLD_BODY = sldBody;
        } else {
            delete layer.params.SLD_BODY;
        }

        layer.mergeNewParams(params);
    }
});
