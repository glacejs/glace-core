"use strict";

const forEachLanguage = rewire("../../lib/globals/forEachLanguage");

suite("globals/forEachLanguage", () => {
    let conf;

    beforeChunk(() => {
        conf = {};
        forEachLanguage.__set__("CONF", conf);
    });

    afterChunk(() => {
        forEachLanguage.__reset__();
    });

    test("forEachLanguage()", () => {
        let _langCb, langCapture;

        beforeChunk(() => {
            conf.test = { languages: ["ru"] };
            langCapture = sinon.stub();
            _langCb = sinon.stub().returns(langCapture);
            forEachLanguage.__set__("_langCb", _langCb);
        });

        chunk("with callback only", () => {
            const cb = () => {};
            forEachLanguage(cb);
            expect(_langCb).to.be.calledOnce;
            expect(_langCb.args[0][0]).to.be.equal(null);
            expect(_langCb.args[0][1]).to.be.eql([]);
            expect(_langCb.args[0][2]).to.be.equal(cb);
            expect(langCapture).to.be.calledOnce;
            expect(langCapture.args[0][0]).to.be.equal("ru");
        });

        chunk("with name & callback", () => {
            forEachLanguage("for langs", () => {});
            expect(_langCb).to.be.calledOnce;
            expect(_langCb.args[0][0]).to.be.equal("for langs");
        });

        chunk("with name, options & callback", () => {
            forEachLanguage("for langs", { languages: ["en", "et"] }, () => {});
            expect(langCapture).to.be.calledTwice;
            expect(langCapture.args[0][0]).to.be.equal("en");
            expect(langCapture.args[1][0]).to.be.equal("et");
        });

        chunk("with name, options, fixtures & callback", () => {
            forEachLanguage("for langs", { languages: ["en"] }, ["my fixture"], () => {});
            expect(_langCb).to.be.calledOnce;
            expect(_langCb.args[0][1]).to.be.eql(["my fixture"]);
        });

        chunk("with options & callback", () => {
            forEachLanguage(null, { languages: ["en", "et"] }, () => {});
            expect(_langCb).to.be.calledOnce;
            expect(_langCb.args[0][0]).to.be.equal(null);
        });

        chunk("with fixtures & callback", () => {
            forEachLanguage(null, null, ["my fixture"], () => {});
            expect(langCapture).to.be.calledOnce;
            expect(langCapture.args[0][0]).to.be.equal("ru");
        });
    });

    test("_langCb()", () => {
        let _langCb;

        beforeChunk(() => {
            _langCb = forEachLanguage.__get__("_langCb");
        });

        chunk("uses default name", () => {
            const scope_ = sinon.stub();
            forEachLanguage.__set__("scope", scope_);
            
            _langCb(null, [], () => {})("ru");
            expect(scope_).to.be.calledOnce;
            expect(scope_.args[0][0]).to.be.equal("for language \"ru\"");
        });

        chunk("passes custom name", () => {
            const scope_ = sinon.stub();
            forEachLanguage.__set__("scope", scope_);
            
            _langCb("with language", [], () => {})("ru");
            expect(scope_).to.be.calledOnce;
            expect(scope_.args[0][0]).to.be.equal("with language \"ru\"");
        });

        chunk("doesn't change language in test params", () => {
            forEachLanguage.__set__("scope", (name, cb) => cb());

            const before_ = sinon.spy(cb => cb());
            forEachLanguage.__set__("before", before_);

            const after_ = sinon.spy(cb => cb());
            forEachLanguage.__set__("after", after_);

            const u = { wrap: sinon.stub().returns(() => {}) };
            forEachLanguage.__set__("U", u);

            conf.test = {
                curCase: {
                    testParams: {
                        language: "en",
                    },
                },
            };

            const cb = sinon.stub();
            _langCb(null, ["my fixture"], cb)("ru");

            expect(before_).to.be.calledOnce;
            expect(after_).to.be.calledOnce;

            expect(u.wrap).to.be.calledOnce;
            expect(u.wrap.args[0][0]).to.be.eql(["my fixture"]);

            u.wrap.args[0][1]();
            expect(cb).to.be.calledOnce;
            expect(cb.args[0][0]).to.be.equal("ru");
            expect(conf.test.curCase.testParams.language).to.be.equal("en");
        });

        chunk("changes language in test params", () => {
            forEachLanguage.__set__("scope", (name, cb) => cb());

            const before_ = sinon.spy(cb => cb());
            forEachLanguage.__set__("before", before_);

            const after_ = sinon.spy(cb => cb());
            forEachLanguage.__set__("after", after_);

            const u = { wrap: sinon.stub().returns(() => {}) };
            forEachLanguage.__set__("U", u);

            conf.test = {
                curCase: null,
            };

            const cb = sinon.stub();
            _langCb(null, ["my fixture"], cb)("ru");

            expect(before_).to.be.calledOnce;
            expect(after_).to.be.calledOnce;

            expect(u.wrap).to.be.calledOnce;
            expect(u.wrap.args[0][0]).to.be.eql(["my fixture"]);

            u.wrap.args[0][1]();
            expect(cb).to.be.calledOnce;
            expect(cb.args[0][0]).to.be.equal("ru");
        });
    });
});
