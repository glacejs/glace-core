"use strict";

const TESTRAIL_PATH = "../../lib/reporter/testrail";

suite("reporter/testrail", () => {
    let testrailReporter, testrailClient;
    let testrailConf = CONF.testrail;

    beforeChunk(() => {
        CONF.testrail = {
            host: "http://testrail",
            user: "user@example.com",
            token: "123456",
            projectId: "1234",
            suiteId: "123",
            runName: "my run", 
            runDescription: "my run description",
        };
        testrailReporter = rewire(TESTRAIL_PATH);
    });

    afterChunk(() => {
        testrailReporter.__reset__();
        CONF.testrail = testrailConf;
    });

    test("import", () => {

        ["host", "user", "token", "projectId", "suiteId", "runName", "runDescription"].forEach(opt => {

            chunk(`throws exception if no testrail ${opt}`, () => {
                CONF.testrail[opt] = null;
                expect(() => rewire(TESTRAIL_PATH)).to.throw(`'${opt}' isn't specified`);
            });
        });
    });

    test("start()", () => {
        let cases, log;

        beforeChunk(() => {
            testrailClient = {
                getCases: sinon.stub().returns({ body: [{ title: "my case", id: 1 }]}),
                addRun: sinon.stub().returns({ body: { id: 10 }}),
                isFailed: false,
            };
            testrailReporter.__set__("testrail", testrailClient);

            cases = {};
            testrailReporter.__set__("cases", cases);

            log = {
                error: sinon.spy(),
            };
            testrailReporter.__set__("LOG", log);
        });


        chunk("starts testrail report", async () => {
            testrailReporter.start();
            await testrailReporter.done();

            expect(cases).to.be.eql({ "my case": { id: 1 }});
            expect(CONF.testrail.runId).to.be.equal(10);
            expect(testrailClient.isFailed).to.be.false;

            expect(testrailClient.getCases).to.be.calledOnce;
            expect(testrailClient.getCases.args[0][0]).to.be.equal(CONF.testrail.projectId);
            expect(testrailClient.getCases.args[0][1]).to.be.eql({ suite_id: CONF.testrail.suiteId });

            expect(testrailClient.addRun).to.be.calledOnce;
            expect(testrailClient.addRun.args[0][0]).to.be.equal(CONF.testrail.projectId);
            expect(testrailClient.addRun.args[0][1]).to.be.eql({
                suite_id: CONF.testrail.suiteId, name: CONF.testrail.runName,
                description: CONF.testrail.runDescription });
        });

        chunk("throws error if there are duplicated cases", async () => {
            testrailClient.getCases.returns(
                { body: [{ title: "my case", id: 1 }, { title: "my case", id: 2 }]});

            testrailReporter.start();
            await testrailReporter.done();

            expect(testrailClient.isFailed).to.true;
            expect(testrailClient.addRun).to.not.be.called;
            expect(log.error).to.be.calledOnce;
            expect(log.error.args[0][0]).to.include("Detect duplicated cases");
        });
    });

    test("testEnd()", () => {
        let cases, conf, log;

        beforeChunk(() => {
            testrailClient = {
                addResultForCase: sinon.stub(),
            };

            testrailReporter.__set__("testrail", testrailClient);

            log = {
                error: sinon.spy(),
            };
            testrailReporter.__set__("LOG", log);

            cases = {};
            testrailReporter.__set__("cases", cases);

            conf = {
                testrail: { runId: 123 },
                test: {
                    curCase: {
                        name: "my test",
                        screenshots: [],
                        videos: [],
                        rawInfo: [],
                        errors: [],
                    },
                },
            };
            testrailReporter.__set__("CONF", conf);
        });

        chunk("does nothing if testrail report is failed to init", async () => {
            testrailClient.isFailed = true;
            testrailReporter.testEnd({ title: "my test" });
            await testrailReporter.done();
            expect(testrailClient.addResultForCase).to.not.be.called;
        });

        chunk("does nothing if test case is not matched", async () => {
            cases["another test"] = { id: 1 };

            testrailReporter.testEnd({ title: "my test" });
            await testrailReporter.done();

            expect(testrailClient.addResultForCase).to.not.be.called;
        });

        chunk("sends test report to testrail", async () => {
            cases["my test"] = { id: 1 };

            testrailReporter.testEnd({ title: "my test" });
            await testrailReporter.done();

            expect(testrailClient.addResultForCase).to.be.calledOnce;
            expect(testrailClient.addResultForCase.args[0][0]).to.be.equal(123);
            expect(testrailClient.addResultForCase.args[0][1]).to.be.equal(1);
            expect(testrailClient.addResultForCase.args[0][2]).to.be.eql({ status_id: 1, comment: "" });
            expect(log.error).to.not.be.called;
        });

        chunk("captures report error", async () => {
            cases["my test"] = { id: 1 };
            testrailClient.addResultForCase.throws(Error("BOOM!"));

            testrailReporter.testEnd({ title: "my test" });
            await testrailReporter.done();

            expect(log.error).to.be.calledOnce;
            expect(log.error.args[0][0]).to.include("Error to publish test");
        });

        chunk("sends screenshot paths if there are", async () => {
            cases["my test"] = { id: 1 };
            conf.test.curCase.screenshots = ["/path/to/my/screen"];

            testrailReporter.testEnd({ title: "my test" });
            await testrailReporter.done();

            expect(testrailClient.addResultForCase.args[0][2].comment).to.include("/path/to/my/screen");
        });

        chunk("sends video paths if there are", async () => {
            cases["my test"] = { id: 1 };
            conf.test.curCase.videos = ["/path/to/my/video"];

            testrailReporter.testEnd({ title: "my test" });
            await testrailReporter.done();

            expect(testrailClient.addResultForCase.args[0][2].comment).to.include("/path/to/my/video");
        });

        chunk("sends raw info if there are", async () => {
            cases["my test"] = { id: 1 };
            conf.test.curCase.rawInfo = ["extra data"];

            testrailReporter.testEnd({ title: "my test" });
            await testrailReporter.done();

            expect(testrailClient.addResultForCase.args[0][2].comment).to.include("extra data");
        });

        chunk("marks test as blocked if it is skipped", async () => {
            cases["my test"] = { id: 1 };
            conf.test.curCase.status = "skipped";

            testrailReporter.testEnd({ title: "my test" });
            await testrailReporter.done();

            expect(testrailClient.addResultForCase.args[0][2].status_id).to.be.equal(2);
        });

        chunk("marks test as failed and attach errors", async () => {
            cases["my test"] = { id: 1 };
            conf.test.curCase.status = "failed";
            conf.test.curCase.errors = ["BOOM!"];

            testrailReporter.testEnd({ title: "my test" });
            await testrailReporter.done();

            expect(testrailClient.addResultForCase.args[0][2].status_id).to.be.equal(5);
            expect(testrailClient.addResultForCase.args[0][2].comment).to.include("BOOM!");
        });
    });

    test("end()", () => {
        let console_;

        beforeChunk(() => {
            testrailClient = {};
            testrailReporter.__set__("testrail", testrailClient);

            console_ = {
                log: sinon.spy(),
            };
            testrailReporter.__set__("console", console_);
        });

        chunk("does nothing if testrail report is failed on init", () => {
            testrailClient.isFailed = true;
            testrailReporter.end();
            expect(console_.log).to.not.be.called;
        });

        chunk("prints details about testrail reporter", () => {
            testrailReporter.end();
            expect(console_.log).to.be.calledThrice;
            expect(console_.log.args[2][0]).to.include("TestRail report is");
        });
    });
});
