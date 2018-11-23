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
            sess(cb);

            expect(conf.session.errors).to.be.empty;

            expect(suite_).to.be.calledOnce;
            expect(suite_.args[0][0]).to.be.equal("my session");
            expect(suite_.args[0][1]).to.be.eql([]);
            expect(suite_.args[0][2]).to.be.equal("sessCb");

            expect(sessCb).to.be.calledOnce;
            expect(sessCb.args[0][0]).to.be.equal("my session");
            expect(sessCb.args[0][1]).to.be.eql([]);
            expect(sessCb.args[0][2]).to.be.equal(cb);
        });

        chunk("with name & callback", () => {
            const cb = () => {};
            sess("custom session", cb);

            expect(conf.session.errors).to.be.empty;

            expect(suite_).to.be.calledOnce;
            expect(suite_.args[0][0]).to.be.equal("custom session");
            expect(suite_.args[0][1]).to.be.eql([]);
            expect(suite_.args[0][2]).to.be.equal("sessCb");

            expect(sessCb).to.be.calledOnce;
            expect(sessCb.args[0][0]).to.be.equal("custom session");
            expect(sessCb.args[0][1]).to.be.eql([]);
            expect(sessCb.args[0][2]).to.be.equal(cb);
        });

        chunk("with fixtures & callback", () => {
            const cb = () => {};
            sess(null, ["my fixture"], cb);

            expect(conf.session.errors).to.be.empty;

            expect(suite_).to.be.calledOnce;
            expect(suite_.args[0][0]).to.be.equal("my session");
            expect(suite_.args[0][1]).to.be.eql(["my fixture"]);
            expect(suite_.args[0][2]).to.be.equal("sessCb");

            expect(sessCb).to.be.calledOnce;
            expect(sessCb.args[0][0]).to.be.equal("my session");
            expect(sessCb.args[0][1]).to.be.eql(["my fixture"]);
            expect(sessCb.args[0][2]).to.be.equal(cb);
        });

        chunk("with name, fixtures & callback", () => {
            const cb = () => {};
            sess("custom session", ["my fixture"], cb);

            expect(conf.session.errors).to.be.empty;

            expect(suite_).to.be.calledOnce;
            expect(suite_.args[0][0]).to.be.equal("custom session");
            expect(suite_.args[0][1]).to.be.eql(["my fixture"]);
            expect(suite_.args[0][2]).to.be.equal("sessCb");

            expect(sessCb).to.be.calledOnce;
            expect(sessCb.args[0][0]).to.be.equal("custom session");
            expect(sessCb.args[0][1]).to.be.eql(["my fixture"]);
            expect(sessCb.args[0][2]).to.be.equal(cb);
        });
    });

    test("sessCb()", () => {
        let sessCb, after_, afterCb;

        beforeChunk(() => {
            sessCb = sess.__get__("sessCb");

            after_ = sinon.stub();
            sess.__set__("after", after_);

            afterCb = sinon.stub();
            sess.__set__("afterCb", afterCb);
        });

        chunk("calls callback with fixtures", () => {
            const cb = sinon.stub();
            sessCb("my session", ["my fixture"], cb)();

            expect(cb).to.be.calledOnce;
            expect(after_).to.be.calledOnce;
            expect(afterCb).to.be.calledOnce;
            expect(afterCb.args[0][0]).to.be.equal("my session");
            expect(afterCb.args[0][1]).to.be.eql(["my fixture"]);
            expect(afterCb.args[0][2]).to.be.equal(cb);
        });
    });

    test("afterCb()", () => {
        let afterCb, conf, suite, sessCb;

        beforeChunk(() => {
            afterCb = sess.__get__("afterCb");

            conf = {
                retry: {},
                test: {},
            };
            sess.__set__("CONF", conf);

            suite = sinon.stub();
            sess.__set__("suite", suite);

            sessCb = sinon.stub();
            sess.__set__("sessCb", sessCb);
        });

        chunk("clears retry session and exit", () => {
            conf.retry.chunkIds = { 1: ["1_1"] };
            conf.retry.id = 1;
            afterCb("my sess", ["my fix"], () => {})();
            expect(conf.retry.chunkIds).to.be.empty;
            expect(suite).to.not.be.called;
        });

        chunk("retries tests session", () => {
            conf.retry.chunkIds = { 1: ["1_1"], 2: ["2_1"] };
            conf.retry.id = 1;
            const cb = () => {};
            afterCb("my sess", ["my fix"], cb)();
            expect(conf.retry.chunkIds).to.be.eql({ 2: ["2_1"] });
            expect(suite).to.be.calledOnce;
            expect(suite.args[0][0]).to.be.equal("my sess");
            expect(sessCb).to.be.calledOnce;
            expect(sessCb.args[0][0]).to.be.equal("my sess");
            expect(sessCb.args[0][1]).to.be.eql(["my fix"]);
            expect(sessCb.args[0][2]).to.be.equal(cb);
        });
    });
});
