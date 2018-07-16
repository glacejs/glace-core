"use config";

const tools = rewire("../../lib/tools");

suite("tools", () => {

    test("listTests()", () => {

        chunk("prints nothing if no tests exist", () => {
            const _log = console.log;
            console.log = sinon.stub();

            const _cases = CONF.test.cases;
            CONF.test.cases = [];

            tools.listTests();
            expect(console.log).to.be.calledOnce;
            expect(console.log.args[0][0]).to.include("No tests are found");

            console.log = _log;
            CONF.test.cases = _cases;
        });

        chunk("prints nothing if no tests are matched with filter", () => {
            const _log = console.log;
            console.log = sinon.stub();

            const _cases = CONF.test.cases;
            CONF.test.cases = [{ name: "my test" }];

            tools.listTests("other");
            expect(console.log).to.be.calledOnce;
            expect(console.log.args[0][0]).to.include("No tests are found");

            console.log = _log;
            CONF.test.cases = _cases;
        });

        chunk("prints tests if they are matched with filter", () => {
            const _log = console.log;
            console.log = sinon.stub();

            const _cases = CONF.test.cases;
            CONF.test.cases = [{ name: "my test" }];

            tools.listTests("my");
            expect(console.log).to.be.calledOnce;
            expect(console.log.args[0][0]).to.include("1. my test");

            console.log = _log;
            CONF.test.cases = _cases;
        });
    });
});
