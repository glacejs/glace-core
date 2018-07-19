"use strict";

const GlaceReporter = rewire("../../lib/reporter/base");

const methods = {};
const runner = {
    on: (name, cb) => methods[name] = cb,
};

suite("reporter/base", () => {

    before(() => {
        GlaceReporter.__set__("MochaReporter", function () {});
        new GlaceReporter(runner);
    });

    afterChunk(() => {
        GlaceReporter.__reset__();
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
});
