"use config";

const Testrail = require("testrail-api");

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

    test(".listFixtures()", () => {
        let fakeLoad, getFixtures, filterFixtures;

        beforeChunk(() => {
            fakeLoad = sinon.stub();
            tools.__set__("fakeLoad", fakeLoad);

            getFixtures = sinon.stub().returns(["my fixture"]);
            tools.__set__("getFixtures", getFixtures);

            filterFixtures = sinon.stub().returns(["another fixture"]);
            tools.__set__("filterFixtures", filterFixtures);
        });

        chunk("gets list of all fixtures", () => {
            expect(tools.listFixtures()).to.be.eql(["my fixture"]);
            expect(fakeLoad).to.be.calledOnce;
            expect(filterFixtures).to.not.be.called;
        });

        chunk("gets list of filtered fixtures", () => {
            expect(tools.listFixtures("another")).to.be.eql(["another fixture"]);
            expect(filterFixtures.args[0]).to.be.eql([["my fixture"], "another", false]);
        });
    });

    test(".printFixtures()", () => {
        let listFixtures, console_, d, highlight;

        beforeChunk(() => {
            listFixtures = sinon.stub();
            tools.__set__("listFixtures", listFixtures);

            console_ = {
                log: sinon.stub(),
            };
            tools.__set__("console", console_);

            d = sinon.stub();
            tools.__set__("d", d);

            highlight = sinon.stub();
            tools.__set__("highlight", highlight);
        });

        chunk("prints no fixtures message", () => {
            listFixtures.returns([]);
            tools.printFixtures();

            expect(console_.log).to.be.calledOnce;
            expect(console_.log.args[0][0]).to.include("No fixtures are found");
        });

        chunk("prints list of fixtures", () => {
            listFixtures.returns([{ name: "my fixture" }]);
            tools.printFixtures();
            
            expect(console_.log).to.be.calledOnce;
            expect(d).to.be.calledOnce;
            expect(d.args[0][0]).to.include("1. my fixture");
        });

        chunk("prints list of fixtures with docs", () => {
            listFixtures.returns([{ name: "my fixture", doc: "/* fixture doc */" }]);
            tools.printFixtures();
            
            expect(console_.log).to.be.calledTwice;
            expect(d).to.be.calledOnce;
            expect(d.args[0][0]).to.include("1. my fixture");
            expect(highlight).to.be.calledOnce;
            expect(highlight.args[0][0]).to.be.equal("/* fixture doc */");
            expect(highlight.args[0][1]).to.be.eql({ language: "js" });
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

    test(".checkTestrail()", () => {
        let checkTestrailOpts, fakeLoad, conf, checkTestrailCases;

        beforeChunk(() => {
            checkTestrailOpts = sinon.stub();
            tools.__set__("checkTestrailOpts", checkTestrailOpts);

            fakeLoad = sinon.stub();
            tools.__set__("fakeLoad", fakeLoad);

            conf = {
                testrail: {
                    host: "http://testrail",
                    user: "user@example.com",
                    token: "1234asdf",
                },
            };
            tools.__set__("CONF", conf);

            checkTestrailCases = sinon.stub();
            tools.__set__("checkTestrailCases", checkTestrailCases);
        });

        chunk(() => {
            const cb = () => {};
            tools.checkTestrail(cb);

            expect(checkTestrailOpts).to.be.calledOnce;
            expect(fakeLoad).to.be.calledOnce;
            expect(checkTestrailCases).to.be.calledOnce;
            expect(checkTestrailCases.args[0][1]).to.be.equal(cb);

            const client = checkTestrailCases.args[0][0];
            expect(client).to.be.an.instanceof(Testrail);
            expect(client.host).to.be.equal("http://testrail");
            expect(client.user).to.be.equal("user@example.com");
            expect(client.password).to.be.equal("1234asdf");
        });
    });

    test("checkTestrailOpts()", () => {
        let checkTestrailOpts, conf;

        before(() => {
            checkTestrailOpts = tools.__get__("checkTestrailOpts");

            conf = {
                testrail: {
                    host: "http://testrail",
                },
            };
            tools.__set__("CONF", conf);
        });

        chunk("passes if options exist", () => {
            checkTestrailOpts();
        });

        chunk("throws if options don't exist", () => {
            conf.testrail.host = null;
            expect(checkTestrailOpts).to.throw(
                "TestRail option 'host' isn't specified in config");
        });
    });

    test("checkTestrailMissed()", () => {
        let checkTestrailMissed, console_, conf;

        beforeChunk(() => {
            checkTestrailMissed = tools.__get__("checkTestrailMissed");

            console_ = {
                log: sinon.stub(),
            };
            tools.__set__("console", console_);

            conf = {
                test: {
                    cases: [{ name: "my case" }],
                },
            };
            tools.__set__("CONF", conf);
        });

        chunk("returns 0 if no missed cases", () => {
            expect(checkTestrailMissed([{ title: "my case" }])).to.be.equal(0);
            expect(console_.log).to.not.be.called;
        });

        chunk("returns 1 if there are missed cases", () => {
            expect(checkTestrailMissed([{ title: "another case" }])).to.be.equal(1);
            expect(console_.log).to.be.calledTwice;
            expect(console_.log.args[0][0]).to.include("Missed TestRail cases");
            expect(console_.log.args[1][0]).to.include("1. my case");
        });
    });

    test("checkTestrailNotImplemented()", () => {
        let checkTestrailNotImplemented, console_, conf;

        beforeChunk(() => {
            checkTestrailNotImplemented = tools.__get__("checkTestrailNotImplemented");

            console_ = {
                log: sinon.stub(),
            };
            tools.__set__("console", console_);

            conf = {
                test: {
                    cases: [{ name: "my case" }],
                },
            };
            tools.__set__("CONF", conf);
        });

        chunk("returns 0 if all cases are implemented", () => {
            expect(checkTestrailNotImplemented([{ title: "my case" }])).to.be.equal(0);
            expect(console_.log).to.not.be.called;
        });

        chunk("returns 1 if there are not implemented cases", () => {
            expect(checkTestrailNotImplemented([{ title: "another case" }])).to.be.equal(1);
            expect(console_.log).to.be.calledTwice;
            expect(console_.log.args[0][0]).to.include("Not implemented TestRail cases");
            expect(console_.log.args[1][0]).to.include("1. another case");
        });
    });

    test("checkTestrailDuplicates()", () => {
        let checkTestrailDuplicates, console_;

        beforeChunk(() => {
            checkTestrailDuplicates = tools.__get__("checkTestrailDuplicates");

            console_ = {
                log: sinon.stub(),
            };
            tools.__set__("console", console_);
        });

        chunk("returns 0 if no missed cases", () => {
            expect(checkTestrailDuplicates([{ title: "my case" }, { title: "another case" }])).to.be.equal(0);
            expect(console_.log).to.not.be.called;
        });

        chunk("returns 1 if there are missed cases", () => {
            expect(checkTestrailDuplicates([{ title: "my case" }, { title: "my case" }])).to.be.equal(1);
            expect(console_.log).to.be.calledTwice;
            expect(console_.log.args[0][0]).to.include("TestRail duplicated cases");
            expect(console_.log.args[1][0]).to.include("1. my case");
        });
    });

    test("checkTestrailCases()", () => {
        let checkTestrailCases, conf, client, console_;

        beforeChunk(() => {
            checkTestrailCases = tools.__get__("checkTestrailCases");

            conf = {
                testrail: {
                    projectId: 1,
                    suiteId: 2,
                    host: "http://testrail",
                },
            };
            tools.__set__("CONF", conf);

            client = {
                getCases: sinon.stub(),
            };

            console_ = {
                log: sinon.stub(),
            };
            tools.__set__("console", console_);
        });

        chunk("calls testrail client", () => {

            checkTestrailCases(client);
            expect(client.getCases).to.be.calledOnce;
            expect(client.getCases.args[0][0]).to.be.equal(1);
            expect(client.getCases.args[0][1]).to.be.eql({ suite_id: 2 });
        });

        scope("callback", () => {
            let cb, callback, checkTestrailDuplicates,
                checkTestrailNotImplemented, checkTestrailMissed;

            beforeChunk(() => {
                cb = sinon.stub();
                checkTestrailCases(client, cb);
                callback = client.getCases.args[0][2];

                checkTestrailDuplicates = sinon.stub();
                tools.__set__("checkTestrailDuplicates", checkTestrailDuplicates);

                checkTestrailNotImplemented = sinon.stub();
                tools.__set__("checkTestrailNotImplemented", checkTestrailNotImplemented);

                checkTestrailMissed = sinon.stub();
                tools.__set__("checkTestrailMissed", checkTestrailMissed);
            });

            chunk("fails if error response", () => {
                callback("response error");

                expect(cb).to.be.calledOnce;
                expect(cb.args[0][0]).to.be.equal(1);

                expect(console_.log).to.be.calledOnce;
                expect(console_.log.args[0][0]).to.be.equal("response error");
            });

            chunk("fails if cases check is failed", () => {
                checkTestrailDuplicates.returns(1);
                checkTestrailNotImplemented.returns(1);
                checkTestrailMissed.returns(1);

                callback();

                expect(cb).to.be.calledOnce;
                expect(cb.args[0][0]).to.be.equal(3);

                expect(console_.log).to.be.calledOnce;
                expect(console_.log.args[0][0]).to.include("TestRail suite is");
            });

            chunk("passes if cases check is passed", () => {
                checkTestrailDuplicates.returns(0);
                checkTestrailNotImplemented.returns(0);
                checkTestrailMissed.returns(0);

                callback();

                expect(cb).to.be.calledOnce;
                expect(cb.args[0][0]).to.be.equal(0);

                expect(console_.log).to.be.calledTwice;
                expect(console_.log.args[0][0]).to.include("cases correspond");
                expect(console_.log.args[1][0]).to.include("TestRail suite is");
            });
        });
    });
});
