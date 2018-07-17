"use config";

const tools = rewire("../../lib/tools");

suite("tools", () => {
    let sandbox = sinon.createSandbox();
    let load;

    beforeChunk(() => {
        load = sinon.spy();
        tools.__set__("load", load);
    });

    afterChunk(() => {
        sandbox.restore();
        tools.__reset__();
    });

    test("listTests()", () => {

        chunk("prints nothing if no tests exist", () => {
            sandbox.stub(console, "log");

            const _cases = CONF.test.cases;
            CONF.test.cases = [];

            tools.listTests();
            expect(load).to.be.calledOnce;
            expect(console.log).to.be.calledOnce;
            expect(console.log.args[0][0]).to.include("No tests are found");

            console.log.restore();
            CONF.test.cases = _cases;
        });

        chunk("prints nothing if no tests are matched with filter", () => {
            sandbox.stub(console, "log");

            const _cases = CONF.test.cases;
            CONF.test.cases = [{ name: "my test" }];

            tools.listTests("other");
            expect(console.log).to.be.calledOnce;
            expect(console.log.args[0][0]).to.include("No tests are found");

            console.log.restore();
            CONF.test.cases = _cases;
        });

        chunk("prints tests if they are matched with filter", () => {
            sandbox.stub(console, "log");

            const _cases = CONF.test.cases;
            CONF.test.cases = [{ name: "my test" }];

            tools.listTests("my");
            expect(console.log).to.be.calledOnce;
            expect(console.log.args[0][0]).to.include("1. my test");

            console.log.restore();
            CONF.test.cases = _cases;
        });
    });

    test("listPlugins()", () => {
        let plugins;

        beforeChunk(() => {
            plugins = tools.__get__("plugins");
            sandbox.stub(plugins, "get").returns(null);
        });

        chunk("prints nothing if no plugins are available", () => {
            sandbox.stub(console, "log");

            tools.listPlugins();

            expect(console.log).to.be.calledOnce;
            expect(console.log.args[0][0]).to.include("No plugins are detected");

            console.log.restore();
        });

        chunk("prints list of plugins if plugins are available", () => {
            plugins.get.returns([{ name: "my plugin", path: "/path/to/my/plugin" }]);

            sandbox.stub(console, "log");

            tools.listPlugins();

            expect(console.log).to.be.calledOnce;
            expect(console.log.args[0][0]).to.include("my plugin");
            expect(console.log.args[0][1]).to.include("/path/to/my/plugin");

            console.log.restore();
        });
    });
});
