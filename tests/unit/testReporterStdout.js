"use strict";

const stdoutReporter = rewire("../../lib/reporter/stdout");

suite("reporter/stdout", () => {
    let conf, stdout;

    beforeChunk(() => {
        conf = {};
        conf.report = { dir: "/path/to/report" };
        stdoutReporter.__set__("CONF", conf);

        stdout = sinon.stub();
    });

    afterChunk(() => {
        stdoutReporter.__reset__();
    });

    test(".start()", () => {
        let fs, fse;

        beforeChunk(() => {
            fs = {
                createWriteStream: sinon.spy(),
            };
            stdoutReporter.__set__("fs", fs);

            fse = {
                mkdirsSync: sinon.spy(),
            };
            stdoutReporter.__set__("fse", fse);
        });

        chunk("activates stream", () => {
            stdoutReporter.start();
            expect(fse.mkdirsSync).to.be.calledOnce;
            expect(fse.mkdirsSync.args[0][0]).to.be.equal("/path/to/report");
            expect(fs.createWriteStream).to.be.calledOnce;
            expect(fs.createWriteStream.args[0][0]).to.be.equal("/path/to/report/stdout.log");
            expect(fs.createWriteStream.args[0][1]).to.be.eql({ flags: "w" });
        });
    });

    test(".end()", () => {
        let epilogue;

        beforeChunk(() => {
            epilogue = sinon.stub();
            stdoutReporter.__set__("epilogue", epilogue);
            stdoutReporter.__set__("stdout", stdout);
        });

        chunk("finalizes report", () => {
            stdoutReporter.end();
            expect(epilogue).to.be.calledOnce;
            expect(stdout).to.be.calledThrice;
            expect(stdout.args[2][0]).to.include("Local report is /path/to/report");
        });
    });

    test(".scope()", () => {

        beforeChunk(() => {
            stdoutReporter.__set__("stdout", stdout);
            stdoutReporter.__set__("indents", 0);
        });

        chunk(() => {
            stdoutReporter.scope({ title: "my scope" });
            expect(stdout).to.be.calledTwice;
            expect(stdout.args[1][0]).to.be.include("scope: my scope");
        });
    });

    test(".scopeEnd()", () => {

        beforeChunk(() => {
            stdoutReporter.__set__("stdout", stdout);
            stdoutReporter.__set__("indents", 1);
        });

        chunk(() => {
            stdoutReporter.scopeEnd();
            expect(stdout).to.be.calledOnce;
        });
    });

    test(".suite()", () => {

        beforeChunk(() => {
            stdoutReporter.__set__("stdout", stdout);
            stdoutReporter.__set__("indents", 0);
        });

        chunk(() => {
            stdoutReporter.suite({ title: "my suite" });
            expect(stdout).to.be.calledTwice;
            expect(stdout.args[1][0]).to.be.include("suite: my suite");
        });
    });

    test(".suiteEnd()", () => {

        beforeChunk(() => {
            stdoutReporter.__set__("stdout", stdout);
            stdoutReporter.__set__("indents", 1);
        });

        chunk(() => {
            stdoutReporter.suiteEnd();
            expect(stdout).to.be.calledOnce;
        });
    });

    test(".test()", () => {

        beforeChunk(() => {
            stdoutReporter.__set__("stdout", stdout);
            stdoutReporter.__set__("indents", 0);
        });

        chunk(() => {
            stdoutReporter.test({ title: "my test" });
            expect(stdout).to.be.calledTwice;
            expect(stdout.args[1][0]).to.be.include("test: my test");
        });
    });

    test(".testEnd()", () => {

        beforeChunk(() => {
            stdoutReporter.__set__("stdout", stdout);
            stdoutReporter.__set__("indents", 1);
        });

        chunk(() => {
            stdoutReporter.testEnd();
            expect(stdout).to.be.calledOnce;
        });
    });

    test(".pass()", () => {

        beforeChunk(() => {
            stdoutReporter.__set__("stdout", stdout);
        });

        chunk("prints chunk with name", () => {
            stdoutReporter.pass({ title: "my chunk" });
            expect(stdout).to.be.calledOnce;
            expect(stdout.args[0][0]).to.include("✓ chunk: my chunk");
        });

        chunk("prints chunk without name", () => {
            stdoutReporter.pass({});
            expect(stdout).to.be.calledOnce;
            expect(stdout.args[0][0]).to.include("✓ chunk");
            expect(stdout.args[0][0]).to.not.include("✓ chunk:");
        });
    });

    test(".skip()", () => {

        beforeChunk(() => {
            stdoutReporter.__set__("stdout", stdout);
        });

        chunk("prints chunk with name", () => {
            stdoutReporter.skip({ title: "my chunk" });
            expect(stdout).to.be.calledOnce;
            expect(stdout.args[0][0]).to.include("# chunk: my chunk");
        });

        chunk("prints chunk without name", () => {
            stdoutReporter.skip({});
            expect(stdout).to.be.calledOnce;
            expect(stdout.args[0][0]).to.include("# chunk");
            expect(stdout.args[0][0]).to.not.include("# chunk:");
        });
    });

    test(".fail()", () => {

        beforeChunk(() => {
            stdoutReporter.__set__("stdout", stdout);
        });

        chunk("prints chunk with name", () => {
            stdoutReporter.fail({ title: "my chunk" });
            expect(stdout).to.be.calledOnce;
            expect(stdout.args[0][0]).to.include("✖ chunk: my chunk");
        });

        chunk("prints chunk without name", () => {
            stdoutReporter.fail({});
            expect(stdout).to.be.calledOnce;
            expect(stdout.args[0][0]).to.include("✖ chunk");
            expect(stdout.args[0][0]).to.not.include("✖ chunk:");
        });

        chunk("prints test error", () => {
            conf.report.errorsNow = true;
            conf.test = { curCase: { errors: ["test error"] }};
            stdoutReporter.fail({});
            expect(stdout).to.be.calledTwice;
            expect(stdout.args[1][0]).to.include("test error");
        });

        chunk("prints session error", () => {
            conf.report.errorsNow = true;
            conf.test = {};
            conf.session = { errors: ["session error"] };
            stdoutReporter.fail({});
            expect(stdout).to.be.calledTwice;
            expect(stdout.args[1][0]).to.include("session error");
        });
    });

    test(".done()", () => {
        let report;

        beforeChunk(() => {
            report = {
                end: sinon.spy(o => o()),
            };
            stdoutReporter.__set__("report", report);
        });

        chunk(async () => {
            await stdoutReporter.done();
            expect(report.end).to.be.calledOnce;
        });
    });

    test("indent()", () => {
        let indent;

        beforeChunk(() => {
            indent = stdoutReporter.__get__("indent");
        });

        [[0, ""], [1, ""], [2, "  "], [3, "    "]].forEach(([indents, result]) => {
            chunk(`for ${indents} indent(s) it should be '${result}'`, () => {
                stdoutReporter.__set__("indents", indents);
                expect(indent()).to.be.equal(result);
            });
        });
    });

    test("stdout()", () => {
        let console_, report;

        beforeChunk(() => {
            console_ = {
                log: sinon.stub(),
            };
            stdoutReporter.__set__("console", console_);

            report = {
                write: sinon.stub(),
            };
            stdoutReporter.__set__("report", report);
        });

        beforeChunk(() => {
            stdout = stdoutReporter.__get__("stdout");
        });

        chunk(() => {
            stdout("hello", "world");
            expect(report.write).to.be.calledOnce;
            expect(report.write.args[0][0]).to.be.equal("hello world\n");
            expect(console_.log).to.be.calledOnce;
            expect(console_.log.args[0][0]).to.be.equal("hello");
            expect(console_.log.args[0][1]).to.be.equal("world");
        });
    });

    test("epilogue()", () => {
        let epilogue,
            printStatistics,
            printSkippedTests,
            printTestErrors,
            saveFailedTests,
            printSessionErrors;

        beforeChunk(() => {
            epilogue = stdoutReporter.__get__("epilogue");

            printStatistics = sinon.stub();
            stdoutReporter.__set__("printStatistics", printStatistics);

            printSkippedTests = sinon.stub();
            stdoutReporter.__set__("printSkippedTests", printSkippedTests);

            printTestErrors = sinon.stub();
            stdoutReporter.__set__("printTestErrors", printTestErrors);

            saveFailedTests = sinon.stub();
            stdoutReporter.__set__("saveFailedTests", saveFailedTests);

            printSessionErrors = sinon.stub();
            stdoutReporter.__set__("printSessionErrors", printSessionErrors);
        });

        chunk("prints all test results", () => {
            conf.test = {
                cases: [
                    { status: "passed" },
                    { status: "skipped" },
                    { status: "failed" },
                ],
            };

            epilogue();
            expect(printStatistics).to.be.calledOnce;
            expect(printStatistics.args[0]).to.be.eql([1, 1]);
            expect(printSkippedTests).to.be.calledOnce;
            expect(printSkippedTests.args[0][0]).to.be.eql([{ status: "skipped" }]);
            expect(printTestErrors).to.be.calledOnce;
            expect(printTestErrors.args[0][0]).to.be.eql([{ status: "failed" }]);
            expect(saveFailedTests).to.be.calledOnce;
            expect(saveFailedTests.args[0][0]).to.be.eql([{ status: "failed" }]);
            expect(printSessionErrors).to.be.calledOnce;
        });

        chunk("print no results", () => {
            conf.test = {
                cases: [],
            };
            epilogue();
            expect(printStatistics).to.be.calledOnce;
            expect(printStatistics.args[0]).to.be.eql([0, 0]);
            expect(printSkippedTests).to.not.be.called;
            expect(printTestErrors).to.not.be.called;
            expect(saveFailedTests).to.not.be.called;
            expect(printSessionErrors).to.be.calledOnce;
        });
    });

    test("printStatistics()", () => {
        let printStatistics;

        beforeChunk(() => {
            printStatistics = stdoutReporter.__get__("printStatistics");
            stdoutReporter.__set__("stdout", stdout);
        });

        chunk("prints full statistics", () => {
            conf.test = {
                cases: [
                    { duration: 60000, chunks: ["my chunk"] },
                    { duration: 30000, chunks: ["my chunk"] },
                ],
            };
            printStatistics(1, 1);
            expect(stdout).to.have.callCount(5);
            expect(stdout.args[0][0]).to.include("1").and.include("passed test");
            expect(stdout.args[1][0]).to.include("1").and.include("failed test");
            expect(stdout.args[2][0]).to.include("2 executed chunks");
            expect(stdout.args[4][0]).to.include("Summary tests time is");
            expect(stdout.args[4][1]).to.include("1m 30s");
        });

        chunk("prints nothing", () => {
            conf.test = { cases: [] };
            printStatistics(0, 0);
            expect(stdout).to.not.be.called;
        });
    });
});
