"use strict";

const TestCase = rewire("../../lib/testing").TestCase;

suite("TestCase", () => {
    let testCase;

    beforeChunk(() => {
        testCase = new TestCase("test case");
    });

    test("instance", () => {

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

    test(".hasFailedParams()", () => {

        chunk("returns true", () => {
            testCase.failedParams = [{ a: 1 }];
            expect(testCase.hasFailedParams()).to.be.true;
        });

        chunk("returns false", () => {
            expect(testCase.hasFailedParams()).to.be.false;
            testCase.failedParams = [{}];
            expect(testCase.hasFailedParams()).to.be.false;
        });
    });

    test(".start()", () => {

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

    test(".end()", () => {

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

    test(".reset()", () => {

        chunk("resets test case", () => {
            testCase.reset();

            expect(testCase.screenshots).to.be.empty;
            expect(testCase.videos).to.be.empty;
            expect(testCase.errors).to.be.empty;
            expect(testCase.rawInfo).to.be.empty;
            expect(testCase.failedParams).to.be.empty;
            expect(testCase.testParams).to.be.empty;
        });
    });

    test(".addFailedParams()", () => {

        beforeChunk(() => {
            testCase.addFailedParams({ lang: "ru" });
        });

        chunk("adds failed params if no failed params before", () => {
            expect(testCase.failedParams).has.length(1);
            expect(testCase.failedParams[0].lang).to.be.equal("ru");
        });

        chunk("doesn't add failed params if they are present already", () => {
            testCase.addFailedParams({ lang: "ru" });
            expect(testCase.failedParams).has.length(1);
            expect(testCase.failedParams[0].lang).to.be.equal("ru");
        });

        chunk("adds failed params if it doesn't match any of already added", () => {
            testCase.addFailedParams({ lang: "en" });
            expect(testCase.failedParams).has.length(2);
            expect(testCase.failedParams[1].lang).to.be.equal("en");
        });
    });

    test(".addError()", () => {

        chunk(() => {
            testCase.addError("my error");
            expect(testCase.errors).to.have.length(1);
            expect(testCase.errors[0]).to.be.equal("my error");
        });
    });

    test(".addScreenshot()", () => {

        chunk(() => {
            testCase.addScreenshot("/path/to/my/screen");
            expect(testCase.screenshots).to.have.length(1);
            expect(testCase.screenshots[0]).to.be.equal("/path/to/my/screen");
        });
    });

    test(".addVideo()", () => {

        chunk(() => {
            testCase.addVideo("/path/to/my/video");
            expect(testCase.videos).to.have.length(1);
            expect(testCase.videos[0]).to.be.equal("/path/to/my/video");
        });
    });

    test(".addChunk()", () => {

        chunk(() => {
            testCase.addChunk("my chunk");
            expect(testCase.chunks).to.have.length(1);
            expect(testCase.chunks[0]).to.be.equal("my chunk");
        });
    });

    test(".addDetails()", () => {

        chunk(() => {
            testCase.addDetails("my details");
            expect(testCase.rawInfo).to.have.length(1);
            expect(testCase.rawInfo[0]).to.be.equal("my details");
        });
    });
});
