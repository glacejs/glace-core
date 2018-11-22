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
