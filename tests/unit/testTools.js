"use config";

const tools = rewire("../../lib/tools");

suite("tools", () => {

    afterChunk(() => {
        tools.__reset__();
    });

    test(".fakeLoad()", () => {
        let global_, require_;

        beforeChunk(() => {
            global_ = {};
            tools.__set__("global", global_);

            require_ = sinon.stub();
            tools.__set__("require", require_);
        });

        chunk(() => {
            tools.fakeLoad();

            expect(global_.before).to.be.a("function");
            expect(global_.after).to.be.a("function");
            expect(global_.beforeEach).to.be.a("function");
            expect(global_.afterEach).to.be.a("function");
            expect(global_.it).to.be.a("function");
            expect(global_.describe).to.be.a("function");

            expect(require_).to.be.calledTwice;
            expect(require_.args[0][0]).to.be.equal("./globals");
            expect(require_.args[1][0]).to.be.equal("./loader");
        });
    });
});
