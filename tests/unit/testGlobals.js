"use strict";

suite("globals", () => {
    var sandbox = sinon.createSandbox();

    beforeChunk(() => {
        CONF.session.__passedChunkIds = [];
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
        let rewire_ = rewire("../../lib/globals/rewire");

        afterChunk(() => {
            rewire_.__reset__();
        });

        chunk("imports local module", () => {
            expect(rewire_("../../lib/index")).to.exist;
        });

        chunk("available in interactive mode", () => {
            rewire_.__set__("getCallerPath", () => null);
            expect(rewire_("./lib/index")).to.exist;
        });

        chunk("throws exception on global module", () => {
            expect(() => rewire_("fs")).to.throw("no such file or directory");
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

        chunk("skips reserved properties", () => {
            const reserved = () => {};
            const stubbed = stubObject({ __reserved: reserved });
            expect(stubbed.__reserved).to.be.equal(reserved);
        });
    });
});
