"use strict";

const GlaceReporter = rewire("../../lib/reporter/base");
const testing = rewire("../../lib/testing");

const methods = {};
const runner = {
    on: (name, cb) => methods[name] = cb,
};

suite("reporter/base", () => {
    let glaceReporter;
    const sandbox = sinon.createSandbox();

    before(() => {
        GlaceReporter.__set__("MochaReporter", function () {});
        glaceReporter = new GlaceReporter(runner);
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
        let onEnd, conf, reporters, fs, saveFailedTests;

        beforeChunk(() => {
            onEnd = methods["end"];

            reporters = [];
            GlaceReporter.__set__("reporters", reporters);

            fs = {
                existsSync: sinon.stub().returns(false),
            };
            GlaceReporter.__set__("fs", fs);

            saveFailedTests = sinon.stub();
            GlaceReporter.__set__("saveFailedTests", saveFailedTests);

            conf = {
                test: {
                    cases: [],
                },
                session: {
                    errors: [],
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
            expect(saveFailedTests).to.be.calledOnce;
            expect(conf.session.isPassed).to.be.false;
        });

        chunk("tests session is failed if there are session errors", () => {
            conf.test.cases.push({ status: testing.TestCase.PASSED });
            conf.session.errors = ["session error"];
            onEnd();
            expect(conf.session.isPassed).to.be.false;
        });

        chunk("test session is passed if no failed tests and no session errors", () => {
            conf.test.cases.push({ status: testing.TestCase.PASSED });
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
        let onSuiteEnd, reporters, conf, setLog;

        beforeChunk(() => {
            onSuiteEnd = methods["suite end"];
            reporters = [];
            GlaceReporter.__set__("reporters", reporters);

            conf = {
                test: {
                    curCase: { name: "my test" },
                },
                report: {
                    testDir: null,
                }
            };
            GlaceReporter.__set__("CONF", conf);

            setLog = sinon.stub();
            GlaceReporter.__set__("utils", { setLog });
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

    test("on pass", () => {
        let onPass, reporters, passChunkId, handleSkipState;

        beforeChunk(() => {
            onPass = methods["pass"];

            reporters = [];
            GlaceReporter.__set__("reporters", reporters);

            passChunkId = sinon.spy();
            GlaceReporter.__set__("passChunkId", passChunkId);

            handleSkipState = sinon.spy();
            GlaceReporter.__set__("handleSkipState", handleSkipState);
        });

        chunk("calls reporters 'pass' method if it exists", () => {
            reporters.push({ pass: sinon.spy() });
            onPass({ state: "passed" });

            expect(passChunkId).to.be.calledOnce;
            expect(handleSkipState).to.be.calledOnce;
            expect(handleSkipState.args[0][0]).to.be.eql({ state: "passed" });

            expect(reporters[0].pass).to.be.calledOnce;
            expect(reporters[0].pass.args[0][0]).to.be.eql({ state: "passed" });
        });

        chunk("calls reporters 'skip' method if it exists", () => {
            reporters.push({ skip: sinon.spy() });
            onPass({ state: "skipped" });

            expect(passChunkId).to.be.calledOnce;
            expect(handleSkipState).to.be.calledOnce;
            expect(handleSkipState.args[0][0]).to.be.eql({ state: "skipped" });

            expect(reporters[0].skip).to.be.calledOnce;
            expect(reporters[0].skip.args[0][0]).to.be.eql({ state: "skipped" });
        });
    });

    test("on fail", () => {
        let onFail, reporters, accountError, conf;

        beforeChunk(() => {
            onFail = methods["fail"];

            reporters = [];
            GlaceReporter.__set__("reporters", reporters);

            conf = {
                session: {
                },
            };
            GlaceReporter.__set__("CONF", conf);

            accountError = sinon.spy();
            GlaceReporter.__set__("utils", { accountError });
        });

        afterChunk(() => {
            delete runner.emit;
        });

        chunk("calls reporters 'fail' method if it exists", () => {
            reporters.push({ fail: sinon.spy() });
            onFail({ title: "my chunk" }, "error");

            expect(accountError).to.be.calledOnce;
            expect(accountError.args[0][0]).to.be.equal("my chunk");
            expect(accountError.args[0][1]).to.be.equal("error");

            expect(reporters[0].fail).to.be.calledOnce;
            expect(reporters[0].fail.args[0][0]).to.be.eql({ title: "my chunk" });
            expect(reporters[0].fail.args[0][1]).to.be.equal("error");
        });

        chunk("fails session immediately if flag is set", () => {
            conf.session.exitOnFail = true;
            conf.test = {
                curCase: {
                    end: sinon.spy(),
                },
            };

            runner.emit = sinon.spy();

            onFail({ title: "my chunk" }, "error");

            expect(conf.test.curCase.end).to.be.calledOnce;
            expect(conf.test.curCase.end.args[0][0]).to.be.equal("failed");

            expect(runner.emit).to.be.calledOnce;
            expect(runner.emit.args[0][0]).to.be.equal("end");
        });
    });

    test("on pending", () => {
        let onPending;

        beforeChunk(() => {
            onPending = methods["pending"];
        });

        chunk("does nothing if no reporters are registered", () => {
            GlaceReporter.__set__("reporters", []);
            onPending();
        });

        chunk("does nothing if reporters don't have 'pending' method", () => {
            GlaceReporter.__set__("reporters", [{}]);
            onPending();
        });

        chunk("calls reporters' 'pending' method if it exists", () => {
            const reporters = [{ pending: sinon.spy() }];
            GlaceReporter.__set__("reporters", reporters);
            onPending("mochaTest");
            expect(reporters[0].pending).to.be.calledOnce;
            expect(reporters[0].pending.args[0][0]).to.be.equal("mochaTest");
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

    test(".done()", () => {
        let reporters, failures, fn, log;

        beforeChunk(() => {
            failures = "dummy";
            fn = sinon.spy();

            reporters = [{
                done: sinon.stub(),
            }];
            GlaceReporter.__set__("reporters", reporters);

            log = {
                error: sinon.stub(),
            };
            GlaceReporter.__set__("LOG", log);
        });

        chunk("finalizes reporters", async () => {
            await glaceReporter.done(failures, fn);

            expect(fn).to.be.calledOnce;
            expect(fn.args[0][0]).to.be.equal(failures);

            expect(reporters[0].done).to.be.calledOnce;
            expect(log.error).to.not.be.called;
        });

        chunk("captures reporter errors", async () => {
            reporters[0].done.throws(Error("BOOM!"));

            await glaceReporter.done(failures, fn);

            expect(fn).to.be.calledOnce;
            expect(fn.args[0][0]).to.be.equal(failures);

            expect(reporters[0].done).to.be.calledOnce;
            expect(log.error).to.be.calledOnce;
            expect(log.error.args[0][0].toString()).to.include("BOOM!");
        });
    });

    test("passChunkId()", () => {
        let passChunkId, conf;

        beforeChunk(() => {
            passChunkId = GlaceReporter.__get__("passChunkId");

            conf = {
                chunk: {
                    passedIds: [],
                },
            };
            GlaceReporter.__set__("CONF", conf);
        });

        chunk("does nothing if no chunk id", () => {
            passChunkId();
            expect(conf.chunk.passedIds).to.be.empty;
        });

        chunk("does nothing if chunk id is marked as passed already", () => {
            conf.chunk.curId = 1;
            conf.chunk.passedIds.push(1);
            passChunkId();
            expect(conf.chunk.passedIds).to.have.length(1);
        });

        chunk("marks chunk id as passed if it is not yet before", () => {
            conf.chunk.curId = 1;
            conf.test = {
                curCase: {
                    addPassedChunkId: sinon.spy(),
                },
            };

            passChunkId();

            expect(conf.chunk.passedIds).to.be.eql([1]);
            expect(conf.chunk.curId).to.be.null;
            expect(conf.test.curCase.addPassedChunkId).to.be.calledOnce;
            expect(conf.test.curCase.addPassedChunkId.args[0][0]).to.be.equal(1);
        });
    });

    test("handleSkipState()", () => {
        let handleSkipState, mochaTest, conf;

        beforeChunk(() => {
            mochaTest = { title: "My chunk" };

            handleSkipState = GlaceReporter.__get__("handleSkipState");

            conf = {
                test: {
                },
            };
            GlaceReporter.__set__("CONF", conf);
        });

        chunk("does nothing if no test case", () => {
            handleSkipState(mochaTest);
            expect(mochaTest.state).to.be.undefined;
        });

        chunk("does nothing if chunk should not be skipped", () => {
            conf.test.curCase = {};
            handleSkipState(mochaTest);
            expect(mochaTest.state).to.be.undefined;
        });

        chunk("marks mocha test as skipped if chunk should be skipped", () => {
            conf.test.curCase = { skipChunk: "My chunk" };
            handleSkipState(mochaTest);
            expect(mochaTest.state).to.be.equal("skipped");
            expect(conf.test.curCase.skipChunk).to.be.null;
        });
    });

    test("saveFailedTests()", () => {
        let saveFailedTests, fs, log, conf;

        beforeChunk(() => {
            saveFailedTests = GlaceReporter.__get__("saveFailedTests");

            fs = {
                unlinkSync: sinon.stub(),
                existsSync: sinon.stub(),
                writeFileSync: sinon.stub(),
            };
            GlaceReporter.__set__("fs", fs);

            log = {
                error: sinon.stub(),
            };
            GlaceReporter.__set__("LOG", log);

            conf = {};
            GlaceReporter.__set__("CONF", conf);
            conf.report = { failedTestsPath: "/path/to/failed/tests" };
        });

        chunk("saves failed tests info to file", () => {
            fs.existsSync.returns(false);
            saveFailedTests([{ id: 1, passedChunkIds: [1] }]);
            expect(fs.unlinkSync).to.not.be.called;
            expect(log.error).to.not.be.called;
            expect(fs.writeFileSync).to.be.calledOnce;
            expect(fs.writeFileSync.args[0][0]).to.be.equal("/path/to/failed/tests");
            expect(fs.writeFileSync.args[0][1])
                .to.be.equal(JSON.stringify([{ id:1, passed_chunk_ids: [1] }], null, "  "));
        });

        chunk("removes previous file with failed tests", () => {
            fs.existsSync.returns(true);
            saveFailedTests([]);
            expect(fs.unlinkSync).to.be.calledOnce;
            expect(fs.unlinkSync.args[0][0]).to.be.equal("/path/to/failed/tests");
        });

        chunk("logs & exits if can't remove previous file with failed tests", () => {
            fs.existsSync.returns(true);
            fs.unlinkSync.throws(Error("BOOM!"));
            saveFailedTests([]);
            expect(log.error).to.be.calledOnce;
            expect(log.error.args[0][0]).to.be.startWith("Can't remove file '/path/to/failed/tests'");
            expect(log.error.args[0][0]).to.include("BOOM!");
        });

        chunk("logs if can't save failed tests to file", () => {
            fs.existsSync.returns(false);
            fs.writeFileSync.throws(Error("BOOM!"));
            saveFailedTests([]);
            expect(log.error).to.be.calledOnce;
            expect(log.error.args[0][0]).to.be.startWith("Can't write file '/path/to/failed/tests'");
            expect(log.error.args[0][0]).to.include("BOOM!");
        });
    });
});
