Ext.define('GXC.InjectableComponent', {
  override: 'Ext.Component',
  constructor: function(config) {
    config = Ext.apply(config || {}, this.injectConfig);
    delete this.injectConfig;
    return this.callSuper([config]);
  }
});
