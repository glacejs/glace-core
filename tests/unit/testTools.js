"use config";

const tools = rewire("../../lib/tools");

suite("tools", () => {

    afterChunk(() => {
        tools.__reset__();
    });

    test(".listSteps()", () => {
        let getStepNames, getStepsData, learnClassifier, filterSteps;

        beforeChunk(() => {
            getStepNames = sinon.stub();
            tools.__set__("getStepNames", getStepNames);

            getStepsData = sinon.stub();
            tools.__set__("getStepsData", getStepsData);

            learnClassifier = sinon.stub();
            tools.__set__("learnClassifier", learnClassifier);

            filterSteps = sinon.stub();
            tools.__set__("filterSteps", filterSteps);
        });

        chunk("gets cached steps", () => {
            tools.__set__("stepsCache", ["my-step"]);

            expect(tools.listSteps()).to.be.eql(["my-step"]);
            expect(getStepNames).to.not.be.called;
            expect(getStepsData).to.not.be.called;
            expect(learnClassifier).to.not.be.called;
            expect(filterSteps).to.not.be.called;
        });

        chunk("gets steps with cache population", () => {
            getStepsData.returns(["my-step"]);
            tools.__set__("stepsCache", null);

            expect(tools.listSteps()).to.be.eql(["my-step"]);
            expect(tools.__get__("stepsCache")).to.be.eql(["my-step"]);
            expect(getStepNames).to.be.calledOnce;
            expect(getStepsData).to.be.calledOnce;
            expect(learnClassifier).to.be.calledOnce;
            expect(learnClassifier.args[0][0]).to.be.eql(["my-step"]);
            expect(filterSteps).to.not.be.called;
        });

        chunk("gets filtered steps", () => {
            filterSteps.returns(["my-another-step"]);
            tools.__set__("stepsCache", ["my-step"]);

            expect(tools.listSteps("another")).to.be.eql(["my-another-step"]);
            expect(filterSteps).to.be.calledOnce;
            expect(filterSteps.args[0]).to.be.eql([["my-step"], "another", false]);
        });
    });

    test(".printSteps()", () => {
        let listSteps, console_, d, highlight;

        beforeChunk(() => {
            listSteps = sinon.stub();
            tools.__set__("listSteps", listSteps);

            console_ = {
                log: sinon.stub(),
            };
            tools.__set__("console", console_);

            d = sinon.stub();
            tools.__set__("d", d);

            highlight = sinon.stub();
            tools.__set__("highlight", highlight);
        });

        chunk("print no steps message", () => {
            listSteps.returns([]);
            tools.printSteps();

            expect(listSteps).to.be.calledOnce;
            expect(listSteps.args[0]).to.be.eql([undefined, false]);

            expect(console_.log).to.be.calledOnce;
            expect(console_.log.args[0][0]).to.include("No steps are found");

            expect(d).to.not.be.called;
        });

        chunk("print steps", () => {
            listSteps.returns([{ name: "my step", description: "my description" }]);
            tools.printSteps();

            expect(console_.log).to.be.calledTwice;
            expect(d).to.be.calledTwice;
            expect(d.args[0][0]).to.include("1. my step:");
            expect(d.args[1][0]).to.include("my description");
            expect(highlight).to.not.be.called;
        });

        chunk("print steps with docs", () => {
            listSteps.returns([{ name: "my step", description: "my description", doc: "/* step docs */" }]);
            tools.printSteps();

            expect(console_.log).to.be.calledThrice;
            expect(highlight).to.be.calledOnce;
            expect(highlight.args[0][0]).to.be.equal("/* step docs */");
            expect(highlight.args[0][1]).to.be.eql({ language: "js" });
        });
    });

    test(".printTests()", () => {
        let fakeLoad, conf, console_;

        beforeChunk(() => {
            fakeLoad = sinon.stub();
            tools.__set__("fakeLoad", fakeLoad);

            conf = {
                test: { cases: [] },
            };
            tools.__set__("CONF", conf);

            console_ = {
                log: sinon.stub(),
            };
            tools.__set__("console", console_);
        });

        chunk("prints no tests message if no tests", () => {
            tools.printTests();

            expect(fakeLoad).to.be.calledOnce;
            expect(console_.log).to.be.calledOnce;
            expect(console_.log.args[0][0]).to.include("No tests are found");
        });

        chunk("prints no tests message if no filtered tests", () => {
            conf.test.cases = [{ name: "my test" }];
            tools.printTests("another test");

            expect(console_.log).to.be.calledOnce;
            expect(console_.log.args[0][0]).to.include("No tests are found");

        });

        chunk("prints tests", () => {
            conf.test.cases = [{ name: "my test" }, { name: "another test" }];
            tools.printTests("my test");

            expect(console_.log).to.be.calledOnce;
            expect(console_.log.args[0][0]).to.include("1. my test");
        });
    });

    test(".printPlugins()", () => {
        let plugins, console_;

        beforeChunk(() => {
            plugins = {
                get: sinon.stub(),
            };
            tools.__set__("plugins", plugins);

            console_ = {
                log: sinon.stub(),
            };
            tools.__set__("console", console_);
        });

        chunk("prints no plugins message", () => {
            plugins.get.returns([]);
            tools.printPlugins();

            expect(console_.log).to.be.calledOnce;
            expect(console_.log.args[0][0]).to.include("No plugins are detected");
        });

        chunk("prints plugins list", () => {
            plugins.get.returns([{ name: "my plugin", path: "/path/to/my/plugin" }]);
            tools.printPlugins();

            expect(console_.log).to.be.calledOnce;
            expect(console_.log.args[0][0]).to.include("1. my plugin");
            expect(console_.log.args[0][1]).to.include("/path/to/my/plugin");
        });
    });

    test(".fakeLoad()", () => {
        let global_, require_;

        beforeChunk(() => {
            global_ = {};
            tools.__set__("global", global_);

            require_ = sinon.stub();
            tools.__set__("require", require_);
        });

        chunk(() => {
            tools.fakeLoad();

            expect(global_.before).to.be.a("function");
            expect(global_.after).to.be.a("function");
            expect(global_.beforeEach).to.be.a("function");
            expect(global_.afterEach).to.be.a("function");
            expect(global_.it).to.be.a("function");
            expect(global_.describe).to.be.a("function");

            expect(require_).to.be.calledTwice;
            expect(require_.args[0][0]).to.be.equal("./globals");
            expect(require_.args[1][0]).to.be.equal("./loader");
        });
    });
});
