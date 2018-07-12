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

    test("setLog()", () => {
        let log,
            setLog;

        beforeChunk(() => {
            log = test_.__get__("LOG");
            sandbox.stub(log, "setFile");
            setLog = test_.__get__("setLog");
            conf.report = { logsDir: "/path/to/report" };
        });

        chunk("record logs to test dir", () => {
            conf.test = { curCase: { name: "my-test" }};
            setLog();
            expect(log.setFile).to.be.calledOnce;
            expect(log.setFile.args[0][0]).to.be.equal("/path/to/report/my-test/logs/test.log");
        });

        chunk("record logs to common dir", () => {
            conf.test = {};
            setLog();
            expect(log.setFile).to.be.calledOnce;
            expect(log.setFile.args[0][0]).to.be.equal("/path/to/report/logs/test.log");
        });
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
            expect(o.ctxs).to.be.eql([{ lang: "ru" }]);
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
        });

        chunk("skips with reason", () => {
            baseTest("my test", { skip: true, skipReason: "some bug" }, () => {});
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
});
