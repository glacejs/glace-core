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

    test("_test()", () => {
        let _test,
            testFunc;

        beforeChunk(() => {
            _test = test_.__get__("_test");
            testFunc = sinon.spy();
            test_.__set__("testFunc", testFunc);
            conf.filter = {};
            conf.chunk = {};
            conf.test = { id: 0, cases: [] };
            conf.retry = { id: 0, chunkIds: {} };
        });

        chunk("registers test", () => {
            const test_cb = () => {};
            _test("my test", [], {}, test_cb);
            expect(testFunc).to.be.calledOnce;
            expect(conf.test.id).to.be.equal(1);
            expect(conf.test.cases).to.have.length(1);
            expect(conf.test.cases[0].name).to.be.equal("my test");
            expect(conf.retry.chunkIds).to.be.eql({ 0: [] });
            expect(conf.retry.curChunkIds).to.be.eql([]);
            const o = testFunc.args[0][0];
            expect(o.func).to.be.equal(test_cb);
            expect(o.fixtures).to.be.empty;
            expect(o.opts.chunkRetry).to.be.equal(0);
            expect(o.opts.chunkTimeout).to.not.exist;
        });

        chunk("passes if test name is included in filter", () => {
            conf.filter.include = [{
                id: "my test",
                params: [{ lang: "ru" }],
            }];
            const test_cb = () => {};
            _test("my test", [], {}, test_cb);
            expect(testFunc).to.be.calledOnce;
            const o = testFunc.args[0][0];
            expect(o.func).to.be.equal(test_cb);
            expect(o.fixtures).to.be.empty;
            expect(o.opts.chunkRetry).to.be.equal(0);
            expect(o.opts.chunkTimeout).to.not.exist;
        });

        chunk("breaks if test name is not included in filter", () => {
            conf.filter.include = [{
                id: "some test",
            }];
            _test("my test", [], {}, () => {});
            expect(testFunc).to.not.be.called;
        });

        chunk("passes if test name is not excluded in filter", () => {
            conf.filter.exclude = [{
                id: "some test",
            }];
            const test_cb = () => {};
            _test("my test", [], {}, test_cb);
            expect(testFunc).to.be.calledOnce;
            const o = testFunc.args[0][0];
            expect(o.ctxs).to.not.exist;
            expect(o.func).to.be.equal(test_cb);
            expect(o.fixtures).to.be.empty;
            expect(o.opts.chunkRetry).to.be.equal(0);
            expect(o.opts.chunkTimeout).to.not.exist;
        });

        chunk("breaks if test name is excluded in filter", () => {
            conf.filter.exclude = [{
                id: "my test",
            }];
            _test("my test", [], {}, () => {});
            expect(testFunc).to.not.be.called;
        });

        chunk("passes if test name is uniq on check", () => {
            conf.test.checkNames = true;
            const test_cb = () => {};
            _test("first test", [], {}, test_cb);
            _test("second test", [], {}, test_cb);
            expect(testFunc).to.be.calledTwice;
            const o = testFunc.args[1][0];
            expect(o.ctxs).to.not.exist;
            expect(o.func).to.be.equal(test_cb);
            expect(o.fixtures).to.be.empty;
            expect(o.opts.chunkRetry).to.be.equal(0);
            expect(o.opts.chunkTimeout).to.not.exist;
        });

        chunk("breaks if test name is not uniq on check", () => {
            conf.test.checkNames = true;
            _test("uniq test", [], {}, () => {});
            expect(() => _test("uniq test", () => {})).to.throw("is added already");
            expect(testFunc).to.be.calledOnce;
        });

        chunk("skips without reason", () => {
            _test("my test", [], { skip: true }, () => {});
            expect(testFunc).to.not.be.called;
            expect(conf.test.cases[0].status).to.be.equal("skipped");
            expect(conf.test.cases[0].rawInfo).to.be.empty;
        });

        chunk("skips with reason", () => {
            _test("my test", [], { skip: "some bug" }, () => {});
            expect(conf.test.cases[0].rawInfo[0]).to.be.equal("some bug");
        });

        chunk("reads retries from config", () => {
            conf.test.retries = 2;
            _test("my test", [], {}, () => {});
            expect(conf.retry.chunkIds).to.be.eql({ 2: [] });
        });

        chunk("reads retries from options", () => {
            _test("my test", [], { retry: 1 }, () => {});
            expect(conf.retry.chunkIds).to.be.eql({ 1: [] });
        });

        chunk("reads chunk retries from config", () => {
            conf.chunk.retries = 2;
            _test("my test", [], {}, () => {});
            const o = testFunc.args[0][0];
            expect(o.opts.chunkRetry).to.be.equal(2);
        });

        chunk("reads chunk retries from options", () => {
            _test("my test", [], { chunkRetry: 1 }, () => {});
            const o = testFunc.args[0][0];
            expect(o.opts.chunkRetry).to.be.equal(1);
        });

        chunk("reads chunk timeout from options", () => {
            _test("my test", [], { chunkTimeout: 100 }, () => {});
            const o = testFunc.args[0][0];
            expect(o.opts.chunkTimeout).to.be.equal(100);
        });

        chunk("have fixtures with undefined options", () => {
            _test("my test", ["fix1", "fix2"], {}, () => {});
            const o = testFunc.args[0][0];
            expect(o.fixtures).to.be.eql(["fix1", "fix2"]);
        });

        chunk("have fixtures with null options", () => {
            _test("my test", ["fix1", "fix2"], {}, () => {});
            const o = testFunc.args[0][0];
            expect(o.fixtures).to.be.eql(["fix1", "fix2"]);
        });

        chunk("find test by id on retry", () => {
            conf.retry.id = 1;
            conf.test.cases = [{ id: 1, name: "my test" }];
            _test("my test", [], {}, () => {});
            const o = testFunc.args[0][0];
            expect(o.testCase).to.be.eql({ id: 1, name: "my test" });
        });

        chunk("omitted if test id isn't matched", () => {
            conf.test.id = 1;
            conf.filter.testIds = [1];
            _test("my test", [], {}, () => {});
            expect(conf.test.cases).to.be.empty;
        });
    });

    test("beforeCb()", () => {
        let beforeCb, o, setLog;

        beforeChunk(() => {
            beforeCb = test_.__get__("beforeCb");
            setLog = sinon.spy();
            test_.__set__("setLog", setLog);

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
            beforeCb(o.testCase)({})();
            expect(conf.test.curCase).to.be.equal(o.testCase);
            expect(o.testCase.reset).to.be.calledOnce;
            expect(o.testCase.start).to.be.calledOnce;
            expect(setLog).to.be.calledOnce;
        });
    });

    test("afterCb()", () => {
        let afterCb, o;

        beforeChunk(() => {
            afterCb = test_.__get__("afterCb");
            o = {};
            o.testCase = {
                errors: ["err"],
                end: sinon.spy(),
                status: "failed",
                hasFailedParams: sinon.stub().returns(true),
                failedParams: "test failed params",
            };
        });

        chunk("ends as failed", () => {
            afterCb(o)();
            expect(o.testCase.end).to.be.calledOnce;
            expect(o.testCase.end.args[0][0]).to.be.equal("failed");
        });

        chunk("ends as passed", () => {
            o.testCase.errors = [];
            o.testCase.status = "passed";
            afterCb(o)();
            expect(o.testCase.end).to.be.calledOnce;
            expect(o.testCase.end.args[0][0]).to.be.equal("passed");
        });
    });

    test("test()", () => {
        let _test;

        beforeChunk(() => {
            _test = sinon.spy();
            test_.__set__("_test", _test);
        });

        chunk("with name & callback", () => {
            const cb = () => {};
            test_("my test", cb);

            expect(_test).to.be.calledOnce;
            expect(_test.args[0][0]).to.be.equal("my test");
            expect(_test.args[0][1]).to.be.eql([]);
            expect(_test.args[0][2]).to.be.eql({});
            expect(_test.args[0][3]).to.be.equal(cb);
        });

        chunk("with name, fixtures & callback", () => {
            const cb = () => {};
            test_("my test", ["my fixture"], cb);

            expect(_test).to.be.calledOnce;
            expect(_test.args[0][0]).to.be.equal("my test");
            expect(_test.args[0][1]).to.be.eql(["my fixture"]);
            expect(_test.args[0][2]).to.be.eql({});
            expect(_test.args[0][3]).to.be.equal(cb);
        });

        chunk("with name, options & callback", () => {
            const cb = () => {};
            test_("my test", { retry: 1 }, cb);

            expect(_test).to.be.calledOnce;
            expect(_test.args[0][0]).to.be.equal("my test");
            expect(_test.args[0][1]).to.be.eql([]);
            expect(_test.args[0][2]).to.be.eql({ retry: 1 });
            expect(_test.args[0][3]).to.be.equal(cb);
        });

        chunk("with name, fixtures, options & callback", () => {
            const cb = () => {};
            test_("my test", ["my fixture"], { retry: 1 }, cb);

            expect(_test).to.be.calledOnce;
            expect(_test.args[0][0]).to.be.equal("my test");
            expect(_test.args[0][1]).to.be.eql(["my fixture"]);
            expect(_test.args[0][2]).to.be.eql({ retry: 1 });
            expect(_test.args[0][3]).to.be.equal(cb);
        });
    });

    test("isFilterMatched()", () => {
        let isFilterMatched;

        beforeChunk(() => {
            isFilterMatched = test_.__get__("isFilterMatched");
            conf.filter = { precise: false };
        });

        chunk("returns true if test id is matched", () => {
            conf.test.id = 1;
            expect(isFilterMatched("my test", 1)).to.be.true;
        });

        chunk("returns false if test id is matched", () => {
            conf.test.id = 2;
            expect(isFilterMatched("my test", 1)).to.be.false;
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

    test("initTestFixture()", () => {
        let initTestFixture, u;

        beforeChunk(() => {
            initTestFixture = test_.__get__("initTestFixture");

            u = {
                makeFixture: sinon.stub(),
            };
            test_.__set__("U", u);

            test_.__set__("beforeCb", o => o);
            test_.__set__("afterCb", "after");
        });

        chunk("makes test fixture", () => {
            initTestFixture("testcase");
            expect(u.makeFixture).to.be.calledOnce;
            expect(u.makeFixture.args[0][0])
                .to.be.eql({ before: "testcase", after: "after" });
        });
    });
});
