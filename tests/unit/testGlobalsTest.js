"use strict";

suite("globals/test", () => {
    let conf,
        sandbox = sinon.createSandbox(),
        test_ = rewire("../../lib/globals/test");

    before(() => {
        CONF.__testmode = true;
        conf = rewire("../../lib/config");
    });

    after(() => {
        CONF.__testmode = false;
    });

    beforeChunk(() => {
        test_.__set__("CONF", conf);
    });

    afterChunk(() => {
        sandbox.restore();
        test_.__reset__();
    });

    test("baseTest()", () => {
        let baseTest,
            testFunc;

        beforeChunk(() => {
            baseTest = test_.__get__("baseTest");
            testFunc = sinon.spy();
            test_.__set__("testFunc", testFunc);
            conf.filter = {};
            conf.test = { cases: [] };
        });

        chunk("registers test", () => {
            const test_cb = () => {};
            baseTest("my test", test_cb);
            expect(testFunc).to.be.calledOnce;
            expect(conf.test.cases).to.have.length(1);
            expect(conf.test.cases[0].name).to.be.equal("my test");
            const o = testFunc.args[0][0];
            expect(o.ctxs).to.not.exist;
            expect(o.func).to.be.equal(test_cb);
            expect(o.name).to.be.equal("my test");
            expect(o.fixtures).to.be.empty;
            expect(o.retries).to.be.equal(0);
            expect(o.testOpts.chunkRetry).to.be.equal(0);
            expect(o.testOpts.chunkTimeout).to.not.exist;
        });

        chunk("passes if test name is included in filter", () => {
            conf.filter.include = [{
                name: "my test",
                params: [{ lang: "ru" }],
            }];
            const test_cb = () => {};
            baseTest("my test", test_cb);
            expect(testFunc).to.be.calledOnce;
            const o = testFunc.args[0][0];
            expect(o.func).to.be.equal(test_cb);
            expect(o.name).to.be.equal("my test");
            expect(o.fixtures).to.be.empty;
            expect(o.retries).to.be.equal(0);
            expect(o.testOpts.chunkRetry).to.be.equal(0);
            expect(o.testOpts.chunkTimeout).to.not.exist;
        });

        chunk("breaks if test name is not included in filter", () => {
            conf.filter.include = [{
                name: "some test",
            }];
            baseTest("my test", () => {});
            expect(testFunc).to.not.be.called;
        });

        chunk("passes if test name is not excluded in filter", () => {
            conf.filter.exclude = [{
                name: "some test",
            }];
            const test_cb = () => {};
            baseTest("my test", test_cb);
            expect(testFunc).to.be.calledOnce;
            const o = testFunc.args[0][0];
            expect(o.ctxs).to.not.exist;
            expect(o.func).to.be.equal(test_cb);
            expect(o.name).to.be.equal("my test");
            expect(o.fixtures).to.be.empty;
            expect(o.retries).to.be.equal(0);
            expect(o.testOpts.chunkRetry).to.be.equal(0);
            expect(o.testOpts.chunkTimeout).to.not.exist;
        });

        chunk("breaks if test name is excluded in filter", () => {
            conf.filter.exclude = [{
                name: "my test",
            }];
            baseTest("my test", () => {});
            expect(testFunc).to.not.be.called;
        });

        chunk("passes if test name is uniq on check", () => {
            conf.test.checkNames = true;
            const test_cb = () => {};
            baseTest("first test", test_cb);
            baseTest("second test", test_cb);
            expect(testFunc).to.be.calledTwice;
            const o = testFunc.args[1][0];
            expect(o.ctxs).to.not.exist;
            expect(o.func).to.be.equal(test_cb);
            expect(o.name).to.be.equal("second test");
            expect(o.fixtures).to.be.empty;
            expect(o.retries).to.be.equal(0);
            expect(o.testOpts.chunkRetry).to.be.equal(0);
            expect(o.testOpts.chunkTimeout).to.not.exist;
        });

        chunk("breaks if test name is not uniq on check", () => {
            conf.test.checkNames = true;
            baseTest("uniq test", () => {});
            expect(() => baseTest("uniq test", () => {})).to.throw("is added already");
            expect(testFunc).to.be.calledOnce;
        });

        chunk("skips without reason", () => {
            baseTest("my test", { skip: true }, () => {});
            expect(testFunc).to.not.be.called;
            expect(conf.test.cases[0].status).to.be.equal("skipped");
            expect(conf.test.cases[0].rawInfo).to.be.empty;
        });

        chunk("skips with reason", () => {
            baseTest("my test", { skip: "some bug" }, () => {});
            expect(conf.test.cases[0].rawInfo[0]).to.be.equal("some bug");
        });

        chunk("reads retries from config", () => {
            conf.test.retries = 2;
            baseTest("my test", () => {});
            const o = testFunc.args[0][0];
            expect(o.retries).to.be.equal(2);
        });

        chunk("reads retries from options", () => {
            baseTest("my test", { retry: 1 }, () => {});
            const o = testFunc.args[0][0];
            expect(o.retries).to.be.equal(1);
        });

        chunk("reads chunk retries from config", () => {
            conf.test.chunkRetries = 2;
            baseTest("my test", () => {});
            const o = testFunc.args[0][0];
            expect(o.testOpts.chunkRetry).to.be.equal(2);
        });

        chunk("reads chunk retries from options", () => {
            baseTest("my test", { chunkRetry: 1 }, () => {});
            const o = testFunc.args[0][0];
            expect(o.testOpts.chunkRetry).to.be.equal(1);
        });

        chunk("reads chunk timeout from options", () => {
            baseTest("my test", { chunkTimeout: 100 }, () => {});
            const o = testFunc.args[0][0];
            expect(o.testOpts.chunkTimeout).to.be.equal(100);
        });

        chunk("have fixtures with undefined options", () => {
            baseTest("my test", undefined, ["fix1", "fix2"], () => {});
            const o = testFunc.args[0][0];
            expect(o.fixtures).to.be.eql(["fix1", "fix2"]);
        });

        chunk("have fixtures with null options", () => {
            baseTest("my test", null, ["fix1", "fix2"], () => {});
            const o = testFunc.args[0][0];
            expect(o.fixtures).to.be.eql(["fix1", "fix2"]);
        });
    });

    test("removeTestFromRetryQueue()", () => {
        let removeTestFromRetryQueue, retryTests;

        beforeChunk(() => {
            removeTestFromRetryQueue = test_.__get__("removeTestFromRetryQueue");

            retryTests = [];
            test_.__set__("retryTests", retryTests);
        });

        chunk("does nothing if no tests for retry", () => {
            removeTestFromRetryQueue();
            expect(retryTests).to.be.empty;
        });

        chunk("removes test from retry queue", () => {
            retryTests[0] = { args: { testCase: { name: "my test" }}};
            removeTestFromRetryQueue(retryTests[0].args.testCase);
            expect(retryTests).to.be.empty;
        });

        chunk("throws error if test is not found in retry queue", () => {
            retryTests[0] = { args: { testCase: { name: "my test" }}};
            removeTestFromRetryQueue({ name: "another test" });
            expect(retryTests).to.have.length(1);
        });
    });

    test("beforeCb()", () => {
        let beforeCb, o, setLog, removeTestFromRetryQueue;

        beforeChunk(() => {
            beforeCb = test_.__get__("beforeCb");
            setLog = sinon.spy();
            test_.__set__("setLog", setLog);

            removeTestFromRetryQueue = sinon.spy();
            test_.__set__("removeTestFromRetryQueue", removeTestFromRetryQueue);

            o = {};
            o.testCase = {
                hasFailedParams: sinon.stub().returns(true),
                reset: sinon.spy(),
                start: sinon.spy(),
                failedParams: "test failed params",
                name: "my test",
            };
        });

        chunk(() => {
            beforeCb(o)();
            expect(conf.test.curCase).to.be.equal(o.testCase);
            expect(o.testCase.reset).to.be.calledOnce;
            expect(o.testCase.start).to.be.calledOnce;
            expect(setLog).to.be.calledOnce;
            expect(removeTestFromRetryQueue).to.be.calledOnce;
            expect(removeTestFromRetryQueue.args[0][0]).to.be.equal(o.testCase);
        });
    });

    test("afterCb()", () => {
        let afterCb, retryTests, o;

        beforeChunk(() => {
            afterCb = test_.__get__("afterCb");
            retryTests = [];
            test_.__set__("retryTests", retryTests);
            o = {};
            o.testCase = {
                errors: ["err"],
                end: sinon.spy(),
                status: "failed",
                hasFailedParams: sinon.stub().returns(true),
                failedParams: "test failed params",
            };
            o.retries = 1;
        });

        chunk("ends as failed", () => {
            afterCb(o)();

            expect(o.testCase.end).to.be.calledOnce;
            expect(o.testCase.end.args[0][0]).to.be.equal("failed");
            expect(o.retries).to.be.equal(0);
            expect(retryTests).to.have.length(1);
        });

        chunk("ends as passed", () => {
            o.testCase.errors = [];
            o.testCase.status = "passed";
            afterCb(o)();

            expect(o.testCase.end).to.be.calledOnce;
            expect(o.testCase.end.args[0][0]).to.be.equal("passed");
            expect(o.retries).to.be.equal(1);
            expect(retryTests).to.have.length(0);
        });

        chunk("doesn't retry if retry attemps are exhausted", () => {
            o.retries = 0;
            afterCb(o)();

            expect(o.retries).to.be.equal(0);
            expect(retryTests).to.have.length(0);
        });

        chunk("ends as failed", () => {
            afterCb(o)();
            expect(retryTests).to.have.length(1);
        });
    });

    test("test()", () => {
        let test_func, baseTest, func;

        beforeChunk(() => {
            test_func = test_.__get__("test");
            baseTest = sinon.spy();
            test_.__set__("baseTest", baseTest);
            func = () => {};
        });

        chunk(() => {
            test_func("my test", func);
            expect(baseTest).to.be.calledOnce;
            expect(baseTest.args[0]).to.be.eql(["my test", {}, [], func]);
        });

        chunk("takes options", () => {
            test_func("my test", { a: 1 }, func);
            expect(baseTest.args[0]).to.be.eql(["my test", { a: 1 }, [], func]);
        });

        chunk("takes options and fixtures", () => {
            test_func("my test", { a: 1 }, ["fix"], func);
            expect(baseTest.args[0]).to.be.eql(["my test", { a: 1 }, ["fix"], func]);
        });

        chunk("takes undefined options", () => {
            test_func("my test", undefined, ["fix"], func);
            expect(baseTest.args[0]).to.be.eql(["my test", {}, ["fix"], func]);
        });

        chunk("takes null options", () => {
            test_func("my test", null, ["fix"], func);
            expect(baseTest.args[0]).to.be.eql(["my test", {}, ["fix"], func]);
        });
    });

    test("isFilterMatched()", () => {
        let isFilterMatched;

        beforeChunk(() => {
            isFilterMatched = test_.__get__("isFilterMatched");
            conf.filter = { precise: false };
        });

        chunk("returns true if test names are equal", () => {
            conf.filter.precise = true;
            expect(isFilterMatched("my test", "MY TEST")).to.be.true;
        });

        chunk("returns false if test names aren't equal", () => {
            conf.filter.precise = true;
            expect(isFilterMatched("my tes", "MY TEST")).to.be.false;
        });

        chunk("returns true if filter includes test name", () => {
            expect(isFilterMatched("my test", "MY TES")).to.be.true;
        });

        chunk("returns true if filter doesn't include test name", () => {
            expect(isFilterMatched("my test", "MY TST")).to.be.false;
        });
    });
});
