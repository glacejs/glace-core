"use strict";

const allureReporter = rewire("../../lib/reporter/allure");

suite("reporter/allure", () => {
    let allure;

    beforeChunk(() => {
        allure = {};
        allureReporter.__set__("allure", allure);
    });

    afterChunk(() => {
        allureReporter.__reset__();
    });

    test("start()", () => {

        beforeChunk(() => {
            allure.startSuite = sinon.stub();
        });

        chunk(() => {
            allureReporter.start();
            expect(allure.startSuite).to.be.calledOnce;
            expect(allure.startSuite.args[0][0]).to.be.equal(CONF.allure.suiteName);
        });
    });

    test("end()", () => {
        let reportSkippedTests, console_, conf;

        beforeChunk(() => {
            allure.endSuite = sinon.stub();

            reportSkippedTests = sinon.stub();
            allureReporter.__set__("reportSkippedTests", reportSkippedTests);

            console_ = {
                log: sinon.stub(),
            };
            allureReporter.__set__("console", console_);

            conf = {
                allure: {
                    dir: "/path/to/allure",
                },
            };
            allureReporter.__set__("CONF", conf);
        });

        chunk(() => {
            allureReporter.end();

            expect(reportSkippedTests).to.be.calledOnce;
            expect(allure.endSuite).to.be.calledOnce;
            expect(console_.log).to.be.calledThrice;
            expect(console_.log.args[2][0]).to.include(`Allure report is ${conf.allure.dir}`);
        });
    });

    test("suite()", () => {

        beforeChunk(() => {
            allure.startSuite = sinon.stub();
        });

        chunk(() => {
            allureReporter.suite({ title: "my suite" });
            expect(allure.startSuite).to.be.calledOnce;
            expect(allure.startSuite.args[0][0]).to.be.equal("my suite");
        });
    });

    test("suiteEnd()", () => {

        beforeChunk(() => {
            allure.endSuite = sinon.stub();
        });

        chunk(() => {
            allureReporter.suiteEnd();
            expect(allure.endSuite).to.be.calledOnce;
        });
    });

    test("scope()", () => {

        beforeChunk(() => {
            allure.startStep = sinon.spy();
            allure.isTestStarted = sinon.stub().returns(false);

            const curStep = {};
            allure.getCurrentSuite = sinon.stub().returns({ currentStep: curStep });
        });

        chunk("does nothing if test isn't started", () => {
            allureReporter.scope({ title: "my scope" });
            expect(allure.startStep).to.not.be.called;
        });

        chunk("starts allure step inside a test", () => {
            allure.isTestStarted.returns(true);
            allureReporter.scope({ title: "my scope" });
            expect(allure.startStep).to.be.calledOnce;
            expect(allure.startStep.args[0][0]).to.be.equal("my scope");
            expect(allure.getCurrentSuite().currentStep.isScope).to.be.true;
        });
    });

    test("scopeEnd()", () => {

        beforeChunk(() => {
            allure.endStep = sinon.stub();
            allure.isTestStarted = sinon.stub().returns(true);
        });

        chunk("does nothing if test isn't started", () => {
            allure.isTestStarted.returns(false);
            allureReporter.scopeEnd();
            expect(allure.endStep).to.not.be.called;
        });

        chunk("ends allure step inside a test", () => {
            allureReporter.scopeEnd();
            expect(allure.endStep).to.be.calledOnce;
        });
    });

    test("test()", () => {

        beforeChunk(() => {
            allure.startCase = sinon.stub();
        });

        chunk(() => {
            allureReporter.test({ title: "my test" });
            expect(allure.startCase).to.be.calledOnce;
            expect(allure.startCase.args[0][0]).to.be.equal("my test");
        });
    });

    test("testEnd()", () => {
        let conf;

        beforeChunk(() => {
            allure.endCase = sinon.stub();
            allure.PASSED = "passed";
            allure.FAILED = "failed";

            allureReporter.__set__("getErrors", sinon.stub().returns("errors"));

            conf = {
                test: {
                    curCase: {
                        name: "my test",
                        status: "passed",
                    },
                },
            };
            allureReporter.__set__("CONF", conf);
        });

        chunk("ends passed test", () => {
            allureReporter.testEnd();

            expect(allure.endCase).to.be.calledOnce;
            expect(allure.endCase.args[0][0]).to.be.equal("passed");
        });

        chunk("ends failed test", () => {
            conf.test.curCase.status = "failed";
            allureReporter.testEnd();

            expect(allure.endCase).to.be.calledOnce;
            expect(allure.endCase.args[0][0]).to.be.equal("failed");
            expect(allure.endCase.args[0][1]).to.be.equal("errors");
        });
    });

    test("chunk()", () => {

        beforeChunk(() => {
            allure.startStep = sinon.stub();
        });

        chunk(() => {
            allureReporter.chunk({ title: "my chunk" });
            expect(allure.startStep).to.be.calledOnce;
            expect(allure.startStep.args[0][0]).to.be.equal("my chunk");
        });
    });

    test("skip()", () => {

        beforeChunk(() => {
            allure.endStep = sinon.stub();
            allure.SKIPPED = "skipped";

            const allureNotScope = sinon.stub().returns(true);
            allureNotScope.onCall(1).returns(false);
            allureReporter.__set__("allureNotScope", allureNotScope);
        });

        chunk(() => {
            allureReporter.skip();
            expect(allure.endStep).to.be.calledOnce;
            expect(allure.endStep.args[0][0]).to.be.equal(allure.SKIPPED);
        });
    });

    test("pass()", () => {

        beforeChunk(() => {
            allure.endStep = sinon.stub();
            allure.PASSED = "passed";

            const allureNotScope = sinon.stub().returns(true);
            allureNotScope.onCall(1).returns(false);
            allureReporter.__set__("allureNotScope", allureNotScope);
        });

        chunk(() => {
            allureReporter.pass();
            expect(allure.endStep).to.be.calledOnce;
            expect(allure.endStep.args[0][0]).to.be.equal(allure.PASSED);
        });
    });

    test("fail()", () => {

        beforeChunk(() => {
            allure.endStep = sinon.stub();
            allure.FAILED = "failed";

            const allureNotScope = sinon.stub().returns(true);
            allureNotScope.onCall(1).returns(false);
            allureReporter.__set__("allureNotScope", allureNotScope);
        });

        chunk(() => {
            allureReporter.fail();
            expect(allure.endStep).to.be.calledOnce;
            expect(allure.endStep.args[0][0]).to.be.equal(allure.FAILED);
        });
    });

    test("allureNotScope()", () => {
        let allureNotScope;

        beforeChunk(() => {
            allureNotScope = allureReporter.__get__("allureNotScope");

            allure.hasSteps = sinon.stub().returns(true);
            allure.getCurrentSuite = sinon.stub().returns({ currentStep: { isScope: false }});
        });

        chunk("returns true if allure has steps and is not scope level", () => {
            expect(allureNotScope()).to.be.true;
        });

        chunk("returns false if allure has no steps", () => {
            allure.hasSteps.returns(false);
            expect(allureNotScope()).to.be.false;
        });

        chunk("return false if allure is on scope level", () => {
            allure.getCurrentSuite.returns({ currentStep: { isScope: true }});
            expect(allureNotScope()).to.be.false;
        });
    });

    test("getErrors()", () => {
        let getErrors;

        beforeChunk(() => {
            getErrors = allureReporter.__get__("getErrors");
        });
        
        chunk("processes errors without message", () => {
            const testCase = {
                errors: [
                    "My error stack",
                ],
            };
            const result = getErrors(testCase);
            expect(result.message).to.include("Show details");
            expect(result.stack).to.include("My error stack");
        });

        chunk("processes one named error", () => {
            const testCase = {
                errors: [
                    "message: My fail\nMy error stack",
                ],
            };
            const result = getErrors(testCase);
            expect(result.message).to.include("My fail");
            expect(result.stack).to.include("My error stack");
        });

        chunk("processes names errors", () => {
            const testCase = {
                errors: [
                    "message: My fail\nMy error stack",
                    "message: Another fail\nAnother error stack",
                ],
            };
            const result = getErrors(testCase);
            expect(result.message).to.include("1. My fail");
            expect(result.message).to.include("2. Another fail");
            expect(result.stack).to.include("My error stack");
            expect(result.stack).to.include("Another error stack");
        });
    });

    test("reportSkippedTests()", () => {
        let conf, reportSkippedTests;

        beforeChunk(() => {
            reportSkippedTests = allureReporter.__get__("reportSkippedTests");

            allure.startCase = sinon.stub();
            allure.endCase = sinon.stub();
            allure.SKIPPED = "skipped";

            conf = {
                test: {
                    cases: [
                        {
                            name: "my test",
                            status: "skipped",
                            rawInfo: ["due to bug"],
                        },
                    ],
                },
            };
            allureReporter.__set__("CONF", conf);
        });

        chunk("skip with message", () => {
            reportSkippedTests();

            expect(allure.startCase).to.be.calledOnce;
            expect(allure.startCase.args[0][0]).to.be.equal(conf.test.cases[0].name);

            expect(allure.endCase).to.be.calledOnce;
            expect(allure.endCase.args[0][0]).to.be.equal("skipped");
            expect(allure.endCase.args[0][1]).to.be.eql({ message: conf.test.cases[0].rawInfo[0] });
        });

        chunk("skip without message", () => {
            conf.test.cases[0].rawInfo = [];
            reportSkippedTests();

            expect(allure.startCase).to.be.calledOnce;
            expect(allure.startCase.args[0][0]).to.be.equal(conf.test.cases[0].name);

            expect(allure.endCase).to.be.calledOnce;
            expect(allure.endCase.args[0][0]).to.be.equal("skipped");
            expect(allure.endCase.args[0]).to.have.length(1);
        });
    });
});
