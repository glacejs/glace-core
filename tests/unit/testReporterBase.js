"use strict";

const GlaceReporter = rewire("../../lib/reporter/base");
const testing = rewire("../../lib/testing");

const methods = {};
const runner = {
    on: (name, cb) => methods[name] = cb,
};

suite("reporter/base", () => {
    const sandbox = sinon.createSandbox();

    before(() => {
        GlaceReporter.__set__("MochaReporter", function () {});
        new GlaceReporter(runner);
    });

    afterChunk(() => {
        GlaceReporter.__reset__();
        sandbox.restore();
    });

    test("on start", () => {
        let onStart;

        beforeChunk(() => {
            onStart = methods["start"];
        });

        chunk("does nothing if no reporters are registered", () => {
            GlaceReporter.__set__("reporters", []);
            onStart();
        });

        chunk("does nothing if reporters don't have start method", () => {
            GlaceReporter.__set__("reporters", [{}]);
            onStart();
        });

        chunk("calls reporters' start method if it exists", () => {
            const reporters = [{ start: sinon.spy() }];
            GlaceReporter.__set__("reporters", reporters);
            onStart();
            expect(reporters[0].start).to.be.calledOnce;
        });
    });

    test("on end", () => {
        let onEnd, conf, reporters, fs;

        beforeChunk(() => {
            onEnd = methods["end"];

            reporters = [];
            GlaceReporter.__set__("reporters", reporters);

            fs = {
                existsSync: sinon.stub().returns(false),
            };
            GlaceReporter.__set__("fs", fs);

            conf = {
                test: {
                    cases: [],
                },
                session: {
                    isPassed: false,
                },
                report: {
                    dir: "/path/to/report",
                },
            };
            GlaceReporter.__set__("CONF", conf);
        });

        chunk("tests session is failed if there are failed tests", () => {
            conf.test.cases.push({ status: testing.TestCase.FAILED });
            onEnd();
            expect(conf.session.isPassed).to.be.false;
        });

        chunk("tests session is failed if there are session errors", () => {
            GlaceReporter.__set__("sessErrsNum", 1);
            onEnd();
            expect(conf.session.isPassed).to.be.false;
        });

        chunk("test session is passed if not failed tests and session errors", () => {
            conf.test.cases.push({ status: testing.TestCase.PASSED });
            GlaceReporter.__set__("sessErrsNum", 0);
            onEnd();
            expect(conf.session.isPassed).to.be.true;
        });

        chunk("empty report folders are removed", () => {
            fs.existsSync.returns(true);
            const U = GlaceReporter.__get__("U");
            sandbox.stub(U, "clearEmptyFolders");

            onEnd();
            expect(U.clearEmptyFolders).to.be.calledOnce;
            expect(U.clearEmptyFolders.args[0][0]).to.be.equal("/path/to/report");
        });

        chunk("reporter end methods are called if they exist", () => {
            reporters.push({ end: sinon.spy() });
            onEnd();
            expect(reporters[0].end).to.be.calledOnce;
        });
    });

    test("on suite", () => {
        let onSuite, reporters;

        beforeChunk(() => {
            onSuite = methods["suite"];
            reporters = [];
            GlaceReporter.__set__("reporters", reporters);
        });

        ["suite", "scope", "test"].forEach(methodName => {
            let mochaSuite;

            beforeChunk(() => {
                mochaSuite = {
                    title: new testing.ScopeType("my").setType(methodName),
                };
                reporters.push({});
                reporters[0][methodName] = sinon.spy();
            });

            chunk(`${methodName} is called if exists`, () => {
                onSuite(mochaSuite);
                expect(reporters[0][methodName]).to.be.calledOnce;
                expect(reporters[0][methodName].args[0][0]).to.be.equal(mochaSuite);
            });
        });

        chunk("nothing happends if no reporters exist", () => {
            let mochaSuite = {
                title: new testing.ScopeType("my").setType("suite"),
            };
            onSuite(mochaSuite);
        });

        chunk("nothing happends if reporter method doesn't exist", () => {
            reporters.push({
                suite: sinon.spy(),
                scope: sinon.spy(),
                test: sinon.spy(),
            });
            let mochaSuite = {
                title: new testing.ScopeType("my"),
            };
            onSuite(mochaSuite);
            expect(reporters[0].suite).to.not.be.called;
            expect(reporters[0].scope).to.not.be.called;
            expect(reporters[0].test).to.not.be.called;
        });
    });

    test("on suite end", () => {
        let onSuiteEnd, reporters;

        beforeChunk(() => {
            onSuiteEnd = methods["suite end"];
            reporters = [];
            GlaceReporter.__set__("reporters", reporters);
        });

        ["suite", "scope", "test"].forEach(type => {
            let mochaSuite,
                methodName = type + "End";

            beforeChunk(() => {
                mochaSuite = {
                    title: new testing.ScopeType("my").setType(type),
                };
                reporters.push({});
                reporters[0][methodName] = sinon.spy();
            });

            chunk(`${methodName} is called if exists`, () => {
                onSuiteEnd(mochaSuite);
                expect(reporters[0][methodName]).to.be.calledOnce;
                expect(reporters[0][methodName].args[0][0]).to.be.equal(mochaSuite);
            });
        });

        chunk("nothing happends if no reporters exist", () => {
            let mochaSuite = {
                title: new testing.ScopeType("my").setType("suite"),
            };
            onSuiteEnd(mochaSuite);
        });

        chunk("nothing happends if reporter method doesn't exist", () => {
            reporters.push({
                suiteEnd: sinon.spy(),
                scopeEnd: sinon.spy(),
                testEnd: sinon.spy(),
            });
            let mochaSuite = {
                title: new testing.ScopeType("my"),
            };
            onSuiteEnd(mochaSuite);
            expect(reporters[0].suiteEnd).to.not.be.called;
            expect(reporters[0].scopeEnd).to.not.be.called;
            expect(reporters[0].testEnd).to.not.be.called;
        });
    });

    test("on test", () => {
        let onTest;

        beforeChunk(() => {
            onTest = methods["test"];
        });

        chunk("does nothing if no reporters are registered", () => {
            GlaceReporter.__set__("reporters", []);
            onTest();
        });

        chunk("does nothing if reporters don't have chunk method", () => {
            GlaceReporter.__set__("reporters", [{}]);
            onTest();
        });

        chunk("calls reporters' chunk method if it exists", () => {
            const reporters = [{ chunk: sinon.spy() }];
            GlaceReporter.__set__("reporters", reporters);
            onTest("mochaTest");
            expect(reporters[0].chunk).to.be.calledOnce;
            expect(reporters[0].chunk.args[0][0]).to.be.equal("mochaTest");
        });
    });

    test("on test end", () => {
        let onTestEnd;

        beforeChunk(() => {
            onTestEnd = methods["test end"];
        });

        chunk("does nothing if no reporters are registered", () => {
            GlaceReporter.__set__("reporters", []);
            onTestEnd();
        });

        chunk("does nothing if reporters don't have chunkEnd method", () => {
            GlaceReporter.__set__("reporters", [{}]);
            onTestEnd();
        });

        chunk("calls reporters' chunkEnd method if it exists", () => {
            const reporters = [{ chunkEnd: sinon.spy() }];
            GlaceReporter.__set__("reporters", reporters);
            onTestEnd("mochaTest");
            expect(reporters[0].chunkEnd).to.be.calledOnce;
            expect(reporters[0].chunkEnd.args[0][0]).to.be.equal("mochaTest");
        });
    });

    test("on hook", () => {
        let onHook;

        beforeChunk(() => {
            onHook = methods["hook"];
        });

        chunk("does nothing if no reporters are registered", () => {
            GlaceReporter.__set__("reporters", []);
            onHook();
        });

        chunk("does nothing if reporters don't have hook method", () => {
            GlaceReporter.__set__("reporters", [{}]);
            onHook();
        });

        chunk("calls reporters' hook method if it exists", () => {
            const reporters = [{ hook: sinon.spy() }];
            GlaceReporter.__set__("reporters", reporters);
            onHook("mochaHook");
            expect(reporters[0].hook).to.be.calledOnce;
            expect(reporters[0].hook.args[0][0]).to.be.equal("mochaHook");
        });
    });

    test("on hook end", () => {
        let onHookEnd;

        beforeChunk(() => {
            onHookEnd = methods["hook end"];
        });

        chunk("does nothing if no reporters are registered", () => {
            GlaceReporter.__set__("reporters", []);
            onHookEnd();
        });

        chunk("does nothing if reporters don't have hookEnd method", () => {
            GlaceReporter.__set__("reporters", [{}]);
            onHookEnd();
        });

        chunk("calls reporters' hookEnd method if it exists", () => {
            const reporters = [{ hookEnd: sinon.spy() }];
            GlaceReporter.__set__("reporters", reporters);
            onHookEnd("mochaHook");
            expect(reporters[0].hookEnd).to.be.calledOnce;
            expect(reporters[0].hookEnd.args[0][0]).to.be.equal("mochaHook");
        });
    });

    test("register()", () => {
        let reporters;

        beforeChunk(() => {
            reporters = [];
            GlaceReporter.__set__("reporters", reporters);
        });

        chunk("registers reporters if they aren't registered", () => {
            const reporter1 = new Object();
            const reporter2 = new Object();

            GlaceReporter.register(reporter1, reporter2);
            expect(reporters).to.be.eql([reporter1, reporter2]);
        });

        chunk("doesn't register reporter if it's already registered", () => {
            const reporter1 = new Object();
            const reporter2 = new Object();
            const reporter3 = new Object();

            GlaceReporter.register(reporter1, reporter2);
            GlaceReporter.register(reporter3, reporter2);
            expect(reporters).to.be.eql([reporter1, reporter2, reporter3]);
        });
    });

    test("remove()", () => {
        let reporters;

        beforeChunk(() => {
            reporters = [new Object(), new Object()];
            GlaceReporter.__set__("reporters", reporters);
        });

        chunk("removes reporter from reporters", () => {
            const reporter1 = reporters[0];
            GlaceReporter.remove(reporter1);
            reporters = GlaceReporter.__get__("reporters");
            expect(reporters).to.have.length(1);
            expect(reporters).to.not.include(reporter1);
        });

        chunk("does nothing if reporter isn't registered", () => {
            GlaceReporter.remove(new Object());
            expect(reporters).to.have.length(2);
        });
    });
});
