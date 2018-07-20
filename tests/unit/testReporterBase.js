"use strict";

const GlaceReporter = rewire("../../lib/reporter/base");
const TestCase = rewire("../../lib/testing").TestCase;

const methods = {};
const runner = {
    on: (name, cb) => methods[name] = cb,
};

suite("reporter/base", () => {
    const sandbox = sinon.createSandbox();

    before(() => {
        GlaceReporter.__set__("MochaReporter", function () {});
        new GlaceReporter(runner);
    });

    afterChunk(() => {
        GlaceReporter.__reset__();
        sandbox.restore();
    });

    test("on start", () => {
        let onStart;

        beforeChunk(() => {
            onStart = methods["start"];
        });

        chunk("does nothing if no reporters are registered", () => {
            GlaceReporter.__set__("reporters", []);
            onStart();
        });

        chunk("does nothing if reporters don't have start method", () => {
            GlaceReporter.__set__("reporters", [{}]);
            onStart();
        });

        chunk("calls reporters' start method if it exists", () => {
            const reporters = [{ start: sinon.spy() }];
            GlaceReporter.__set__("reporters", reporters);
            onStart();
            expect(reporters[0].start).to.be.calledOnce;
        });
    });

    test("on end", () => {
        let onEnd, conf, reporters, fs;

        beforeChunk(() => {
            onEnd = methods["end"];

            reporters = [];
            GlaceReporter.__set__("reporters", reporters);

            fs = {
                existsSync: sinon.stub().returns(false),
            };
            GlaceReporter.__set__("fs", fs);

            conf = {
                test: {
                    cases: [],
                },
                session: {
                    isPassed: false,
                },
                report: {
                    dir: "/path/to/report",
                },
            };
            GlaceReporter.__set__("CONF", conf);
        });

        chunk("tests session is failed if there are failed tests", () => {
            conf.test.cases.push({ status: TestCase.FAILED });
            onEnd();
            expect(conf.session.isPassed).to.be.false;
        });

        chunk("tests session is failed if there are session errors", () => {
            GlaceReporter.__set__("sessErrsNum", 1);
            onEnd();
            expect(conf.session.isPassed).to.be.false;
        });

        chunk("test session is passed if not failed tests and session errors", () => {
            conf.test.cases.push({ status: TestCase.PASSED });
            GlaceReporter.__set__("sessErrsNum", 0);
            onEnd();
            expect(conf.session.isPassed).to.be.true;
        });

        chunk("empty report folders are removed", () => {
            fs.existsSync.returns(true);
            const U = GlaceReporter.__get__("U");
            sandbox.stub(U, "clearEmptyFolders");

            onEnd();
            expect(U.clearEmptyFolders).to.be.calledOnce;
            expect(U.clearEmptyFolders.args[0][0]).to.be.equal("/path/to/report");
        });

        chunk("reporter end methods are called if they exist", () => {
            reporters.push({ end: sinon.spy() });
            onEnd();
            expect(reporters[0].end).to.be.calledOnce;
        });
    });
});
