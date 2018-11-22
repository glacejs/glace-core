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

            expect(_langCb.args[0][0]).to.be.equal("for language");
            expect(_langCb.args[0][1]).to.be.eql([]);
            expect(_langCb.args[0][2]).to.be.eql({});
            expect(_langCb.args[0][3]).to.be.equal(cb);

            expect(langCapture).to.be.calledOnce;
            expect(langCapture.args[0][0]).to.be.equal("ru");
        });

        chunk("with name & callback", () => {
            const cb = () => {};
            forEachLanguage("for lang", cb);
            expect(_langCb).to.be.calledOnce;

            expect(_langCb.args[0][0]).to.be.equal("for lang");
            expect(_langCb.args[0][1]).to.be.eql([]);
            expect(_langCb.args[0][2]).to.be.eql({});
            expect(_langCb.args[0][3]).to.be.equal(cb);
        });

        chunk("with options & callback", () => {
            const cb = () => {};
            forEachLanguage({ languages: ["en"] }, cb);
            expect(_langCb).to.be.calledOnce;

            expect(_langCb.args[0][0]).to.be.equal("for language");
            expect(_langCb.args[0][1]).to.be.eql([]);
            expect(_langCb.args[0][2]).to.be.eql({ languages: ["en"] });
            expect(_langCb.args[0][3]).to.be.equal(cb);

            expect(langCapture).to.be.calledOnce;
            expect(langCapture.args[0][0]).to.be.equal("en");
        });

        chunk("with fixtures & callback", () => {
            const cb = () => {};
            forEachLanguage(["my fixture"], cb);
            expect(_langCb).to.be.calledOnce;

            expect(_langCb.args[0][0]).to.be.equal("for language");
            expect(_langCb.args[0][1]).to.be.eql(["my fixture"]);
            expect(_langCb.args[0][2]).to.be.eql({});
            expect(_langCb.args[0][3]).to.be.equal(cb);
        });

        chunk("with name, fixtures & callback", () => {
            const cb = () => {};
            forEachLanguage("with lang", ["my fixture"], cb);
            expect(_langCb).to.be.calledOnce;

            expect(_langCb.args[0][0]).to.be.equal("with lang");
            expect(_langCb.args[0][1]).to.be.eql(["my fixture"]);
            expect(_langCb.args[0][2]).to.be.eql({});
            expect(_langCb.args[0][3]).to.be.equal(cb);
        });

        chunk("with name, options & callback", () => {
            const cb = () => {};
            forEachLanguage("with lang", { languages: ["en"] }, cb);
            expect(_langCb).to.be.calledOnce;

            expect(_langCb.args[0][0]).to.be.equal("with lang");
            expect(_langCb.args[0][1]).to.be.eql([]);
            expect(_langCb.args[0][2]).to.be.eql({ languages: ["en"] });
            expect(_langCb.args[0][3]).to.be.equal(cb);
        });

        chunk("with fixtures, options & callback", () => {
            const cb = () => {};
            forEachLanguage(["my fixture"], { languages: ["en"] }, cb);
            expect(_langCb).to.be.calledOnce;

            expect(_langCb.args[0][0]).to.be.equal("for language");
            expect(_langCb.args[0][1]).to.be.eql(["my fixture"]);
            expect(_langCb.args[0][2]).to.be.eql({ languages: ["en"] });
            expect(_langCb.args[0][3]).to.be.equal(cb);
        });

        chunk("with name, fixtures, options & callback", () => {
            const cb = () => {};
            forEachLanguage("with lang", ["my fixture"], { languages: ["en"] }, cb);
            expect(_langCb).to.be.calledOnce;

            expect(_langCb.args[0][0]).to.be.equal("with lang");
            expect(_langCb.args[0][1]).to.be.eql(["my fixture"]);
            expect(_langCb.args[0][2]).to.be.eql({ languages: ["en"] });
            expect(_langCb.args[0][3]).to.be.equal(cb);
        });
    });

    test("_langCb()", () => {
        let _langCb, langFixture;

        beforeChunk(() => {
            _langCb = forEachLanguage.__get__("_langCb");

            langFixture = sinon.stub();
            forEachLanguage.__set__("langFixture", langFixture);
        });

        chunk(() => {
            const scope_ = sinon.stub();
            forEachLanguage.__set__("scope", scope_);
            const cb = sinon.stub();
            _langCb("with language", [], {}, cb)("ru");
            expect(scope_).to.be.calledOnce;
            expect(scope_.args[0][0]).to.be.equal("with language \"ru\"");
            expect(scope_.args[0][1]).to.have.length(1);
            expect(scope_.args[0][2]).to.be.eql({});

            expect(langFixture).to.be.calledOnce;
            expect(langFixture.args[0][0]).to.be.equal("ru");

            scope_.args[0][3]();
            expect(cb).to.be.calledOnce;
            expect(cb.args[0][0]).to.be.equal("ru");
        });
    });

    test("langFixture()", () => {
        let langFixture, u;

        beforeChunk(() => {
            langFixture = forEachLanguage.__get__("langFixture");

            u = {
                makeFixture: sinon.stub(),
            };
            forEachLanguage.__set__("U", u);

            forEachLanguage.__set__("beforeCb", o => o);
            forEachLanguage.__set__("afterCb", "after");
        });

        chunk("makes new fixture", () => {
            langFixture("ru");
            expect(u.makeFixture).to.be.calledOnce;
            expect(u.makeFixture.args[0][0]).to.be.eql({ before: "ru", after: "after" });
        });
    });

    test("beforeCb()", () => {
        let beforeCb, conf;

        beforeChunk(() => {
            beforeCb = forEachLanguage.__get__("beforeCb");

            conf = {};
            forEachLanguage.__set__("CONF", conf);
        });

        chunk("does nothing if no test case", () => {
            conf.test = {};
            const ctx = {};
            beforeCb("ru")(ctx)();
            expect(ctx.oldLang).to.not.exist;
        });

        chunk("sets language to test case", () => {
            conf.test = { curCase: { testParams: { language: "en" }}};
            const ctx = {};
            beforeCb("ru")(ctx)();
            expect(ctx.oldLang).to.be.equal("en");
            expect(conf.test.curCase.testParams.language).to.be.equal("ru");
        });
    });

    test("afterCb()", () => {
        let afterCb, conf;

        beforeChunk(() => {
            afterCb = forEachLanguage.__get__("afterCb");

            conf = {};
            forEachLanguage.__set__("CONF", conf);
        });

        chunk("does nothing if no test case", () => {
            conf.test = {};
            const ctx = {};
            afterCb(ctx)();
            expect(conf.test.curCase).to.not.exist;
        });

        chunk("resets language to original", () => {
            conf.test = { curCase: { testParams: { language: "en" }}};
            const ctx = { oldLang: "ru" };
            afterCb(ctx)();
            expect(conf.test.curCase.testParams.language).to.be.equal("ru");
        });
    });
});
