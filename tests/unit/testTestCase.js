"use strict";

var TestCase = require("../../lib/testing").TestCase;

test("TestCase class", () => {
    var testCase;

    scope("instance", () => {

        before(() => {
            testCase = new TestCase("test case");
        });

        chunk("duration is zero", () => {
            expect(testCase.duration).to.be.equal(0);
        });

        chunk("name is 'test case'", () => {
            expect(testCase.name).to.be.equal("test case");
        });

        chunk("status is 'not started'", () => {
            expect(testCase.status).to.be.equal(TestCase.NOT_STARTED);
        });
    });

    scope(".start()", () => {

        beforeChunk(() => {
            testCase = new TestCase("test case");
        });

        chunk("starts test case", () => {
            expect(testCase._startTime).to.not.exist;
            testCase.start();
            expect(testCase._startTime).to.exist;
            expect(testCase.status).to.be.equal(TestCase.IN_PROGRESS);
        });

        chunk("raises error if test case is started already", () => {
            testCase.start();
            expect(testCase.start).to.throw();
        });
    });

    scope(".end()", () => {

        beforeChunk(() => {
            testCase = new TestCase("test case");
        });

        chunk("ends test case", () => {
            testCase.start();
            testCase._startTime = new Date() - 1000;
            testCase.end(TestCase.PASSED);
            expect(testCase.status).to.be.equal(TestCase.PASSED);
            expect(testCase._startTime).to.gte(1000);
        });

        chunk("raises error if test case isn't started yet", () => {
            expect(testCase.end).to.throw();
        });
    });

    scope(".reset()", () => {

        chunk("resets test case", () => {
            testCase = new TestCase("test case");
            testCase.reset();

            expect(testCase.screenshots).to.be.empty;
            expect(testCase.videos).to.be.empty;
            expect(testCase.errors).to.be.empty;
            expect(testCase.rawInfo).to.be.empty;
            expect(testCase.failedParams).to.be.empty;
            expect(testCase.testParams).to.be.empty;
        });
    });
});
