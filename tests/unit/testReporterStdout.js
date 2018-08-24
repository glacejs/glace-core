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
});
