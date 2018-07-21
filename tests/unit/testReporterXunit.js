"use strict";

const xunitReporter = rewire("../../lib/reporter/xunit");

suite("reporter/xunit", () => {

    afterChunk(() => {
        xunitReporter.__reset__();
    });

    test("start()", () => {
        let fs;

        beforeChunk(() => {
            fs = {
                existsSync: sinon.stub().returns(true),
                unlinkSync: sinon.spy(),
            };
            xunitReporter.__set__("fs", fs);
        });

        chunk("removes previous report if it exists", () => {
            xunitReporter.start();
            expect(fs.existsSync).to.be.calledOnce;
            expect(fs.existsSync.args[0][0]).to.be.equal(CONF.xunit.path);
            expect(fs.unlinkSync).to.be.calledOnce;
            expect(fs.unlinkSync.args[0][0]).to.be.equal(CONF.xunit.path);
        });
    });
});
