"use strict";

const sess = rewire("../../lib/globals/session");

suite("globals/session", () => {
    let conf;

    beforeChunk(() => {
        conf = {
            session: {
                name: "my session",
            },
        };
        sess.__set__("CONF", conf);

        sess.__set__("sessNum", 0);
    });

    afterChunk(() => {
        sess.__reset__();
    });

    test("session()", () => {
        let suite_, sessCb;

        beforeChunk(() => {
            suite_ = sinon.stub();
            sess.__set__("suite", suite_);
            
            sessCb = sinon.stub().returns("sessCb");
            sess.__set__("sessCb", sessCb);
        });

        chunk("with callback only", () => {
            const cb = () => {};
            sess.session(cb);

            expect(sess.__get__("sessNum")).to.be.equal(1);
            expect(conf.session.errors).to.be.empty;

            expect(suite_).to.be.calledOnce;
            expect(suite_.args[0][0]).to.be.equal("my session");
            expect(suite_.args[0][1]).to.be.equal("sessCb");

            expect(sessCb).to.be.calledOnce;
            expect(sessCb.args[0][0]).to.be.eql([]);
            expect(sessCb.args[0][1]).to.be.equal(cb);
        });

        chunk("with name & callback", () => {
            const cb = () => {};
            sess.session("custom session", cb);

            expect(sess.__get__("sessNum")).to.be.equal(1);
            expect(conf.session.errors).to.be.empty;

            expect(suite_).to.be.calledOnce;
            expect(suite_.args[0][0]).to.be.equal("custom session");
            expect(suite_.args[0][1]).to.be.equal("sessCb");

            expect(sessCb).to.be.calledOnce;
            expect(sessCb.args[0][0]).to.be.eql([]);
            expect(sessCb.args[0][1]).to.be.equal(cb);
        });

        chunk("with fixtures & callback", () => {
            const cb = () => {};
            sess.session(null, ["my fixture"], cb);

            expect(sess.__get__("sessNum")).to.be.equal(1);
            expect(conf.session.errors).to.be.empty;

            expect(suite_).to.be.calledOnce;
            expect(suite_.args[0][0]).to.be.equal("my session");
            expect(suite_.args[0][1]).to.be.equal("sessCb");

            expect(sessCb).to.be.calledOnce;
            expect(sessCb.args[0][0]).to.be.eql(["my fixture"]);
            expect(sessCb.args[0][1]).to.be.equal(cb);
        });

        chunk("with name, fixtures & callback", () => {
            const cb = () => {};
            sess.session("custom session", ["my fixture"], cb);

            expect(sess.__get__("sessNum")).to.be.equal(1);
            expect(conf.session.errors).to.be.empty;

            expect(suite_).to.be.calledOnce;
            expect(suite_.args[0][0]).to.be.equal("custom session");
            expect(suite_.args[0][1]).to.be.equal("sessCb");

            expect(sessCb).to.be.calledOnce;
            expect(sessCb.args[0][0]).to.be.eql(["my fixture"]);
            expect(sessCb.args[0][1]).to.be.equal(cb);
        });
    });

    test("sessCb()", () => {
        let sessCb, after_, u;

        beforeChunk(() => {
            sessCb = sess.__get__("sessCb");

            after_ = sinon.stub();
            sess.__set__("after", after_);

            u = {
                wrap: sinon.stub().returns(() => {}),
            };
            sess.__set__("U", u);
        });

        chunk("calls callback with fixtures", () => {
            const cb = () => {};
            sessCb(["my fixture"], cb)();

            expect(u.wrap).to.be.calledOnce;
            expect(u.wrap.args[0][0]).to.be.eql(["my fixture"]);
            expect(u.wrap.args[0][1]).to.be.equal(cb);

            expect(after_).to.be.calledOnce;
            expect(after_.args[0][0]).to.be.equal(sess.__get__("afterCb"));
        });
    });

    test("afterCb()", () => {
        let afterCb, retryTests, session_;

        beforeChunk(() => {
            afterCb = sess.__get__("afterCb");

            retryTests = [];
            sess.__set__("retryTests", retryTests);

            session_ = sinon.stub();
            sess.__set__("global", { session: session_ });
        });

        chunk("does nothing if no tests to retry", () => {
            retryTests.push({ args: { retries: 0 }});
            afterCb();

            expect(session_).to.not.be.called;
        });

        chunk("retries tests with common name", () => {
            retryTests.push({ args: { retries: 1 }});
            afterCb();

            expect(session_).to.be.calledOnce;
            expect(session_.args[0][0]).to.be.equal("my session - Retry #0");
            expect(session_.args[0][1]).to.be.equal(sess.__get__("retryCb"));
        });
    });

    test("retryCb()", () => {
        let retryCb, retryTests;

        beforeChunk(() => {
            retryCb = sess.__get__("retryCb");

            retryTests = [];
            sess.__set__("retryTests", retryTests);
        });
        
        chunk("does nothing if no tests to retry", () => {
            retryTests.push({ args: { retries: 0 }, func: sinon.stub() });
            retryCb();

            expect(retryTests[0].func).to.not.be.called;
        });

        chunk("retries tests", () => {
            retryTests.push({ args: { retries: 1 }, func: sinon.stub() });
            retryCb();

            expect(retryTests[0].func).to.be.calledOnce;
            expect(retryTests[0].func.args[0][0]).to.be.equal(retryTests[0].args);

            expect(retryTests[0].args.retries).to.be.equal(0);
        });
    });
});
