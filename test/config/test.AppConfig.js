describe('GXC.config.AppConfig', function() {
    describe('#AppConfig defaults', function() {
        var config;

        it('should be initializable', function() {
            config = Ext.create('GXC.config.AppConfig');
            expect(Ext.getClassName(config)).to.equal('GXC.config.AppConfig');
        });

        it('should be set to demo env on default', function() {
            var defaults = GXC.config.AppConfig.DEMO_ENV;
            expect(config.getEnvironment()).to.deep.equal(defaults);
        });

        it('getting config items should allow defaulting', function() {
            var obj = {
                a: 'test'
            };
            expect(config.get('x', 0)).to.equal(0);
            expect(config.get('x', 'test')).to.equal('test');
            expect(config.get('x', obj)).to.deep.equal(obj);
            expect(config.get('x')).to.be.undefined;
        });
    });

    describe('#AppConfig custom env', function() {
        var env = {
                testArr: [1,2,3],
                testObj: { x: 1 },
                testStr: 'test',
                testNum: 1,
                testBool: false
            },
            config;

        it('should be initializable', function() {
            config = Ext.create('GXC.config.AppConfig', {
                environment: env
            });
            expect(Ext.getClassName(config)).to.equal('GXC.config.AppConfig');
            expect(config.getEnvironment()).to.deep.equal(env);
            expect(config.get('testArr')).to.equal(env.testArr);
            expect(config.get('testObj')).to.deep.equal(env.testObj);
            expect(config.get('testStr')).to.equal('test');
            expect(config.get('testNum')).to.equal(1);
            expect(config.get('testBool')).to.be.false;
        });
    });
});
