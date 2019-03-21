"use strict";

const dots = rehire("../../lib/reporter/dots");

suite("dots", () => {
    let write;

    beforeChunk(() => {
        write = sinon.stub();
        dots.__set__("process", {
            stdout: { write: write },
        });
    });

    test(".suite()", () => {

        chunk("prints session start", () => {
            dots.suite({ title: CONF.session.name });
            expect(write).to.be.calledOnce;
            expect(write.args[0][0]).to.be.equal("\u001b[1m\u001b[36m>\u001b[39m\u001b[22m ");

            dots.suite({ title: CONF.session.name });
            expect(write).to.be.calledTwice;
            expect(write.args[1][0]).to.be.equal("\n\u001b[1m\u001b[36m>\u001b[39m\u001b[22m ");
        });

        chunk("does nothing", () => {
            dots.suite({ title: "hello world" });
            expect(write).to.not.be.called;
        });
    });

    test(".pass()", () => {

        chunk(() => {
            dots.pass();
            expect(write).to.be.calledOnce;
            expect(write.args[0][0]).to.be.equal("\u001b[32m.\u001b[39m");
        });
    });

    test(".fail()", () => {

        chunk(() => {
            dots.fail();
            expect(write).to.be.calledOnce;
            expect(write.args[0][0]).to.be.equal("\u001b[31mx\u001b[39m");
        });
    });

    test(".end()", () => {

        chunk(() => {
            const printTestErrors = sinon.stub();
            const printSessionErrors = sinon.stub();

            dots.__set__("utils", { printTestErrors, printSessionErrors });
            dots.end();

            expect(printTestErrors).to.be.calledOnce;
            expect(printSessionErrors).to.be.calledOnce;
        });
    });

    test(".done()", () => {

        chunk(() => {
            expect(dots.done).to.be.equal(console.log);
        });
    });
});
