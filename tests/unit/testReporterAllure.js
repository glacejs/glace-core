"use strict";

const allureReporter = rewire("../../lib/reporter/allure");

suite("reporter/allure", () => {
    let allure;

    beforeChunk(() => {
        allure = {};
        allureReporter.__set__("allure", allure);
    });

    afterChunk(() => {
        allureReporter.__reset__();
    });

    test("start()", () => {

        beforeChunk(() => {
            allure.startSuite = sinon.stub();
        });

        chunk(() => {
            allureReporter.start();
            expect(allure.startSuite).to.be.calledOnce;
            expect(allure.startSuite.args[0][0]).to.be.equal(CONF.allure.suiteName);
        });
    });
});
