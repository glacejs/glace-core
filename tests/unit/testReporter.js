"use strict";

let reporter;

suite("reporter", () => {
    let register;

    before(() => {
        register = sinon.stub();
        reporter = rehire("../../lib/reporter", {
            "./base": { register },
            "./stdout": "stdout reporter",
        });
    });

    afterChunk(() => {
        reporter.__reset__();
    });

    test("import", () => {

        chunk("activates default reporter", () => {
            expect(register).to.be.calledOnce;
            expect(register.args[0][0]).to.be.equal("stdout reporter");
        });
    });

    test("main", () => {
        let base, plugins, require_, main, config;

        beforeChunk(() => {
            config = {
                allure: {},
                report: {},
                testrail: {},
                xunit: {},
            };
            reporter.__set__("CONF", config);

            base = { register: sinon.spy() };
            reporter.__set__("base", base);

            require_ = o => o;
            reporter.__set__("require", require_);

            plugins = { getModules: sinon.stub().returns([]) };
            reporter.__set__("plugins", plugins);

            main = reporter.__get__("main");
        });

        chunk("activates default reporter", () => {
            main();
            expect(base.register).to.be.calledOnce;
            expect(base.register.args[0][0]).to.be.equal("./stdout");
        });

        chunk("uses dots as default reporter", () => {
            config.report.dots = true;
            main();
            expect(base.register).to.be.calledOnce;
            expect(base.register.args[0][0]).to.be.equal("./dots");
        });

        chunk("activates optional reporters", () => {
            config.testrail.use = true;
            config.xunit.use = true;
            config.allure.use = true;

            main();
            expect(base.register.args[1][0]).to.be.equal("./testrail");
            expect(base.register.args[2][0]).to.be.equal("./xunit");
            expect(base.register.args[3][0]).to.be.equal("./allure");
        });

        chunk("activates plugin reporters", () => {
            config.testrail.use = false;
            config.xunit.use = false;
            config.allure.use = false;
            plugins.getModules.returns(["my-reporter"]);

            main();
            expect(base.register.args[1][0]).to.be.equal("my-reporter");
        });
    });
});
