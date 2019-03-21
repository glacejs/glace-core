"use strict";

let reporter;

suite("reporter", () => {

    before(() => {
        CONF.__testmode = true;
        reporter = rehire("../../lib/reporter");
    });

    after(() => {
        CONF.__testmode = false;
    });

    afterChunk(() => {
        reporter.__reset__();
    });

    test("import", () => {
        let base, plugins, require_;

        beforeChunk(() => {
            CONF.xunit.use = false;
            CONF.allure.use = false;
            CONF.report.dots = false;
            CONF.testrail.use = false;

            base = { register: sinon.spy() };
            reporter.__set__("base", base);

            require_ = o => o;
            reporter.__set__("require", require_);

            plugins = { getModules: sinon.stub().returns([]) };
            reporter.__set__("plugins", plugins);
        });

        chunk("activates default reporter", () => {
            reporter();
            expect(base.register).to.be.calledOnce;
            expect(base.register.args[0][0]).to.be.equal("./stdout");
        });

        chunk("uses dots as default reporter", () => {
            CONF.report.dots = true;
            reporter();
            expect(base.register).to.be.calledOnce;
            expect(base.register.args[0][0]).to.be.equal("./dots");
        });

        chunk("activates optional reporters", () => {
            CONF.testrail.use = true;
            CONF.xunit.use = true;
            CONF.allure.use = true;

            reporter();
            expect(base.register.args[1][0]).to.be.equal("./testrail");
            expect(base.register.args[2][0]).to.be.equal("./xunit");
            expect(base.register.args[3][0]).to.be.equal("./allure");
        });

        chunk("activates plugin reporters", () => {
            CONF.testrail.use = false;
            CONF.xunit.use = false;
            CONF.allure.use = false;
            plugins.getModules.returns(["my-reporter"]);

            reporter();
            expect(base.register.args[1][0]).to.be.equal("my-reporter");
        });
    });
});
