"use strict";

const classifier = rehire("../../lib/classifier");

suite("classifier", () => {
    let clsf;

    beforeChunk(() => {
        clsf = classifier();
    });

    afterChunk(() => {
        classifier.__reset__();
    });

    test(".classify()", () => {

        chunk(() => {
            clsf.learn("I'm happy every day", "happiness");
            clsf.learn("I'm sad sometimes", "sadness");

            let result = clsf.classify("happy");
            expect(result[0].label).to.be.equal("happiness");
            expect(result[0].value).to.be.gte(0.16);
            expect(result[1].label).to.be.equal("sadness");
            expect(result[1].value).to.be.lte(0.10);

            result = clsf.classify("sad");
            expect(result[0].label).to.be.equal("sadness");
            expect(result[0].value).to.be.gte(0.16);
            expect(result[1].label).to.be.equal("happiness");
            expect(result[1].value).to.be.lte(0.10);
        });
    });
});
