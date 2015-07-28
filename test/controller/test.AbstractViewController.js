describe('GXC.controller.AbstractViewController', function() {

    var initController = function() {
        controller = Ext.create('GXC.controller.AbstractViewController', {
            appConfig: 'loaded',
            appConfig: 'loaded'
        });
    }, controller;

    before(function() {
        Ext.define('Mock.AppConfig', {});
        Ext.define('Mock.AppContext', {});

        Deft.Injector.configure({
            appConfig: 'Mock.AppConfig',
            appContext: 'Mock.AppContext'
        });
    });

    it('should be instantiable', function() {
        expect(initController).to.not.throw(Error);
        expect(Ext.getClassName(controller)).to.equal('GXC.controller.AbstractViewController');
    });

    it('should be configurable', function() {
        var appConfig = controller.appConfig,
            appContext = controller.appContext;
        expect(Ext.getClassName(appConfig)).to.equal('Mock.AppConfig');
        expect(Ext.getClassName(appContext)).to.equal('Mock.AppContext');
    });

    after(function() {
        Deft.Injector.reset();

        Ext.undefine('Mock.AppConfig');
        Ext.undefine('Mock.AppContext');
    });
});
