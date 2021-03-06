"use strict";

suite("globals", () => {
    var sandbox = sinon.createSandbox();

    beforeChunk(() => {
        CONF.session.__passedChunkIds = [];
        sandbox.restore();
    });

    test("chai", () => {
        let chai = require("chai"),
            threshold = chai.config.truncateThreshold;

        beforeChunk(() => {
            CONF.report.deepErrors = true;
        });

        afterChunk(() => {
            CONF.report.deepErrors = false;
            chai.config.truncateThreshold = threshold;
        });

        chunk("shows full objects in errors", () => {
            rehire("../../lib/globals");
            expect(chai.config.truncateThreshold).to.be.equal(0);
        });
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

    test("global rehire", () => {
        chunk("exists", () => {
            expect(rehire).to.exist;
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
