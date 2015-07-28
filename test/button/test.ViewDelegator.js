describe('GXC.button.ViewDelegator', function() {

    var initComponent = function(config) {
            return Ext.create('GXC.button.ViewDelegator', config);
        };

    before(function(done) {
        Ext.syncRequire([
            // used as delegate
            'Ext.panel.Panel',
            // needs to be present for ViewController to be initialized
            'Deft.mixin.Controllable'
        ]);
        done();
    });

    describe('#ViewDelegator (creation)', function() {
        it('can be initialized without options', function() {
            expect(initComponent).to.not.throw(Error);
        });

        it('can be initialized with options', function() {
            expect(initComponent.bind(this, {
                parentQuery: 'doesnotexist',
                delegateXType: 'panel'
            })).to.not.throw(Error);
        });

        it('can be hidden safely', function() {
            var button = initComponent();
            expect(button.hide.bind(button)).to.not.throw(Error);
        });

        it('can be removed safely', function() {
            var button = initComponent({ renderTo: Ext.getBody() }),
                cachedId = button.getId();
            expect(button.destroy.bind(button)).to.not.throw(Error);
            expect(document.getElementById(cachedId)).to.not.exist;
        });
    });

    describe('#ViewDelegator (default)', function() {
        var button, controller;

        beforeEach(function() {
            button = initComponent({
                renderTo: Ext.getBody()
            });
        });

        it('can be initialized', function() {
            expect(Ext.getClassName(button)).to.equal('GXC.button.ViewDelegator');
            expect(button.pressed).to.be.false;
        });

        it('is controlled by ViewController', function() {
            expect(button.$controlled).to.be.true;
            expect(button.getController).to.be.a('function');
            controller = button.getController();
            expect(Ext.getClassName(controller)).to.equal('GXC.controller.button.ViewDelegator');
            expect(controller.getDelegate).to.be.a('function');
        });

        afterEach(function() {
            button.destroy();
            button = null;
            controller = null;
        });
    });

    describe('#ViewDelegator (configured to delegate component without parent)', function() {
        var button, controller, delegate;

        before(function() {
            button = initComponent({
                delegateXType: 'panel',
                renderTo: Ext.getBody()
            });
            controller = button.getController();
        });

        it('does not have a delegate view if unpressed', function() {
            expect(button.rendered).to.be.true;
            expect(button.pressed).to.be.false;
            expect(controller.getDelegate()).to.not.exist;
        });

        it('responds to toggle interaction by initializing a delegate', function() {
            var delegate;

            expect(button).to.respondTo('toggle');
            expect(button.toggle.bind(button, true)).to.not.throw(Error);
            expect(button.pressed).to.be.true;

            expect(function() {
                delegate = controller.getDelegate();
            }).to.not.throw(Error);
            expect(delegate).to.exist;
            expect(Ext.getClassName(delegate)).to.equal('Ext.window.Window');
            expect(delegate.query('panel')).to.have.length(1);
            expect(delegate.isVisible()).to.be.true;
            expect(delegate.isFloating()).to.be.true;
        });

        it('responds to untoggling by deinitializing a delegate', function() {
            expect(button.toggle.bind(button, false)).to.not.throw(Error);
            expect(controller.getDelegate()).to.not.exist;
        });

        after(function() {
            button.destroy();
            button = null;
            controller = null;
        });
    });

    describe('#ViewDelegator (configured to delegate component with wrong query)', function() {
        var button;

        beforeEach(function() {
            button = initComponent({
                parentQuery: 'doesnotexist',
                delegateXType: 'panel',
                renderTo: Ext.getBody()
            });
        });

        it('has custom config options to delegate', function() {
            expect(button.getParentQuery()).to.equal('doesnotexist');
            expect(button.getDelegateXType()).to.equal('panel');
        });

        it('can not delegate without parent', function() {
            expect(button.toggle.bind(button, true)).to.throw(Error);
        });

        afterEach(function() {
            button.destroy();
            button = null;
        });
    });

    describe('#ViewDelegator (configured to delegate component)', function() {
        var parent, button;

        beforeEach(function() {
            button = initComponent({
                renderTo: Ext.getBody(),
                parentQuery: '#stage',
                delegateXType: 'panel',
                delegateConfig: {
                    width: 200,
                    height: 200,
                    itemId: 'delegate'
                }
            });

            parent = Ext.create('Ext.panel.Panel', {
                itemId: 'stage',
                renderTo: Ext.getBody()
            });
        });

        it('can delegate item to be added to parent', function(done) {
            var delegate;
            expect(button.toggle.bind(button, true)).to.not.throw(Error);
            delegate = parent.items.getAt(0);
            expect(delegate).to.exist;
            expect(Ext.getClassName(delegate)).to.be.equal('Ext.panel.Panel');
            expect(delegate.getItemId()).to.be.equal('delegate');
            expect(delegate.getWidth()).to.be.equal(200);
            expect(delegate.getHeight()).to.be.equal(200);
            done();
        });

        afterEach(function() {
            button.destroy();
            parent.destroy();
            button = null;
            parent = null;
        });
    });
});
