"use strict";

scope("globals", () => {
    var sandbox = sinon.createSandbox();

    beforeChunk(() => {
        sandbox.restore();
    });

    test("chai as promised", () => {

        chunk("checks fulfilled promise", async () => {
            await expect(Promise.resolve()).to.be.fulfilled;
        });
    
        chunk("checks rejected promise", async () => {
            await expect(Promise.reject()).to.be.rejected;
        });
    });
    
    test("global sinon", () => {
        chunk("exists", () => {
            expect(sinon).to.exist;
        });
    });
    
    test("global rewire", () => {
        chunk("exists", () => {
            expect(rewire).to.exist;
        });
    });
    
    test("sinon-chai", () => {
        var func;
    
        beforeChunk(() => {
            func = sinon.spy();
        });
    
        chunk("is active", () => {
            func();
            expect(func).to.be.calledOnce;
        });
    });

    scope("chunk", () => {
        var _chunk = rewire("../../lib/globals/chunk");

        beforeChunk(() => {
            _chunk.__reset__();
        });

        test("chunk()", () => {
            var it, _chunkCb;

            beforeChunk(() => {
                it = sinon.spy();
                _chunk.__set__("it", it);
                _chunkCb = sinon.spy((_0, _1, o) => o());
                _chunk.__set__("_chunkCb", _chunkCb);
            });

            chunk("anonymous", () => {
                var cb = () => {};
                _chunk(cb);
                expect(it).to.be.calledOnce;
                expect(it.args[0][0]).to.be.equal("");
                expect(_chunkCb).to.be.calledOnce;
                expect(_chunkCb.args[0][0]).to.be.equal("");
                expect(_chunkCb.args[0][1]).to.be.empty;
                expect(_chunkCb.args[0][2]).to.be.equal(cb);
            });

            chunk("named", () => {
                var cb = () => {};
                _chunk("my chunk", cb);
                expect(it).to.be.calledOnce;
                expect(it.args[0][0]).to.be.equal("my chunk");
                expect(_chunkCb).to.be.calledOnce;
                expect(_chunkCb.args[0][0]).to.be.equal("my chunk");
                expect(_chunkCb.args[0][1]).to.be.empty;
                expect(_chunkCb.args[0][2]).to.be.equal(cb);
            });

            chunk("with options", () => {
                var cb = () => {};
                _chunk("my chunk", { retry: 2, timeout: 1}, cb);
                expect(it).to.be.calledOnce;
                expect(it.args[0][0]).to.be.equal("my chunk");
                expect(_chunkCb).to.be.calledOnce;
                expect(_chunkCb.args[0][0]).to.be.equal("my chunk");
                expect(_chunkCb.args[0][1]).to.have.property("retry", 2)
                expect(_chunkCb.args[0][1]).to.have.property("timeout", 1);
                expect(_chunkCb.args[0][2]).to.be.equal(cb);
            });
        });

        test("_chunkCb()", () => {
            var ctx, cb, _chunkCb;

            beforeChunk(() => {
                _chunkCb = _chunk.__get__("_chunkCb");
                ctx = {
                    retries: sinon.spy(),
                    timeout: sinon.spy(),
                };
                cb = sinon.spy();
            });

            chunk("without options", () => {
                _chunkCb("my super chunk", {}, cb).call(ctx);
                expect(CONF.curTestCase.chunks).to.include("my super chunk");
                expect(cb).to.be.calledOnce;
                expect(ctx.retries).to.not.be.called;
                expect(ctx.timeout).to.not.be.called;
            });

            chunk("with options", () => {
                _chunkCb("my super chunk", { retry: 2, timeout: 1 }, cb).call(ctx);
                expect(CONF.curTestCase.chunks).to.include("my super chunk");
                expect(cb).to.be.calledOnce;
                expect(ctx.retries).to.be.calledOnce;
                expect(ctx.retries.args[0][0]).to.be.equal(2);
                expect(ctx.timeout).to.be.calledOnce;
                expect(ctx.timeout.args[0][0]).to.be.equal(1000);
            });
        });
    });

    scope("forEachLanguage", () => {
        var _forEachLanguage = rewire("../../lib/globals/forEachLanguage");
        var _langCb, _langIntCb;

        beforeChunk(() => {
            _forEachLanguage.__reset__();
            _langIntCb = sinon.spy();
            _langCb = sinon.stub().returns(_langIntCb);
            _forEachLanguage.__set__("_langCb", _langCb);
        });

        test("forEachLanguage()", () => {

            chunk("with default params", () => {
                var langs = CONF.languages;
                CONF.languages = ["en", "ee"];
                _forEachLanguage(() => {});
                expect(_langCb).to.be.calledOnce;
                expect(_langIntCb).to.be.calledTwice;
                expect(_langIntCb.args[0][0]).to.equal("en");
                expect(_langIntCb.args[1][0]).to.equal("ee");
                CONF.languages = langs;
            });

            chunk("with ctx", () => {
                _forEachLanguage({ language: "ru" }, () => {});
                expect(_langCb).to.be.calledOnce;
                expect(_langIntCb).to.be.calledOnce;
                expect(_langIntCb.args[0][0]).to.equal("ru");
            });

            chunk("with options", () => {
                _forEachLanguage({}, { languages: ["en", "ru"], }, () => {});
                expect(_langCb).to.be.calledOnce;
                expect(_langIntCb).to.be.calledTwice;
                expect(_langIntCb.args[0][0]).to.equal("en");
                expect(_langIntCb.args[1][0]).to.equal("ru");
            });

            chunk("with fixtures", () => {
                var fixtures = ["a", "b"];
                _forEachLanguage({ language: "en" }, null, fixtures, () => {});
                expect(_langCb).to.be.calledOnce;
                expect(_langCb.args[0][0]).to.be.equal(fixtures);
            });
        });
    });

    test(".stubObject()", () => {

        chunk("stubs object", () => {
            var x = { y: () => {}};
            x = stubObject(x);
            expect(x.y()).to.be.undefined;
            expect(x.y).to.be.calledOnce;
        });

        chunk("stubs nested object", () => {
            var x = { y: { z: () => {}}};
            x = stubObject(x);
            expect(x.y.z()).to.be.undefined;
            expect(x.y.z).to.be.calledOnce;
        });

        chunk("stubs circular object", () => {
            var x = { y: () => {}};
            x.z = x;
            x = stubObject(x);
            expect(x.z.y()).to.be.undefined;
            expect(x.z.y).to.be.calledOnce;
        });

        chunk("stubs object with return value", () => {
            var x = { y: () => {}};
            x = stubObject(x, 1);
            expect(x.y()).to.be.equal(1);
            expect(x.y).to.be.calledOnce;
        });

        chunk("stubs object with return object", () => {
            var x = { a: () => {}, b: () => {}, c: () => {}};
            x = stubObject(x, { a: 1, b: 2 });
            expect(x.a()).to.be.equal(1);
            expect(x.a).to.be.calledOnce;
            expect(x.b()).to.be.equal(2);
            expect(x.b).to.be.calledOnce;
            expect(x.c()).to.be.undefined;
            expect(x.c).to.be.calledOnce;
        });
    });
});
