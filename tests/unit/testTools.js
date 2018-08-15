"use config";

const tools = rewire("../../lib/tools");

suite("tools", () => {

    afterChunk(() => {
        tools.__reset__();
    });

    test(".listSteps()", () => {
        let getStepNames, getStepsData, learnClassifier, filterSteps;

        beforeChunk(() => {
            getStepNames = sinon.stub();
            tools.__set__("getStepNames", getStepNames);

            getStepsData = sinon.stub();
            tools.__set__("getStepsData", getStepsData);

            learnClassifier = sinon.stub();
            tools.__set__("learnClassifier", learnClassifier);

            filterSteps = sinon.stub();
            tools.__set__("filterSteps", filterSteps);
        });

        chunk("gets cached steps", () => {
            tools.__set__("stepsCache", ["my-step"]);

            expect(tools.listSteps()).to.be.eql(["my-step"]);
            expect(getStepNames).to.not.be.called;
            expect(getStepsData).to.not.be.called;
            expect(learnClassifier).to.not.be.called;
            expect(filterSteps).to.not.be.called;
        });

        chunk("gets steps with cache population", () => {
            getStepsData.returns(["my-step"]);
            tools.__set__("stepsCache", null);

            expect(tools.listSteps()).to.be.eql(["my-step"]);
            expect(tools.__get__("stepsCache")).to.be.eql(["my-step"]);
            expect(getStepNames).to.be.calledOnce;
            expect(getStepsData).to.be.calledOnce;
            expect(learnClassifier).to.be.calledOnce;
            expect(learnClassifier.args[0][0]).to.be.eql(["my-step"]);
            expect(filterSteps).to.not.be.called;
        });

        chunk("gets filtered steps", () => {
            filterSteps.returns(["my-another-step"]);
            tools.__set__("stepsCache", ["my-step"]);

            expect(tools.listSteps("another")).to.be.eql(["my-another-step"]);
            expect(filterSteps).to.be.calledOnce;
            expect(filterSteps.args[0]).to.be.eql([["my-step"], "another", false]);
        });
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
