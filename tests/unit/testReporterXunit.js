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

        chunk("does nothing if no previous report", () => {
            fs.existsSync.returns(false);
            xunitReporter.start();
            expect(fs.existsSync).to.be.calledOnce;
            expect(fs.existsSync.args[0][0]).to.be.equal(CONF.xunit.path);
            expect(fs.unlinkSync).to.not.be.called;
        });
    });

    test("done()", () => {
        let stream;

        beforeChunk(() => {
            stream = {};
            stream.end = sinon.spy(f => f());
            xunitReporter.__set__("stream", stream);
        });

        chunk(async () => {
            await xunitReporter.done();
            expect(stream.end).to.be.calledOnce;
        });
    });

    test("end()", () => {
        let conf, fs, fse, path, write, writeTest, tag, console_;

        beforeChunk(() => {
            console_ = {
                log: sinon.stub(),
            };
            xunitReporter.__set__("console", console_);

            conf = {
                test: {
                    cases: [
                        { name: "my test", duration: 1 },
                    ],
                },
                xunit: {
                    path: "/path/to/xunit/report",
                },
            };
            xunitReporter.__set__("CONF", conf);

            fs = {
                createWriteStream: sinon.stub(),
            };
            xunitReporter.__set__("fs", fs);

            fse = {
                mkdirsSync: sinon.stub(),
            };
            xunitReporter.__set__("fse", fse);

            write = sinon.stub();
            xunitReporter.__set__("write", write);

            writeTest = sinon.stub();
            xunitReporter.__set__("writeTest", writeTest);

            tag = sinon.stub();
            xunitReporter.__set__("tag", tag);

            path = {
                dirname: sinon.stub(),
            };
            xunitReporter.__set__("path", path);
        });

        chunk(() => {
            xunitReporter.end();

            expect(console_.log).to.be.calledThrice;
            expect(console_.log.args[2][0]).to.include(conf.xunit.path);

            expect(write).to.be.calledTwice;
            expect(writeTest).to.be.calledOnce;
        });
    });

    test("write()", () => {
        let write, stream;

        beforeChunk(() => {
            write = xunitReporter.__get__("write");

            stream = {
                write: sinon.stub(),
            };
            xunitReporter.__set__("stream", stream);
        });

        chunk(() => {
            write("hello world");
            expect(stream.write).to.be.calledOnce;
            expect(stream.write.args[0][0]).to.be.equal("hello world\n");
        });
    });

    test("writeTest()", () => {
        let test, writeTest, write;

        beforeChunk(() => {
            writeTest = xunitReporter.__get__("writeTest");

            test = {
                name: "my test",
                duration: 1,
                status: "failed",
                errors: ["my error"],
            };

            write = sinon.stub();
            xunitReporter.__set__("write", write);
        });

        chunk("failed", () => {
            writeTest(test);
            expect(write).to.be.calledOnce;
            expect(write.args[0][0]).to.be.equal(
                "<testcase classname=\"my test\" name=\"my test\" time=\"0.001\">" +
                "<failure>my error</failure></testcase>");
        });

        chunk("skipped", () => {
            test.status = "skipped";
            writeTest(test);
            expect(write).to.be.calledOnce;
            expect(write.args[0][0]).to.be.equal(
                "<testcase classname=\"my test\" name=\"my test\" time=\"0.001\"><skipped/></testcase>");
        });

        chunk("passed", () => {
            test.status = "passed";
            writeTest(test);
            expect(write).to.be.calledOnce;
            expect(write.args[0][0]).to.be.equal(
                "<testcase classname=\"my test\" name=\"my test\" time=\"0.001\"/>");
        });
    });
});
