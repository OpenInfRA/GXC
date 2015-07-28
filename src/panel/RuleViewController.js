/**
 * @class
 */
Ext.define('GXC.panel.RuleViewController', {
    extend: 'Deft.mvc.ViewController',

    control: {
        'view': {
            'boxready': 'onViewBoxready'
        },
        'nameField': {
            'change': 'onNameFieldChange'
        },
        'abstractField': {
            'change': 'onAbstractFieldChange'
        },
        'symbolizerSwatch': true,
        'symbolizerPanel': {
            'change': 'onSymbolizerPanelChange'
        },
        'textSymbolizerFieldSet': {
            live: true,
            listeners: {
                'collapse': 'onTextSymbolizerFieldSetCollapse',
                'expand': 'onTextSymbolizerFieldSetExpand'
            }
        },
        'textSymbolizer': {
            live: true,
            listeners: {
                'change': 'onTextSymbolizerChange'
            }
        },
        'filterBuilderFieldSet': {
            live: true,
            listeners: {
                'collapse': 'onFilterBuilderFieldSetCollapse',
                'expand': 'onFilterBuilderFieldSetExpand'
            }
        },
        'filterBuilder': {
            live: true,
            listeners: {
                'change': 'onFilterBuilderChange'
            }
        }
    },

    onViewBoxready: function(view) {
        var symbolizerSwatch = this.getSymbolizerSwatch();

        symbolizerSwatch.setSymbolizers(view.rule.symbolizers || view.rule.symbolizer, {
            draw: symbolizerSwatch.rendered
        });
    },

    onNameFieldChange: function(field, value) {
        var view = this.getView(),
            rule = view.rule;
        rule.title = value;
        view.fireEvent('change', view, rule);
    },

    onAbstractFieldChange: function(field, value) {
        var view = this.getView(),
            rule = view.rule;

        rule.description = value;
        view.fireEvent('change', view, rule);
    },

    onSymbolizerPanelChange: function(symbolizer) {
        var view = this.getView(),
            rule = view.rule,
            symbolizerSwatch = this.getSymbolizerSwatch();

        symbolizerSwatch.setSymbolizers([symbolizer], {
            draw: symbolizerSwatch.rendered
        });

        if (!view.symbolizerExists) {
            if (rule.symbolizers) {
                rule.symbolizers.push(symbolizer);
            } else {
                rule.symbolizer = symbolizer;
            }
            view.symbolizerExists = true;
        }

        view.fireEvent('change', view, rule);
    },

    onTextSymbolizerFieldSetCollapse: function() {
        var view = this.getView(),
            rule = view.rule;

        OpenLayers.Util.removeItem(rule.symbolizers, view.getTextSymbolizer());
        view.fireEvent('change', view, rule);
    },

    onTextSymbolizerFieldSetExpand: function() {
        var view = this.getView();

        view.setTextSymbolizer(this.getTextSymbolizer().symbolizer);
        view.fireEvent('change', view, view.rule);
    },

    onTextSymbolizerChange: function() {
        var view = this.getView();

        view.fireEvent('change', view, view.rule);
    },

    onFilterBuilderFieldSetCollapse: function(){
        var view = this.getView(),
            rule = view.rule;

        delete rule.filter;
        view.fireEvent('change', view, rule);
    },

    onFilterBuilderFieldSetExpand: function(){
        var view = this.getView(),
            rule = view.rule;

        rule.filter = this.getFilterBuilder().getFilter();
        view.fireEvent('change', view, rule);
    },

    onFilterBuilderChange: function(builder) {
        var view = this.getView(),
            rule = view.rule,
            filter = builder.getFilter();

        rule.filter = filter;
        view.fireEvent('change', view, rule);
    }
});
